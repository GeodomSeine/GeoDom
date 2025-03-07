from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, func
from core.logger import logger
from models.models import VarCompartment


async def fetch_varcompartment_from_db(session: AsyncSession, variables: list[str])->dict:
    """
    Récupère tous les compartiments pour une variable donnée.

    Args:
        session (AsyncSession): Session SQLAlchemy asynchrone.
        variable (str): Nom de la variable.

    Exceptions:
        Exception: Erreur lors de la récupération des compartiments.

    Returns:
        list[dict]: Liste des compartiments sous forme de dictionnaires.
    """
    try:
        query = select(
            VarCompartment.var_code,
            VarCompartment.var_name,
            VarCompartment.unit_short
        ).where(
            and_(
                VarCompartment.comp_name == 'watercolumn',
                func.lower(VarCompartment.var_code).in_([func.lower(variable) for variable in variables])
            )
        ).order_by(VarCompartment.var_code)
        result = await session.execute(query)
        varCompartment = result.fetchall()        
        return [
            {
                "var_code": row.var_code.upper(),
                "var_name": row.var_name,
                "unit_short": row.unit_short
            }
            for row in varCompartment
        ]
    except Exception as e:
        logger.error("Erreur lors de la récupération des compartiments : %s", e)
    