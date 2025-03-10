import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from core.logger import logger

router = APIRouter(prefix="/sld", tags=["Styles SLD"])

RESOURCES_PATH = "./resources"
DATAVIZ_FOLDER = "dataviz"
VARIABLE_FOLDER = "variables"

def get_sld_file_path(program: str, filename: str):
    """
    Construit le chemin absolu du fichier SLD.

    Args:
        program (str): Nom du programme.
        filename (str): Nom du fichier SLD.

    Returns:
        str: Chemin du fichier SLD.
    """
    return os.path.join(RESOURCES_PATH, DATAVIZ_FOLDER, program, filename)


def get_variable_sld_file_path(variable: str):
    """
    Construit le chemin absolu du fichier SLD.

    Args:
        variable (str): Nom de la variable.

    Returns:
        str: Chemin du fichier SLD.
    """
    filename = f"{variable}.sld"

    return os.path.join(RESOURCES_PATH, VARIABLE_FOLDER, filename)


@router.get("/bassin/{program}")
async def get_bassin_sld(program: str):
    """
    Récupère le fichier SLD du bassin pour un programme donné.

    Args:
        program (str): Nom du programme.

    Exceptions:
        HTTPException: Fichier SLD introuvable.
        
    Returns:
        FileResponse: Le fichier SLD du bassin.
    """
    file_path = get_sld_file_path(program, "seneque_aesn_hydro_basin.sld")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"SLD introuvable : {file_path}")

    return FileResponse(file_path, headers={"Content-Type": "application/xml; charset=utf-8"})


@router.get("/hydro/{program}")
async def get_hydro_sld(program: str):
    """
    Récupère le fichier SLD de l'hydrographie pour un programme donné.

    Args:
        program (str): Nom du programme.
        
    Exceptions:
        HTTPException: Fichier SLD introuvable.

    Returns:
        FileResponse: Le fichier SLD de l'hydrographie.
    """
    file_path = get_sld_file_path(program, "seneque_aesn_hydro.sld")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"SLD introuvable : {file_path}")

    return FileResponse(file_path, headers={"Content-Type": "application/xml; charset=utf-8"})


@router.get("/stationsnap/{program}")
async def get_stationsnap_sld(program: str):
    """
    Récupère le fichier SLD de StationSnap pour un programme donné.

    Args:
        program (str): Nom du programme.
        
    Exceptions:
        HTTPException: Fichier SLD introuvable.

    Returns:
        FileResponse: Le fichier SLD de StationSnap.
    """
    file_path = get_sld_file_path(program, "stations_donuts.sld")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"SLD introuvable : {file_path}")

    return FileResponse(file_path, headers={"Content-Type": "application/xml; charset=utf-8"})


@router.get("/pk/{program}")
async def get_pk_sld(program: str):
    """
    Récupère le fichier SLD de PK pour un programme donné.

    Args:
        program (str): Nom du programme.
    
    Exceptions:
        HTTPException: Fichier SLD introuvable.

    Returns:
        FileResponse: Le fichier SLD de PK.
    """
    file_path = get_sld_file_path(program, "pk_map.sld")

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"SLD introuvable : {file_path}")

    return FileResponse(file_path, headers={"Content-Type": "application/xml; charset=utf-8"})


@router.get("/variable/{variable}")
async def get_pk_sld(variable: str):
    """
    Récupère le fichier SLD de la variable donnée.

    Args:
        variable (str): Nom de la variable.
        
    Exceptions:
        HTTPException: Fichier SLD introuvable.

    Returns:
        FileResponse: Le fichier SLD de la variable.
    """
    file_path = get_variable_sld_file_path(variable)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"SLD introuvable : {file_path}")

    return FileResponse(file_path, headers={"Content-Type": "application/xml; charset=utf-8"})