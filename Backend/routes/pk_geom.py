import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_pynuts
from models.models import Pk
from core.logger import logger

router = APIRouter(prefix="/pk_geom", tags=["PK - Géométrie"])


async def fetch_pk_geom_from_db(program: str, obj_ord_pk: str, session: AsyncSession):
    """
    Récupère la géométrie d'un PK spécifique pour un programme donné.

    Args:
        program (str): Nom du programme (schéma).
        obj_ord_pk (str): Identifiant unique du PK.
        session (AsyncSession): Session SQLAlchemy asynchrone.

    Returns:
        dict: Géométrie du PK sous forme de GeoJSON.
    """
    DynamicPk = Pk.create(program)

    try:
        query = select(
            DynamicPk.geojson_feature
        ).where(DynamicPk.obj_ord_pk == obj_ord_pk)

        result = await session.execute(query)
        pk_data = result.fetchone()

        if not pk_data:
            raise HTTPException(status_code=404, detail="PK non trouvé.")
        return pk_data.geojson_feature
        
    except Exception as e:
        logger.error("Erreur lors de la récupération de la géométrie du PK : %s", e)
        raise HTTPException(status_code=500, detail=str(e))


async def fetch_pk_geom_by_strahler(program: str, strahler: int, session: AsyncSession):
    """
    Récupère la géométrie de tous les PK d'un programme ayant un certain niveau de Strahler.

    Args:
        program (str): Nom du programme (schéma).
        strahler (str): Niveau de Strahler.
        session (AsyncSession): Session SQLAlchemy asynchrone.

    Returns:
        dict: Géométrie des PK sous forme de GeoJSON.
    """
    DynamicPk = Pk.create(program)

    try:
        query = select(
            DynamicPk.geojson_feature
        ).where(DynamicPk.strahler == strahler)

        result = await session.execute(query)
        pk_data = result.fetchall()
        geojson_data = {
            "type": "FeatureCollection",
            "features": [row.geojson_feature for row in pk_data]
        }
        return geojson_data

    except Exception as e:
        logger.error("Erreur lors de la récupération de la géométrie des PK : %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{program}/{obj_ord_pk}")
async def get_pk_geom(program: str, obj_ord_pk: str):
    """
    Récupère la géométrie d'un PK spécifique pour un programme donné.

    Args:
        program (str): Nom du programme.
        obj_ord_pk (str): Identifiant unique du PK.

    Returns:
        dict: Géométrie du PK sous forme de GeoJSON.
    """
    async with async_session_pynuts() as session:
        data = await fetch_pk_geom_from_db(program, obj_ord_pk, session)

    return data


@router.get("/strahler/{program}/{strahler}")
async def get_pk_geom_by_strahler(program: str, strahler: int):
    """
    Récupère la géométrie de tous les PK d'un programme ayant un certain niveau de Strahler.

    Args:
        program (str): Nom du programme.
        strahler (str): Niveau de Strahler.

    Returns:
        dict: Géométrie des PK sous forme de GeoJSON.
    """
    async with async_session_pynuts() as session:
        data = await fetch_pk_geom_by_strahler(program, strahler, session)

    return data