import orjson
import redis
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import async_session_pynuts
from models.models import SenequeAesnHydro
from core.logger import logger

router = APIRouter(prefix="/hydro", tags=["Hydrographie"])

redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


async def fetch_hydro_from_db(program: str, session: AsyncSession):
    """
    Stream les données hydrographiques d'un programme depuis PostgreSQL.

    Args:
        program (str): Nom du programme (schéma).
        session (AsyncSession): Session SQLAlchemy asynchrone.

    Yields:
        dict: Une entité hydrographique sous forme de GeoJSON.
    """
    DynamicHydro = SenequeAesnHydro.create(program)

    try:
        query = select(DynamicHydro.geojson_feature)
        result = await session.stream(query)
        async for row in result:
            if row.geojson_feature:
                yield orjson.dumps(row.geojson_feature,default=str).encode()

    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


async def geojson_stream(program: str):
    """
    Générateur asynchrone pour envoyer un flux GeoJSON en streaming avec Redis.
    """
    cache_key = f"hydro:{program}"

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
            else:
                yield b","
            
            yield feature
            all_features.append(feature.decode())

        yield b"]}"

    redis_data = '{"type": "FeatureCollection", "features": [' + ",".join(all_features) + "]}"
    redis_client.setex(cache_key, 24*3600, redis_data)


@router.get("/{program}")
async def get_hydro(program: str):
    """
    Retourne les données hydrographiques d'un programme sous forme de GeoJSON en streaming, avec mise en cache Redis.
    """
    return StreamingResponse(
        geojson_stream(program),
        media_type="application/json"
    )
