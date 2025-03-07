import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_pynuts, load_output_table_sync
from models.models import Pk
from core.logger import logger

router = APIRouter(prefix="/data", tags=["Données"])

@router.post("")
async def get_data(body: dict):
    """
    Récupère les percentiles 5, 50 (médiane), et 90 pour une ou plusieurs variables sur toutes les décades,
    en agrégeant toutes les données par décennie pour un ou plusieurs scénarios et plusieurs PKs.
    
    Args:
        body (dict): Contient les clés `program`, `scenarios`, `variables`, et `pk`.
        
    Exceptions :
        HTTPException: Missing required fields: program, scenarios, variables, pk.
        HTTPException: Variable '{variable}' does not exist in the table.
        HTTPException: No data found for program '{program}', scenarios {scenarios}, variables {variables}, and pk list.
        HTTPException: No data found : Scenarios '{scenarios}' does not exist in the table.
        HTTPException: Internal server error

    Returns:
        dict: Les données regroupées par `obj_ord_pk`.
    """
    try:
        # Extraire les données du body
        program = body.get("program")
        scenarios = body.get("scenarios", [])
        variables = body.get("variables", [])
        pk_list = body.get("pk", [])

        if not program or not scenarios or not variables or not pk_list:
            raise HTTPException(status_code=400, detail="Missing required fields: program, scenarios, variables, pk.")

        # Charger la table dynamiquement
        table = load_output_table_sync(program)

        # Vérifier que les variables existent dans la table
        for variable in variables:
            if variable not in table.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Variable '{variable}' does not exist in the table."
                )

        # Construire la liste des scénarios
        scenario_list = [int(s) for s in scenarios]

        async with async_session_pynuts() as session:
            result_data = {}

            for pk_entry in pk_list:
                id_obj = pk_entry.get("id_obj")
                strahler = pk_entry.get("strahler")
                pk = pk_entry.get("pk")
                obj_ord_pk = pk_entry.get("obj_ord_pk")

                if not all([id_obj, strahler, pk, obj_ord_pk]):
                    logger.warning(f"Invalid pk entry: {pk_entry}")
                    continue

                # Construire la requête pour chaque PK
                query = (
                    select(
                        table.c.dec,
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
                    )
                    .where(
                        table.c.scn.in_(scenario_list),
                        table.c.pk == pk,
                        table.c.obj == id_obj,
                        table.c.ord == strahler
                    )
                    .group_by(table.c.dec)
                    .order_by(table.c.dec)
                )

                # Exécuter la requête
                result = await session.execute(query)
                data = result.fetchall()

                # Si aucune donnée n'est trouvée, lever une exception 404
                if not data:
                    raise HTTPException(
                        status_code=404,
                        detail=f"No data found for program '{program}', scenarios {scenarios}, variables {variables}, and pk list.",
                    )

                # Formater les données
                formatted_data = []
                for row in data:
                    row_data = {"decade": row.dec}
                    for variable in variables:
                        row_data[f"{variable}_p5"] = getattr(row, f"{variable}_p5")
                        row_data[f"{variable}_p50"] = getattr(row, f"{variable}_p50")
                        row_data[f"{variable}_p90"] = getattr(row, f"{variable}_p90")
                    formatted_data.append(row_data)

                result_data[obj_ord_pk] = {"data": formatted_data}

            return result_data

    except HTTPException as e:
        # Si une HTTPException est levée, la propager
        logger.error(f"HTTPException: {e.detail}")
        raise e
    except AttributeError as e:
        # Si un scenario n'existe pas dans la table, lever une exception 404
        logger.error(f"AttributeError: {str(e)}")
        raise HTTPException(status_code=404, detail=f"No data found : Scenarios '{scenarios}' does not exist in the table.")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")