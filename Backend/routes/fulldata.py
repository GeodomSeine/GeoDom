from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_pynuts, load_output_table_sync
from core.logger import logger
from models.models import Pk

router = APIRouter(prefix="/fulldata", tags=["Données - Strahler"])

@router.post("")
async def get_data_order_by_strahler(body: dict):
    """
    Récupère les données pour tous les PK du programme spécifié. Les données 
    seront regroupées par strahler. 

    Args:
        body (dict): Contient les clés  `program`, `scenarios`, `variables`.
    """
    try:
        program = body.get("program")
        scenarios = body.get("scenarios", [])
        variables = body.get("variables", [])

        if not program or not scenarios or not variables:
            raise HTTPException(status_code=400, detail="Missing required fields: program, scenarios, variables.")

        table = load_output_table_sync(program)

        for variable in variables:
            if variable not in table.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Variable '{variable}' does not exist in the table."
                )

        scenario_list = [int(s) for s in scenarios]
        
        async with async_session_pynuts() as session:
            result_data = {}
            query = (
                select(
                    table.c.ord, table.c.dec, 
                    *[
                        func.percentile_cont(0.05).within_group(table.c[variable].asc()).label(f"{variable}_p5")
                        for variable in variables
                    ] + [
                        func.percentile_cont(0.50).within_group(table.c[variable].asc()).label(f"{variable}_p50")
                        for variable in variables
                    ] + [
                        func.percentile_cont(0.90).within_group(table.c[variable].asc()).label(f"{variable}_p90")
                        for variable in variables
                    ]
                ).where(
                    table.c.scn.in_(scenario_list)
                ).group_by(table.c.ord, table.c.dec).order_by(table.c.ord, table.c.dec)
            )

            result = await session.execute(query)
            data = result.fetchall()

            for row in data:
                strahler = row.ord
                decade = row.dec
                row_data = {"decade": decade}
                for variable in variables:
                    row_data[f"{variable}_p5"] = getattr(row, f"{variable}_p5")
                    row_data[f"{variable}_p50"] = getattr(row, f"{variable}_p50")
                    row_data[f"{variable}_p90"] = getattr(row, f"{variable}_p90")
                if strahler not in result_data:
                    result_data[strahler] = {"data": []}
                result_data[strahler]["data"].append(row_data)

            if not result_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No data found for program '{program}', scenarios {scenarios}, and variables {variables}.",
                )
            
            return result_data
    except HTTPException as e:
        logger.error("Error fetching data: %s", e.detail)
        raise e
    except AssertionError as e:
        logger.error(f"AttributeError: {str(e)}")
        raise HTTPException(status_code=404, detail=f"No data found : Scenarios '{scenarios}' does not exist in the table.")
    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
    
    
