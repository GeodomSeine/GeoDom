import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_pynuts
from models.models import Pk
from core.logger import logger
from sqlalchemy import func

router = APIRouter(prefix="/pk", tags=["PK"])

PK_CACHE = {}  # Cache des PK pour optimiser les requêtes


async def fetch_pks_from_db(program: str, session: AsyncSession):
    """
    Récupère les données de la table des PKs pour un programme donné.

    Args:
        program (str): Nom du programme (schéma).
        session (AsyncSession): Session SQLAlchemy asynchrone.

    Returns:
        list[dict]: Liste des PKs sous forme de dictionnaires.
    """
    DynamicPk = Pk.create(program)

    try:
        query = select(
            DynamicPk.pk,
            DynamicPk.strahler,
            DynamicPk.id_obj,
            DynamicPk.obj_ord_pk,
            DynamicPk.code_bas,
            DynamicPk.catchment_id,
            func.ST_AsGeoJSON(func.ST_Transform(DynamicPk.the_geom, 4326)).label("geometry")
        )
        result = await session.execute(query)
        pk_data = result.fetchall()

        return [
            {
                "pk": row.pk,
                "strahler": row.strahler,
                "id_obj": row.id_obj,
                "obj_ord_pk": row.obj_ord_pk,
                "code_bas": row.code_bas,
                "catchment_id": row.catchment_id,
                "geometry": json.loads(row.geometry) if row.geometry else None
            }
            for row in pk_data
        ]
    except Exception as e:
        logger.error("Erreur lors de la récupération des PKs : %s", e)
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.get("/{program}")
async def get_pks(program: str):
    """
    Récupère la liste des PKs pour un programme donné sous forme de GeoJSON.

    Args:
        program (str): Nom du programme (schéma).

    Returns:
        dict: Données GeoJSON des PKs.
    """
    if program in PK_CACHE:
        return PK_CACHE[program]

    async with async_session_pynuts() as session:
        pk_data = await fetch_pks_from_db(program, session)

    geojson_data = {
        "type": "FeatureCollection",
        "name": f"PK ({program})",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}
        },
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "pk": pk["pk"],
                    "strahler": pk["strahler"],
                    "id_obj": pk["id_obj"],
                    "obj_ord_pk": pk["obj_ord_pk"],
                    "code_bas": pk["code_bas"],
                    "catchment_id": pk["catchment_id"]
                },
                "geometry": pk["geometry"]
            }
            for pk in pk_data if pk["geometry"] is not None
        ]
    }

    PK_CACHE[program] = geojson_data
    return geojson_data
