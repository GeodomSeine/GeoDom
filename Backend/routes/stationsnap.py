import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, distinct
from core.database import async_session_pynuts, async_session_donuts
from models.models import Pk, PkStation, StationSnap
from core.logger import logger

router = APIRouter(prefix="/stationsnap", tags=["StationSnap"])


async def fetch_station_snap_from_db(program: str, session_pynuts: AsyncSession, session_donuts: AsyncSession):
    """
    Récupère les données StationSnap filtrées par les relations entre PK et PkStation.

    Args:
        program (str): Le schéma à utiliser.
        session_pynuts (AsyncSession): Session pour la base PYNUTS.
        session_donuts (AsyncSession): Session pour la base DONUTS.

    Returns:
        list[dict]: Liste des stations au format GeoJSON.
    """
    DynamicPk = Pk.create(program)
    DynamicPkStation = PkStation.create(program)

    try:
        # Requête pour récupérer les stations associées aux PKs
        pk_station_query = (
            select(distinct(DynamicPkStation.station_id))
            .join(
                DynamicPk,
                (DynamicPk.strahler == DynamicPkStation.strahler) &
                (DynamicPk.id_obj == DynamicPkStation.id_objects) &
                (DynamicPk.pk == DynamicPkStation.pk)
            )
        )
        pk_station_results = await session_pynuts.execute(pk_station_query)
        station_ids = [row[0] for row in pk_station_results.fetchall()]

        if not station_ids:
            raise HTTPException(status_code=404, detail="No stations found.")

        # Récupérer les données des stations
        station_snap_query = (
            select(
                StationSnap.station_id,
                StationSnap.code,
                StationSnap.cntry_iso,
                StationSnap.upstream_km2,
                func.ST_AsGeoJSON(func.ST_Transform(StationSnap.geom3035snap, 4326)).label("geometry")
            )
            .where(StationSnap.station_id.in_(station_ids))
        )
        station_snap_results = await session_donuts.execute(station_snap_query)
        station_snaps = station_snap_results.fetchall()

        return [
            {
                "station_id": snap.station_id,
                "code": snap.code,
                "cntry_iso": snap.cntry_iso,
                "upstream_km2": snap.upstream_km2,
                "geometry": json.loads(snap.geometry) if snap.geometry else None
            }
            for snap in station_snaps if snap.geometry is not None
        ]

    except Exception as e:
        logger.error("Erreur lors de la récupération des stations snap : %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{program}")
async def get_station_snap_geojson(program: str):
    """
    Récupère les données StationSnap filtrées et les retourne en GeoJSON.

    Args:
        program (str): Nom du programme.

    Returns:
        dict: Données GeoJSON des stations.
    """
    async with async_session_pynuts() as session_pynuts, async_session_donuts() as session_donuts:
        station_data = await fetch_station_snap_from_db(program, session_pynuts, session_donuts)

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "station_id": station["station_id"],
                    "code": station["code"],
                    "cntry_iso": station["cntry_iso"],
                    "upstream_km2": station["upstream_km2"]
                },
                "geometry": station["geometry"]
            }
            for station in station_data
        ]
    }