import json
import pandas as pd
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_pynuts, load_output_table_sync
from models.models import Pk
from core.logger import logger
import os

router = APIRouter(prefix="/dataprofil", tags=["Données pour les graphiques de profils en long"])


RESOURCES_PATH = "./resources"
VARIABLE_FOLDER = "variables"
JSON_FILENAME = "variables.json"

def load_variable_config():
    file_path = os.path.join(RESOURCES_PATH, VARIABLE_FOLDER, JSON_FILENAME)

    with open(file_path, "r") as file:
        return json.load(file)


def generate_class_intervals(values, nb_classes, colors):
    if len(values) < nb_classes:
        nb_classes = len(values) 
    classes_bins = pd.qcut(values, q=nb_classes, retbins=True)[1]
    intervals = []
    for i in range(len(classes_bins) - 1):
        intervals.append({
            "range": [classes_bins[i], classes_bins[i + 1]],
            "color": colors[i] if i < len(colors) else "#000000"
        })
    return intervals


variable_config = load_variable_config()


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
        decade_list = list(range(int(decades[0]), int(decades[1]) + 1))
        
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
async def get_data(body: dict):
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


@router.post("/formap")
async def get_data_formap(body: dict):
    """
    Récupère les percentiles 5, 50 (médiane), et 90 pour toutes les variables sur toutes les décades,
    en agrégeant toutes les données par `obj_ord_pk` pour tous les PK du programme spécifié.
    
    Args:
        body (dict): Contient les clés `program`, `scenarios`, `variables`, et `decades`.

    Returns:
        dict: Les données regroupées par `obj_ord_pk` avec une légende des classes de valeurs.
    """
    try:
        program = body.get("program")
        scenarios = body.get("scenarios", [])
        variables = body.get("variables", [])
        decades = body.get("decades", [])

        if not program or not scenarios or not variables or not decades:
            raise HTTPException(status_code=400, detail="Missing required fields: program, scenarios, variables, decades.")

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
            legend_data = {}

            query = (
                select(
                    table.c.obj, table.c.ord, table.c.pk,
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
                ).group_by(table.c.obj, table.c.ord, table.c.pk)
                .order_by(table.c.obj, table.c.ord, table.c.pk)
            )

            result = await session.execute(query)
            data = result.fetchall()

            value_dict = {var: [] for var in variables}

            for row in data:
                obj_ord_pk = f"{row.obj}_{row.ord}_{row.pk}"
                result_data[obj_ord_pk] = {}
                for variable in variables:
                    result_data[obj_ord_pk][f"{variable}_p5"] = getattr(row, f"{variable}_p5")
                    result_data[obj_ord_pk][f"{variable}_p50"] = getattr(row, f"{variable}_p50")
                    result_data[obj_ord_pk][f"{variable}_p90"] = getattr(row, f"{variable}_p90")
                    if getattr(row, f"{variable}_p50") is not None:
                        value_dict[variable].append(getattr(row, f"{variable}_p50"))

            for variable in variables:
                var_config = variable_config.get(variable, {})
                default_config = variable_config.get("default", {})
                default_classification = default_config.get("classification", "quantile")
                default_nb_classes = default_config.get("nb_classes", 5)
                default_colors = default_config.get("colors", [])

                if var_config.get("classification") == "sld":
                    legend_data[variable] = {"sld": True}
                else:
                    if value_dict[variable]:
                        legend_data[variable] = {
                            "sld": False,
                            "classification": var_config.get("classification", default_classification),
                            "nb_classes": var_config.get("nb_classes", default_nb_classes),
                            "colors": generate_class_intervals(
                                value_dict[variable], 
                                var_config.get("nb_classes", default_nb_classes), 
                                var_config.get("colors", default_colors)
                            )
                        }

            if not result_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No data found for program '{program}', scenarios {scenarios}, and variables {variables}."
                )

            return {"data": result_data, "legend": legend_data}
    
    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
