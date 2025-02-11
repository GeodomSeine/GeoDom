import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_donuts, async_session_pynuts
from models.models import Pk, PkStation, Scenario, Measurement
from core.logger import logger
import os

JSON_VARIABLES_PATH = "./routes/variables_pynuts_donuts.json"
if not os.path.exists(JSON_VARIABLES_PATH):
    logger.warning(f"Json variables file not found")

with open(JSON_VARIABLES_PATH, "r", encoding="utf-8") as json_file:
    pynuts_to_donuts = json.load(json_file)

router = APIRouter(prefix="/data_donuts", tags=["Données d'observation"])


async def get_station_id_by_pk(program: str, session_pynuts: AsyncSession, pk_list: list):
    """
    Récupère les stations associées à chaque PK et sélectionne la plus proche (snap_dist_m minimale).

    Args:
        program (str): Le schéma à utiliser.
        session_pynuts (AsyncSession): Session pour la base PYNUTS.
        pk_list (list): Liste des PKs à traiter.

    Returns:
        dict: Dictionnaire associant chaque obj_ord_pk à son station_id le plus proche.
    """
    DynamicPk = Pk.create(program)
    DynamicPkStation = PkStation.create(program)

    try:
        pk_station_query = (
            select(
                DynamicPkStation.pk,
                DynamicPkStation.station_id,
                DynamicPkStation.snap_dist_m,
                DynamicPk.obj_ord_pk
            )
            .join(
                DynamicPk,
                (DynamicPk.strahler == DynamicPkStation.strahler) &
                (DynamicPk.id_obj == DynamicPkStation.id_objects) &
                (DynamicPk.pk == DynamicPkStation.pk)
            )
            .where(DynamicPk.obj_ord_pk.in_([pk.get("obj_ord_pk") for pk in pk_list]))
            .order_by(DynamicPkStation.pk, DynamicPkStation.snap_dist_m.asc())
        )

        pk_station_results = await session_pynuts.execute(pk_station_query)
        result = pk_station_results.fetchall()

        obj_ord_pk_to_station = {}

        for pk, station_id, snap_dist_m, obj_ord_pk in result:
            if obj_ord_pk not in obj_ord_pk_to_station:
                obj_ord_pk_to_station[obj_ord_pk] = station_id

        return obj_ord_pk_to_station

    except Exception as e:
        logger.error("Erreur lors de la récupération des stations snap : %s", e)
        raise HTTPException(status_code=500, detail=str(e))


async def get_scenario_year(session_pynuts: AsyncSession, scenarios: list[int]):
    query = select(Scenario.id, Scenario.obs_year).where(Scenario.id.in_(scenarios))
    result = await session_pynuts.execute(query)
    return {row.id: row.obs_year for row in result.fetchall()}


async def get_data(session_donuts: AsyncSession, station_data: dict[str, int], scenario_years: dict[int, int], variables: list[str]):
    try:
        measurements = {obj_ord_pk: {} for obj_ord_pk in station_data.keys()}

        for var in variables:
            if var not in pynuts_to_donuts:
                continue
            var_info = pynuts_to_donuts[var]
            MeasurementModel = Measurement.create(var_info["measurement_table"])
            co_varfracom_id = var_info["co_varfracom_id"]

            query = select(
                MeasurementModel.station_id,
                ((func.extract('month', MeasurementModel.update_date) - 1) * 3 + func.floor((func.extract('day', MeasurementModel.update_date) - 1) / 10) + 1).label("decade"),
                func.extract('year', MeasurementModel.update_date).label("year"),
                func.avg(MeasurementModel.value).label("value") 
            ).where(
                MeasurementModel.station_id.in_(station_data.values()),
                MeasurementModel.co_varfracom_id == co_varfracom_id,
                func.extract('year', MeasurementModel.update_date).in_(scenario_years.values())
            ).group_by(
                MeasurementModel.station_id,
                "decade",
                "year"
            )
            
            result = await session_donuts.execute(query)            
            mapped_result = result.mappings().all()
            for row in mapped_result:
                station_id = row["station_id"]
                decade = int(row["decade"])
                year = int(row["year"])
                value = row["value"]
                scenario = next((sc for sc, yr in scenario_years.items() if yr == year), None)
                
                obj_ord_pk = next((key for key, val in station_data.items() if val == station_id), None)

                if obj_ord_pk:
                    if var not in measurements[obj_ord_pk]:
                        measurements[obj_ord_pk][var] = {i: [] for i in range(1, 37)}
                    
                    measurements[obj_ord_pk][var][decade] = [{"scenario": scenario, "value": value}]
        
        return measurements 
    except Exception as e:
        logger.error("Erreur lors de la récupération des données d'observation : %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def get_data_donuts(body: dict):
    try:
        program = body.get("program")
        scenarios = body.get("scenarios", [])
        variables = body.get("variables", [])
        pk_list = body.get("pk", [])

        if not program or not scenarios or not variables or not pk_list:
            raise HTTPException(status_code=400, detail="Missing required fields: program, scenarios, variables, pk.")

        scenario_list = [int(s) for s in scenarios]

        async with async_session_pynuts() as session_pynuts, async_session_donuts() as session_donuts:
            scenario_years = await get_scenario_year(session_pynuts, scenario_list)
            station_data = await get_station_id_by_pk(program, session_pynuts, pk_list)
            data = await get_data(session_donuts, station_data, scenario_years, variables)

        return data
    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
