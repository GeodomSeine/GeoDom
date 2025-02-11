import os
import json
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from core.logger import logger

router = APIRouter(prefix="/programs", tags=["Programs"])
DATAVIZ_FOLDER = os.path.join("dataviz")
RESOURCES_PATH = os.path.join(".", "resources")

import sqlite3

DB_PATH = os.path.join(".", "resources", "checked_folder_hashes.db")

def get_valid_dataviz():
    """Récupère la liste des dataviz valides depuis la base de données SQLite."""
    
    query = """
        SELECT folder_name FROM folder_hashes;
    """

    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            dataviz_list = [row[0] for row in cursor.fetchall()]
        return dataviz_list

    except sqlite3.Error as e:
        print(f"Erreur lors de la récupération des dataviz : {e}")
        return []



@router.get("")
async def get_programs(request: Request):
    """
    Récupère la liste des programmes de visualisation disponibles.

    Returns:
        JSONResponse: Liste des programmes avec leurs métadonnées.
    """
    base_url = request.base_url
    programs = []
    valid_dataviz = get_valid_dataviz()

    for program in valid_dataviz:
        metadata_path = f"{RESOURCES_PATH}/{DATAVIZ_FOLDER}/{program}/metadata.json"
        background_path = f"{RESOURCES_PATH}/{DATAVIZ_FOLDER}/{program}/background.png"

        if not os.path.exists(metadata_path):
            logger.warning(f"Metadata file not found for {program}")
            continue

        with open(metadata_path, "r", encoding="utf-8") as metadata_file:
            metadata = json.load(metadata_file)

        metadata["background"] = f"{base_url}programs/{program}/background.png" if os.path.exists(background_path) else None
        programs.append(metadata)

    return JSONResponse(content=programs)


@router.get("/{program}/background.png")
async def serve_background(program: str):
    """
    Sert l'image de fond d'un programme spécifique.

    Args:
        program (str): Nom du programme.

    Returns:
        FileResponse: Image de fond du programme.
    """
    file_path = f"{RESOURCES_PATH}/{DATAVIZ_FOLDER}/{program}/background.png"

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Background image not found.")

    return FileResponse(file_path, media_type="image/png")
