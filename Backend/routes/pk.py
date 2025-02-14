from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import async_session_pynuts
from models.models import Pk
import orjson

router = APIRouter(prefix="/pk", tags=["PK"])

async def fetch_pks_from_db(program: str, session: AsyncSession):
    """Récupère les PKs depuis PostgreSQL sous forme de flux GeoJSON."""
    DynamicPk = Pk.create(program) 

    try:
        query = select(DynamicPk.geojson_feature)
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
    """Générateur asynchrone pour streamer un GeoJSON."""
    async with async_session_pynuts() as session:
        first = True
        yield b'{"type": "FeatureCollection", "features": ['

        all_features = []

        async for feature in fetch_pks_from_db(program, session):
            if first:
                first = False
            yield feature
            all_features.append(feature)

        yield b"]}"


@router.get("/{program}")
async def get_pks(program: str):
    """Retourne les PKs sous forme de GeoJSON en streaming."""
    return StreamingResponse(
        geojson_stream(program),
        media_type="application/json"
    )
