from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import async_session_pynuts
from models.models import Pk
import orjson

router = APIRouter(prefix="/pk", tags=["PK"])

async def fetch_pks_from_db(program: str, session: AsyncSession):
    """Récupère les PKs depuis PostgreSQL sous forme de flux GeoJSON.
    
    Args:
        program (str): Nom du programme (schéma).
        session (AsyncSession): Session de base de données.
        
    Exceptions:
        HTTPException: Erreur interne du serveur.
        
    Yields:
        bytes: Données GeoJSON
    """
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
    """Générateur asynchrone pour streamer un GeoJSON.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Yields:
        bytes
    """
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
    """Retourne les PKs sous forme de GeoJSON en streaming.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Returns:
        StreamingResponse: Données GeoJSON
    """
    return StreamingResponse(
        geojson_stream(program),
        media_type="application/json"
    )

async def get_pk_features(program: str):
    """Récupère les données pkmap d'un programme.
    
    Args:
        program (str): Nom du programme (schéma).
        
    Exceptions:
        HTTPException: Aucune donnée pkmap trouvée pour ce programme.
        HTTPException: Erreur interne du serveur.
        
    Returns:
        list: Liste des données hydro
    """
    async with async_session_pynuts() as session:
        DynamicPk = Pk.create(program) 
        try:
            query = select(DynamicPk.geojson_feature)
            result = await session.execute(query)
            geo_features = result.fetchall()
            if not geo_features:
                raise HTTPException(status_code=404, detail="Aucune donnée pkmap trouvée pour ce programme")
        except Exception:
            raise HTTPException(status_code=500, detail="Erreur interne du serveur")

        return [feature.geojson_feature for feature in geo_features]