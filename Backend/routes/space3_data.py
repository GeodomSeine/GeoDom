import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_pynuts, load_output_table_sync
from models.models import Pk
from core.logger import logger

router = APIRouter(prefix="/dataspace3", tags=["Données pour l'espace 3"])

variable_color_classes = {
    "flow": ["#c6dbef", "#4292c6", "#2171b5", "#08519c", "#08306b"],
    "dic": ["#ffd6aa", "#cca381", "#956d56", "#703818", "#280000"],
    "no3": ["#d0f0c0", "#a2d149", "#5aaf3b", "#2a7b25", "#00441b"],
    "nh4": ["#d0f0c0", "#a2d149", "#5aaf3b", "#2a7b25", "#00441b"],
    "ta": ["#fdd49e", "#fdae61", "#f46d43", "#d73027", "#a50026"],
    "doc": ["#d0e1f9", "#73b3e7", "#1d91c0", "#065f99", "#023858"],
    "phy": ["#d0e1f9", "#73b3e7", "#1d91c0", "#065f99", "#023858"],
    "oxy": ["#d0e1f9", "#73b3e7", "#1d91c0", "#065f99", "#023858"],
    "ph": ["#e7e1ef", "#c994c7", "#dd1c77", "#980043", "#67001f"]
}

async def get_variable_thresholds(session: AsyncSession, table, variables, scenario_list, decade_list):
    """
    Récupère les valeurs minimales et maximales de chaque variable pour calculer les seuils dynamiques.
    """
    thresholds = {}
    for variable in variables:
        query = select(
            func.min(table.c[variable]).label("min_val"),
            func.max(table.c[variable]).label("max_val")
        ).where(
            table.c.scn.in_(scenario_list),
            table.c.dec.in_(decade_list)
        )
        result = await session.execute(query)
        min_val, max_val = result.fetchone()
        if min_val is None or max_val is None or min_val == max_val:
            min_val, max_val = 0, 1
        thresholds[variable] = [min_val + i * (max_val - min_val) / 5 for i in range(6)]
    return thresholds


def assign_color(value, variable, variable_thresholds):
    if variable not in variable_thresholds or variable not in variable_color_classes:
        return "#000000"
    thresholds = variable_thresholds[variable]
    colors = variable_color_classes[variable]
    for i in range(len(thresholds) - 1):
        if thresholds[i] <= value < thresholds[i + 1]:
            return colors[i]
    return colors[-1]


def dataspace3_to_GeoJson(program, result_data, variable_thresholds):
    return {
        "type": "FeatureCollection",
        "name": f"Pk ({program})",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "pk": data["pk"],
                    "strahler": data["strahler"],
                    "id_obj": data["id_obj"],
                    "obj_ord_pk": data["obj_ord_pk"],
                    "data": [
                        {
                            "variable": variable,
                            "p5": value["p5"],
                            "p50": value["p50"],
                            "p90": value["p90"],
                            "color_p5": assign_color(value["p5"], variable, variable_thresholds),
                            "color_p50": assign_color(value["p50"], variable, variable_thresholds),
                            "color_p90": assign_color(value["p90"], variable, variable_thresholds),
                        }
                        for variable_data in data["data"]
                        for variable, value in variable_data.items()
                    ]
                },
                "geometry": data["geometry"],
            }
            for data in result_data if data["geometry"] is not None
        ]
    }

@router.post("")
async def get_dataspace3(body: dict):
    """
    Récupère les données pour tous les PK du programme spécifié, sur les decades spécifiées.
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
                raise HTTPException(status_code=400, detail=f"Variable '{variable}' does not exist in the table.")

        scenario_list = [int(s) for s in scenarios]
        decade_list = [int(d) for d in decades]
        async with async_session_pynuts() as session:
            variable_thresholds = await get_variable_thresholds(session, table, variables, scenario_list, decade_list)
            query = (
                    select(
                        table.c.pk,
                        table.c.ord,
                        table.c.obj,
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
                    ).group_by(table.c.pk, table.c.ord, table.c.obj)
                    .order_by(table.c.pk, table.c.ord, table.c.obj)
            )
            result = await session.execute(query)
            data = result.fetchall()
            data_index = {}
            for row in data:
                key = f"{row.obj}_{row.ord}_{row.pk}"
                if key not in data_index:
                    data_index[key] = []
                row_data = {}
                for variable in variables:
                    row_data[variable] = {
                        "p5": getattr(row, f"{variable}_p5"),
                        "p50": getattr(row, f"{variable}_p50"),
                        "p90": getattr(row, f"{variable}_p90")
                    }
                data_index[key].append(row_data)
            DynamicPk = Pk.create(program)
            pk_query = select(
                DynamicPk.pk,
                DynamicPk.strahler,
                DynamicPk.id_obj,
                DynamicPk.obj_ord_pk,
                func.ST_AsGeoJSON(func.ST_Transform(DynamicPk.the_geom, 4326)).label("geometry")
            )
            pk_result = await session.execute(pk_query)
            all_pk_data = pk_result.fetchall()
            result_data = []
            for pk_data in all_pk_data:
                pk_data_dict = {
                    "pk": pk_data.pk,
                    "strahler": pk_data.strahler,
                    "id_obj": pk_data.id_obj,
                    "obj_ord_pk": pk_data.obj_ord_pk,
                    "geometry": json.loads(pk_data.geometry) if pk_data.geometry else None,
                    "data": data_index.get(pk_data.obj_ord_pk, [])
                }
                result_data.append(pk_data_dict)
            return dataspace3_to_GeoJson(program, result_data, variable_thresholds)
    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
