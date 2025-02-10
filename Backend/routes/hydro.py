import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_pynuts
from models.models import SenequeAesnHydro
from core.logger import logger
from sqlalchemy import func

router = APIRouter(prefix="/hydro", tags=["Hydrographie"])

async def fetch_hydro_from_db(program: str, session: AsyncSession):
    """
    Récupère les données hydrographiques d'un programme.

    Args:
        program (str): Nom du programme (schéma).
        session (AsyncSession): Session SQLAlchemy asynchrone.

    Returns:
        list[dict]: Liste des entités hydrographiques sous forme de dictionnaires.
    """
    DynamicHydro = SenequeAesnHydro.create(program)

    try:
        query = select(
            DynamicHydro.id_hyd,
            DynamicHydro.libriv,
            DynamicHydro.strahler,
            DynamicHydro.sbv_km2,
            func.ST_AsGeoJSON(func.ST_Transform(DynamicHydro.geom, 4326)).label("geometry")
        )
        result = await session.execute(query)
        hydro_data = result.fetchall()

        return [
            {
                "id_hyd": row.id_hyd,
                "nom": row.libriv,
                "strahler": row.strahler,
                "bassin_km2": row.sbv_km2,
                "geometry": json.loads(row.geometry) if row.geometry else None
            }
            for row in hydro_data
        ]
    except Exception as e:
        logger.error("Erreur lors de la récupération des hydrographies : %s", e)
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.get("/{program}")
async def get_hydro(program: str):
    """
    Récupère la liste des entités hydrographiques pour un programme donné sous forme de GeoJSON.

    Args:
        program (str): Nom du programme (schéma).

    Returns:
        dict: Données GeoJSON des entités hydrographiques.
    """
    async with async_session_pynuts() as session:
        hydro_data = await fetch_hydro_from_db(program, session)

    geojson_data = {
        "type": "FeatureCollection",
        "name": f"Hydrographie ({program})",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}
        },
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id_hyd": hydro["id_hyd"],
                    "nom": hydro["nom"],
                    "strahler": hydro["strahler"],
                    "bassin_km2": hydro["bassin_km2"]
                },
                "geometry": hydro["geometry"]
            }
            for hydro in hydro_data if hydro["geometry"] is not None
        ]
    }

    return geojson_data
