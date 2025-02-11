import orjson
import redis
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import async_session_pynuts
from models.models import SenequeAesnHydro

router = APIRouter(prefix="/hydro", tags=["Hydrographie"])

try:
    redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
    redis_client.ping()
    redis_enabled = True
except (redis.ConnectionError, redis.TimeoutError):
    redis_client = None
    redis_enabled = False 


async def fetch_hydro_from_db(program: str, session: AsyncSession):
    """Récupère les données hydrographiques depuis PostgreSQL en streaming."""
    DynamicHydro = SenequeAesnHydro.create(program)

    try:
        query = select(DynamicHydro.geojson_feature)
        result = await session.stream(query)

        first = True
        async for row in result:
            if row.geojson_feature:
                if first:
                    first = False
                else:
                    yield b","
                yield orjson.dumps(row.geojson_feature)

    except Exception:
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


async def geojson_stream(program: str):
    """Générateur asynchrone pour envoyer un flux GeoJSON avec cache Redis.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Yields:
        bytes: Données hydrographiques au format GeoJSON.
    """
    cache_key = f"hydro:{program}"

    if redis_enabled:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            yield cached_data.encode()
            return

    async with async_session_pynuts() as session:
        first = True
        yield b'{"type": "FeatureCollection", "features": ['

        all_features = [] 

        async for feature in fetch_hydro_from_db(program, session):
            if first:
                first = False
            yield feature
            all_features.append(feature.decode())

        yield b"]}"

    if redis_enabled and all_features:
        redis_data = '{"type": "FeatureCollection", "features": [' + ",".join(all_features) + "]}"
        redis_client.setex(cache_key, 24 * 3600, redis_data)


@router.get("/{program}")
async def get_hydro(program: str):
    """Retourne les données hydrographiques d'un programme sous forme de GeoJSON en streaming.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Returns:
        StreamingResponse: Données hydrographiques au format GeoJSON.
    """
    return StreamingResponse(
        geojson_stream(program),
        media_type="application/json"
    )
