import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from core.database import async_session_donuts, async_session_pynuts
from models.models import Pk, PkStation
from core.logger import logger


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


def date_to_decade(date: str):
    """
    Convertit une date en une décade (période de 10 jours) et scénario.
    (scénario 1 : 2017, 2 : 2018 ... 5: 2021) 
    Exemple: 2017-01-01 -> decade 1, scenario 1 
    2017-01-11 -> decade 2, scenario 1
    2020-03-01 -> decade 6, scenario 4
    2020-03-11 -> decade 7, scenario 4
    2020-12-31 -> decade 36, scenario 4
    """

    year, month, day = date.split("-")
    year = int(year)
    month = int(month)
    day = int(day)

    if month == 1:
        decade = 1 + (day - 1) // 10
    else:
        decade = 1 + (month - 1) * 3 + (day - 1) // 10

    scenario = year - 2016

    return decade, scenario
    

async def get_data(session_donuts: AsyncSession, obj_ord_pk_to_station: dict[str, int], scenarios: list[int], variables: list[str]):
    try:
        
        pass

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
            station_data = await get_station_id_by_pk(program, session_pynuts, pk_list)

        logger.info("station_data: %s", station_data)
        return station_data 

    except Exception as e:
        logger.error("Error fetching data: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
