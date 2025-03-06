import zipfile
import orjson
import redis
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from routes.stationsnap import get_station_snap_geojson
from routes.bassin import get_bassin_geopackage
from core.database import async_session_pynuts
from routes.pk import get_pk_features
from models.models import SenequeAesnHydro
import os
import time
import geopandas as gpd
from zipfile import ZipFile
from fastapi.responses import FileResponse
import locale
import json

router = APIRouter(prefix="/hydro", tags=["Hydrographie"])
redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
redis_client = redis.from_url(redis_url)
DATAVIZ_PATH = "./resources/dataviz"

locale.setlocale(locale.LC_ALL, 'C')

async def fetch_hydro_from_db(program: str, session: AsyncSession):
    """Récupère les données hydrographiques depuis PostgreSQL en streaming."""
    DynamicHydro = SenequeAesnHydro.create(program)

    try:
        query = select(DynamicHydro.geojson_feature)
        result = await session.stream(query)
        first = True
        async for batch in result.partitions(7000):
            for row in batch:
                if row.geojson_feature:
                    if first:
                        first = False
                    else:
                        yield b","
                    yield orjson.dumps(row.geojson_feature)

    except Exception:
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

async def geojson_stream(program: str):
    """Générateur asynchrone pour envoyer un flux GeoJSON depuis PostgreSQL ou depuis le cache Redis."""
    if redis_client:
        try:
            cached_data = redis_client.get(program)
            if cached_data:
                yield cached_data
                return
        except redis.exceptions.RedisError as e:
            pass

    async with async_session_pynuts() as session:
        first = True
        yield b'{"type": "FeatureCollection", "features": ['

        all_features = []

        async for feature in fetch_hydro_from_db(program, session):
            if first:
                first = False
            yield feature
            all_features.append(feature)

        yield b"]}"

        if redis_client:
            try:
                redis_client.setex(program, 3600, b"".join(all_features))
            except redis.exceptions.RedisError as e:
                pass

@router.get("/{program}")
async def get_hydro(program: str):
    """Retourne les données hydrographiques d'un programme sous forme de GeoJSON en streaming."""
    return StreamingResponse(
        geojson_stream(program),
        media_type="application/json"
    )

async def get_geojson_features(program: str):
    """Récupère les données hydrographiques d'un programme.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Returns:
        list: Liste des données hydro
    """
    async with async_session_pynuts() as session:
        DynamicHydro = SenequeAesnHydro.create(program)
        try:
            query = select(DynamicHydro.geojson_feature)
            result = await session.execute(query)
            geo_features = result.fetchall()
            if not geo_features:
                raise HTTPException(status_code=404, detail="Aucune donnée hydrographique trouvée pour ce programme")
        except Exception:
            raise HTTPException(status_code=500, detail="Erreur interne du serveur")

        return [feature.geojson_feature for feature in geo_features]


@router.get("/export/{program}")
async def export_geopackage(program: str):
    """
    Exporte les données hydrographiques d'un programme sous forme de GeoPackage.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Returns:
        StreamingResponse: Fichier GeoPackage
    """
    hydro_file_path = f"/tmp/{program}_hydro.gpkg"
    bassin_file_path = f"/tmp/{program}_bassin.gpkg"
    station_file_path = f"/tmp/{program}_station_snap.geojson"
    pkmap_file_path = f"/tmp/{program}_pkmap.gpkg"
    zipfile_path = f"/tmp/{program}.zip"
    
    """
        Check if the zip file is already created
        If the file is older than 10 minutes, delete it
        else return the existing file
    """
    if os.path.exists(zipfile_path):
        if (os.path.getmtime(zipfile_path) < (time.time() - 600)):
            os.remove(zipfile_path)     
        else:
            return FileResponse(zipfile_path, media_type='application/zip', filename=f"{program}.zip")
        
    # Get the hydro features
    geo_features = await get_geojson_features(program)
    gdf = gpd.GeoDataFrame.from_features(geo_features)
    gdf.to_file(hydro_file_path, driver="GPKG")
      
    # Get the bassin features    
    basin_features = await get_bassin_geopackage(program)
    gdf = gpd.GeoDataFrame.from_features(basin_features)
    gdf.to_file(bassin_file_path, driver="GPKG")
    
    # Get the station snap features
    station_feature = await get_station_snap_geojson(program)
    gdf = gpd.GeoDataFrame.from_features(station_feature)
    gdf.to_file(station_file_path, driver="GPKG")
    
    pk_map_feature = await get_pk_features(program)
    gdf = gpd.GeoDataFrame.from_features(pk_map_feature)
    gdf.to_file(pkmap_file_path, driver="GPKG")

    # Create the metadata
    metadata = {
        "name": f"{program}",
        "date": time.strftime("%A %d %B %Y %H:%M:%S", time.localtime())
    }
    
    # Create the zip file
    with ZipFile(zipfile_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(pkmap_file_path, f"{program}_pkmap.gpkg")
        zipf.write(f"{DATAVIZ_PATH}/{program}/pk_map.sld", f"{program}_pkmap.sld")
        zipf.write(hydro_file_path, f"{program}_hydro.gpkg")
        zipf.write(f"{DATAVIZ_PATH}/{program}/seneque_aesn_hydro.sld", f"{program}_hydro.sld")
        zipf.write(bassin_file_path, f"{program}_bassin.gpkg")
        zipf.write(f"{DATAVIZ_PATH}/{program}/seneque_aesn_hydro_basin.sld", f"{program}_hydro_basin.sld")
        zipf.write(station_file_path, f"{program}_station_snap.gpkg")
        zipf.write(f"{DATAVIZ_PATH}/{program}/stations_donuts.sld", f"{program}_stations.sld")
        zipf.writestr("metadata.json", json.dumps(metadata, ensure_ascii=False, indent=2))
        os.remove(hydro_file_path)
        os.remove(bassin_file_path)
        os.remove(station_file_path)
        os.remove(pkmap_file_path)
    return FileResponse(zipfile_path, media_type='application/zip', filename=f"{program}.zip")
            