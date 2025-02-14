from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Integer, String, func
from core.database import async_session_pynuts
from models.models import SenequeAesnHydro, Pk
from core.logger import logger

router = APIRouter(prefix="/amont_aval", tags=["Hydrologie - Amont & Aval"])


async def fetch_pks(program: str, id_hyd_list: list[int]):
    """
    Récupère les PK correspondants à une liste d'id_hyd pour un programme donné.

    Args:
        program (str): Nom du programme (schéma).
        id_hyd_list (list[int]): Liste des id_hyd.

    Returns:
        list[dict]: Liste des PK avec leurs propriétés.
    """
    DynamicPk = Pk.create(program)

    async with async_session_pynuts() as session:
        try:
            query = select(
                DynamicPk.code_bas,
                DynamicPk.id_obj,
                DynamicPk.strahler,
                DynamicPk.pk,
                DynamicPk.obj_ord_pk,
                func.row_number().over(
                    order_by=[DynamicPk.catchment_id, DynamicPk.strahler, DynamicPk.pk]
                ).label("ordered_pk")
            ).where(DynamicPk.catchment_id.in_(id_hyd_list))

            result = await session.execute(query)
            pk_data = result.fetchall()

            # Convertir les résultats en une structure JSON
            pk_list = [
                {
                    "code_bas": row.code_bas,
                    "id_obj": row.id_obj,
                    "strahler": row.strahler,
                    "pk": row.pk,
                    "obj_ord_pk": row.obj_ord_pk,
                    "ordered_pk": row.ordered_pk
                }
                for row in pk_data
            ]

            return pk_list

        except Exception as e:
            logger.error("Error fetching PKs: %s", e)
            raise Exception(f"Unable to fetch PKs: {str(e)}")


@router.get("/{program}/{id_hyd_start}/{id_hyd_end}")
async def get_amont_aval(program: str, id_hyd_start: int, id_hyd_end: int):
    """
    Récupère les id_hyd entre `id_hyd_start` et `id_hyd_end` pour un programme donné.
    """
    DynamicSenequeAesnHydro = SenequeAesnHydro.create(program)

    async with async_session_pynuts() as session:
        try:
            # Récupération de verdin et level pour id_hyd_start
            subquery_start = select(
                DynamicSenequeAesnHydro.verdin,
                DynamicSenequeAesnHydro.level
            ).where(DynamicSenequeAesnHydro.id_hyd == id_hyd_start).subquery()

            verdin_start = subquery_start.c.verdin
            level_start = subquery_start.c.level

            # Récupération de verdin pour id_hyd_end
            verdin_end_query = select(DynamicSenequeAesnHydro.verdin).where(DynamicSenequeAesnHydro.id_hyd == id_hyd_end)
            verdin_end_result = await session.execute(verdin_end_query)
            verdin_end = verdin_end_result.scalar()

            # Requête principale
            query = select(DynamicSenequeAesnHydro.id_hyd).where(
                DynamicSenequeAesnHydro.id_hyd.in_(
                    select(DynamicSenequeAesnHydro.id_hyd).where(
                        (DynamicSenequeAesnHydro.seaoutlet_id == 1) &
                        (DynamicSenequeAesnHydro.verdin <= verdin_start) &
                        (
                            (DynamicSenequeAesnHydro.level == 1) |
                            (
                                (DynamicSenequeAesnHydro.level <= level_start) &
                                (
                                    func.SUBSTRING(
                                        DynamicSenequeAesnHydro.verdin.cast(String), 1,
                                        (DynamicSenequeAesnHydro.level.cast(Integer) - 1)
                                    ) ==
                                    func.SUBSTRING(
                                        verdin_start.cast(String), 1,
                                        (level_start.cast(Integer) - 1)
                                    )
                                )
                            )
                        )
                    )
                ) &
                (DynamicSenequeAesnHydro.verdin >= verdin_end)
            )

            result = await session.execute(query) # 'NoneType' object has no attribute 'send'
            id_hyd_data = [row[0] for row in result.fetchall()]
            pk_list = await fetch_pks(program, id_hyd_data)
            return {"id_hyd": id_hyd_data, "pk" : pk_list}

        except Exception as e:
            logger.error("Error fetching amont_aval data: %s", e)
            raise HTTPException(status_code=500, detail=str(e))