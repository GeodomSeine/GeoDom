import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_pynuts
from models.models import SenequeAesnBasin
from core.logger import logger
from sqlalchemy import func
import geopandas as gpd

router = APIRouter(prefix="/bassin", tags=["Bassins hydrographiques"])


async def fetch_basin_from_db(program: str, session: AsyncSession):
    """
    Récupère les données des bassins hydrographiques pour un programme donné.

    Args:
        program (str): Nom du programme (schéma).
        session (AsyncSession): Session SQLAlchemy asynchrone.

    Returns:
        list[dict]: Liste des bassins sous forme de dictionnaires.
    """
    DynamicBasin = SenequeAesnBasin.create(program)

    try:
        query = select(
            DynamicBasin.area_km2,
            func.ST_AsGeoJSON(func.ST_Transform(DynamicBasin.geom, 4326)).label("geometry")
        )
        result = await session.execute(query)
        basin_data = result.fetchall()

        return [
            {
                "area_km2": row.area_km2,
                "geometry": json.loads(row.geometry) if row.geometry else None
            }
            for row in basin_data
        ]
    except Exception as e:
        logger.error("Erreur lors de la récupération des bassins hydrographiques : %s", e)
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.get("/{program}")
async def get_basin(program: str):
    """
    Récupère la liste des bassins hydrographiques pour un programme donné sous forme de GeoJSON.

    Args:
        program (str): Nom du programme (schéma).

    Returns:
        dict: Données GeoJSON des bassins hydrographiques.
    """
    async with async_session_pynuts() as session:
        basin_data = await fetch_basin_from_db(program, session)

    geojson_data = {
        "type": "FeatureCollection",
        "name": f"Bassins ({program})",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}
        },
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "area_km2": basin["area_km2"]
                },
                "geometry": basin["geometry"]
            }
            for basin in basin_data if basin["geometry"] is not None
        ]
    }

    return geojson_data

async def get_bassin_geopackage(program: str):
    """
    Exporte les données du bassin d'un programme dans un fichier GeoPackage.

    Args:
        program (str): Nom du programme (schéma).
    """
    async with async_session_pynuts() as session:
        print("Export")
        basin_data = await fetch_basin_from_db(program, session)
        
        return [
            {
                "type": "Feature",
                "properties": {
                },
                "geometry": basin["geometry"]
            }
            for basin in basin_data if basin["geometry"] is not None
        ]
