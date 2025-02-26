import os
import json
import shutil
from fastapi import APIRouter, Depends, Form, UploadFile, File, Request, HTTPException
from fastapi.templating import Jinja2Templates
from core.auth import get_current_admin_user
from resources.parser import is_metadata_json_valide, validate_schema_and_data, is_folder_valide, EXPECTED_FILES
import shutil


router = APIRouter()
templates = Jinja2Templates(directory="templates")

DATAVIZ_DIR = "resources/dataviz"
os.makedirs(DATAVIZ_DIR, exist_ok=True)

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


# ✅ Éditer un programme
@router.put("/admin/edit/{program_name}", dependencies=[Depends(get_current_admin_user)])
async def edit_program(
    program_name: str,
    title: str = Form(None),
    description: str = Form(None),
    variables: str = Form(None),
    exutoire_id: int = Form(None),
    background: UploadFile = File(None),
    pk_map: UploadFile = File(None),
    seneque_aesn_hydro_basin: UploadFile = File(None),
    seneque_aesn_hydro: UploadFile = File(None),
    stations_donuts: UploadFile = File(None),
):
    program_folder = os.path.join(DATAVIZ_DIR, program_name)
    metadata_path = os.path.join(program_folder, "metadata.json")

    if not os.path.exists(program_folder):
        raise HTTPException(status_code=404, detail="Programme non trouvé.")

    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        if title: metadata["title"] = title
        if description: metadata["description"] = description
        if variables: metadata["variables"] = json.loads(variables)
        if exutoire_id: metadata["exutoire_id"] = exutoire_id

        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)

        file_map = {
            "background.png": background,
            "pk_map.sld": pk_map,
            "seneque_aesn_hydro_basin.sld": seneque_aesn_hydro_basin,
            "seneque_aesn_hydro.sld": seneque_aesn_hydro,
            "stations_donuts.sld": stations_donuts,
        }

        for filename, file in file_map.items():
            if file:
                file_path = os.path.join(program_folder, filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la modification : {str(e)}")

    return {"message": f"Programme '{program_name}' mis à jour avec succès !"}


# ✅ Supprimer un programme
@router.delete("/admin/delete/{program_name}", dependencies=[Depends(get_current_admin_user)])
async def delete_program(program_name: str):
    program_folder = os.path.join(DATAVIZ_DIR, program_name)

    if not os.path.exists(program_folder):
        raise HTTPException(status_code=404, detail="Programme non trouvé.")

    try:
        shutil.rmtree(program_folder)
        return {"message": f"Programme '{program_name}' supprimé avec succès !"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression : {str(e)}")