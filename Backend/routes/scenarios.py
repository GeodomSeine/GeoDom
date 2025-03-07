from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_pynuts
from models.models import Scenario
from core.logger import logger

router = APIRouter(prefix="/scenarios", tags=["Scénarios"])


async def fetch_scenarios_from_db(session: AsyncSession):
    """
    Récupère tous les scénarios disponibles.

    Args:
        session (AsyncSession): Session SQLAlchemy asynchrone.
        
    Exceptions:
        HTTPException: Erreur lors de la récupération des scénarios.

    Returns:
        list[dict]: Liste des scénarios sous forme de dictionnaires.
    """
    try:
        query = select(
            Scenario.id,
            Scenario.codescn,
            Scenario.description,
            Scenario.obs_year
        )
        result = await session.execute(query)
        scenarios = result.fetchall()

        return [
            {
                "id": row.id,
                "code": row.codescn,
                "description": row.description,
                "year": row.obs_year
            }
            for row in scenarios
        ]
    except Exception as e:
        logger.error("Erreur lors de la récupération des scénarios : %s", e)
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.get("")
async def get_scenarios():
    """
    Récupère la liste de tous les scénarios disponibles.
    
    Exceptions:
        HTTPException: Aucun scénario trouvé.

    Returns:
        dict: Liste des scénarios.
    """
    async with async_session_pynuts() as session:
        scenarios = await fetch_scenarios_from_db(session)

    if not scenarios:
        raise HTTPException(status_code=404, detail="Aucun scénario trouvé.")

    return {"scenarios": scenarios}
