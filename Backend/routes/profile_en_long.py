import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_pynuts, load_output_table_sync
from models.models import Pk
from core.logger import logger

router = APIRouter(prefix="/dataprofil", tags=["Données pour les graphiques de profils en long"])


@router.post("/fulldata")
async def get_data_order_by_strahler(body: dict):
    """
    Récupère les données pour tous les PK du programme spécifié. Les données 
    seront regroupées par strahler. 

    Args:
        body (dict): Contient les clés  `program`, `scenarios`, `variables`, `decades`.
    """
    try:
        program = body.get("program")
        scenarios = body.get("scenarios", [])
        variables = body.get("variables", [])
        decades = body.get("decades", [])

        if not program or not scenarios or not variables or not decades:
            raise HTTPException(status_code=400, detail="Missing required fields: program, scenarios, variables.")

        table = load_output_table_sync(program)

        for variable in variables:
            if variable not in table.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Variable '{variable}' does not exist in the table."
                )

        scenario_list = [int(s) for s in scenarios]
        decade_list = [int(d) for d in decades]
        
        async with async_session_pynuts() as session:
            result_data = {}
            query = (
                select(
                    table.c.ord, 
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
                    table.c.scn.in_(scenario_list), 
                    table.c.dec.in_(decade_list)
                ).group_by(table.c.ord).order_by(table.c.ord)
            )

            result = await session.execute(query)
            data = result.fetchall()

            for row in data:
                strahler = row.ord
                result_data[strahler] = {}
                for variable in variables:
                    result_data[strahler][f"{variable}_p5"] = getattr(row, f"{variable}_p5")
                    result_data[strahler][f"{variable}_p50"] = getattr(row, f"{variable}_p50")
                    result_data[strahler][f"{variable}_p90"] = getattr(row, f"{variable}_p90")

            if not result_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No data found for program '{program}', scenarios {scenarios}, and variables {variables}.",
                )
            
            return result_data
    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/data")
async def get_data_good(body: dict):
    """
    Récupère les percentiles 5, 50 (médiane), et 90 pour une ou plusieurs variables sur toutes les décades,
    en agrégeant toutes les données par décennie pour un ou plusieurs scénarios et plusieurs PKs.
    
    Args:
        body (dict): Contient les clés `program`, `scenarios`, `variables`, et `pk`.

    Returns:
        dict: Les données regroupées par `obj_ord_pk`.
    """
    try:
        # Extraire les données du body
        program = body.get("program")
        scenarios = body.get("scenarios", [])
        variables = body.get("variables", [])
        pk_list = body.get("pk", [])
        decades = body.get("decades", [])

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
        decade_list = [int(d) for d in decades]

        async with async_session_pynuts() as session:
            result_data = {}

            for pk_entry in pk_list:
                id_obj = pk_entry.get("id_obj")
                strahler = pk_entry.get("strahler")
                pk = pk_entry.get("pk")
                obj_ord_pk = pk_entry.get("obj_ord_pk")

                if not all([id_obj, strahler, pk, obj_ord_pk]):
                    continue

                # Construire la requête pour chaque PK
                query = (
                    select(
                        table.c.obj,
                        table.c.ord, 
                        table.c.pk,
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
                        table.c.pk == pk,
                        table.c.obj == id_obj,
                        table.c.ord == strahler,
                        table.c.scn.in_(scenario_list),
                        table.c.dec.in_(decade_list)
                    )
                    .group_by(table.c.obj, table.c.ord, table.c.pk)
                    .order_by(table.c.obj, table.c.ord, table.c.pk)
                )

                # Exécuter la requête
                result = await session.execute(query)
                data = result.fetchall()
                logger.info(f"Data for {obj_ord_pk} : {data}")

                for row in data:
                    obj_ord_pk = f"{row.obj}_{row.ord}_{row.pk}"
                    result_data[obj_ord_pk] = {}
                    for variable in variables:
                        result_data[obj_ord_pk][f"{variable}_p5"] = getattr(row, f"{variable}_p5")
                        result_data[obj_ord_pk][f"{variable}_p50"] = getattr(row, f"{variable}_p50")
                        result_data[obj_ord_pk][f"{variable}_p90"] = getattr(row, f"{variable}_p90")


            if not result_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No data found for program '{program}', scenarios {scenarios}, variables {variables}, and pk list.",
                )

            return result_data

    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))