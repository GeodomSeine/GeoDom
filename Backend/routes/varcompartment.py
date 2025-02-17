from fastapi import APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from core.database import async_session_pynuts
from core.logger import logger
from models.models import VarCompartment

router = APIRouter(prefix="/varcompartment", tags=["VarCompartment"])


async def fetch_varcompartment_from_db(session: AsyncSession, variable: str):
    """
    Récupère tous les compartiments pour une variable donnée.

    Args:
        session (AsyncSession): Session SQLAlchemy asynchrone.
        variable (str): Nom de la variable.

    Returns:
        list[dict]: Liste des compartiments sous forme de dictionnaires.
    """
    try:
        query = select(
            VarCompartment.var_name,
            VarCompartment.unit_short
        ).where(
            and_(
                VarCompartment.comp_name == 'watercolumn',
                func.lower(VarCompartment.var_code) == func.lower(variable)
            )
        )
        
        result = await session.execute(query)
        varCompartment = result.fetchall()

        return [
            {
                "var_name": row.var_name,
                "unit_short": row.unit_short
            }
            for row in varCompartment
        ]
    except Exception as e:
        logger.error("Erreur lors de la récupération des compartiments : %s", e)
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")


@router.get("/{variable}")
async def get_varcompartment(variable: str):
    """
    Récupère la liste de tous les compartiments pour une variable donnée.

    Args:
        variable (str): Nom de la variable.

    Returns:
        dict: Liste des compartiments.
    """
    async with async_session_pynuts() as session:
        varCompartment = await fetch_varcompartment_from_db(session, variable)

    if not varCompartment:
        raise HTTPException(status_code=404, detail="Aucun compartiment trouvé.")

    return {"varCompartment": varCompartment}