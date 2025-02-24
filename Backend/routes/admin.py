import os
import json
import shutil
from fastapi import APIRouter, Depends, Form, UploadFile, File, Request
from fastapi.templating import Jinja2Templates
from core.auth import get_current_admin_user
from resources.parser import is_metadata_json_valide, validate_schema_and_data, is_folder_valide, EXPECTED_FILES
import shutil


router = APIRouter()
templates = Jinja2Templates(directory="templates")

DATAVIZ_DIR = "resources/dataviz"
os.makedirs(DATAVIZ_DIR, exist_ok=True)

@router.get("/admin")
async def admin_page(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

@router.post("/admin/add", dependencies=[Depends(get_current_admin_user)])
async def add_program(
    name: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    variables: str = Form(...),
    exutoire_id: int = Form(...),
    background: UploadFile = File(...),
    pk_map: UploadFile = File(...),
    seneque_aesn_hydro_basin: UploadFile = File(...),
    seneque_aesn_hydro: UploadFile = File(...),
    stations_donuts: UploadFile = File(...),
):
    try:
        program_folder = os.path.join(DATAVIZ_DIR, name)
        os.makedirs(program_folder, exist_ok=True)

        file_map = {
            "background.png": background,
            "pk_map.sld": pk_map,
            "seneque_aesn_hydro_basin.sld": seneque_aesn_hydro_basin,
            "seneque_aesn_hydro.sld": seneque_aesn_hydro,
            "stations_donuts.sld": stations_donuts,
        }

        for filename, file in file_map.items():
            file_path = os.path.join(program_folder, filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

        metadata = {
            "name": name,
            "title": title,
            "description": description,
            "variables": json.loads(variables),
            "exutoire_id": exutoire_id
        }

        metadata_path = os.path.join(program_folder, "metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)
    except Exception as e:
        shutil.rmtree(program_folder)
        return {"Exception": e}

    schema_validation = validate_schema_and_data(name, json.loads(variables), exutoire_id)
    if not schema_validation[0]:
        shutil.rmtree(program_folder)
        return {"message" : "Schéma ou données incohérentes en base de données"}

    if not is_folder_valide(program_folder, EXPECTED_FILES):
        shutil.rmtree(program_folder)
        return {"message" : "Fichiers / données manquantes ou invalides"}

    if not is_metadata_json_valide(program_folder):
        shutil.rmtree(program_folder)
        return {"message" : "Données manquantes ou invalides"}

    return {"message": f"Programme '{name}' ajouté avec succès !"}