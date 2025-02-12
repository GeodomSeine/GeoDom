import orjson
import redis
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import async_session_pynuts
from models.models import SenequeAesnHydro

router = APIRouter(prefix="/hydro", tags=["Hydrographie"])

redis_client = redis.from_url("redis://localhost:6379")

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
