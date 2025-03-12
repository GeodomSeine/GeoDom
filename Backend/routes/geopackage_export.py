import zipfile
from fastapi import APIRouter, HTTPException
from sqlalchemy.future import select
from core.database import async_session_pynuts, load_output_table_sync
from routes.pk import get_pk_features
import os
import time
import geopandas as gpd
from zipfile import ZipFile
from fastapi.responses import FileResponse
import json
from core.logger import logger
import numpy as np
from fastapi import HTTPException
from sqlalchemy.future import select
from typing import List, Dict
import pandas as pd


router = APIRouter(prefix="/exportgpkg", tags=["Export geopackage"])

RESOURCES_PATH = "./resources"
VARIABLE_FOLDER = "variables"
JSON_FILENAME = "variables.json"


def load_variable_config():
    """ Charge la configuration des variables depuis un fichier JSON.

    Returns:
        dict: La configuration des variables.
    """
    file_path = os.path.join(RESOURCES_PATH, VARIABLE_FOLDER, JSON_FILENAME)

    with open(file_path, "r") as file:
        return json.load(file)


def generate_class_intervals(values, nb_classes, colors):
    """ Génère les intervalles de classes pour les valeurs spécifiées.

    Args:
        values : Valeurs à classer.
        nb_classes : Nombre de classes.
        colors : Couleurs des classes.

    Returns:
        list: Liste des intervalles de classes.
    """
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


def generate_sld_files(classes: Dict[str, List[Dict]]):
    """
    Génère un fichier SLD pour chaque variable en fonction des classes définies.

    Args:
        classes (dict): Dictionnaire contenant les classes de chaque variable.
    """
    os.makedirs("sld_files", exist_ok=True)
    
    for variable, intervals in classes.items():
        sld_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:se="http://www.opengis.net/se"
    xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd" version="1.1.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink">
  <NamedLayer>
    <se:Name>{variable}_layer</se:Name>
    <UserStyle>
      <se:FeatureTypeStyle>
'''
        for interval in intervals:
            range_min, range_max = interval["range"]
            color = interval["color"]
            sld_content += f'''
        <se:Rule>
          <se:Name>{range_min} - {range_max}</se:Name>
          <ogc:Filter>
            <ogc:And>
              <ogc:PropertyIsGreaterThanOrEqualTo>
                <ogc:PropertyName>{variable}</ogc:PropertyName>
                <ogc:Literal>{range_min}</ogc:Literal>
              </ogc:PropertyIsGreaterThanOrEqualTo>
              <ogc:PropertyIsLessThanOrEqualTo>
                <ogc:PropertyName>{variable}</ogc:PropertyName>
                <ogc:Literal>{range_max}</ogc:Literal>
              </ogc:PropertyIsLessThanOrEqualTo>
            </ogc:And>
          </ogc:Filter>
          <se:LineSymbolizer>
            <se:Stroke>
              <se:SvgParameter name="stroke">{color}</se:SvgParameter>
              <se:SvgParameter name="stroke-width">2</se:SvgParameter>
            </se:Stroke>
          </se:LineSymbolizer>
        </se:Rule>
'''
        sld_content += '''
      </se:FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>'''
        
        with open(f"/tmp/{variable}.sld", "w", encoding="utf-8") as file:
            file.write(sld_content)


async def get_geojson_with_properties(
    program: str, scenarios: List[int], variables: List[str], decades: List[int], percentile: str
) -> Dict:
    """
    Récupère toutes les valeurs pour chaque variable sur toutes les décades,
    en agrégeant les données par `obj_ord_pk` et en les intégrant dans les propriétés du GeoJSON.
    Le calcul des percentiles est ensuite réalisé avec numpy.percentile.

    Args:
        program (str): Nom du programme.
        scenarios (list[int]): Liste des scénarios.
        variables (list[str]): Liste des variables.
        decades (list[int]): Liste des décennies.
        percentile (str): Type de percentile ('p5', 'p50', 'p90').

    Returns:
        dict: GeoJSON avec les nouvelles propriétés intégrées.
    """
    percentile_map = {"p5": 5, "p50": 50, "p90": 90}
    if percentile not in percentile_map:
        raise HTTPException(status_code=400, detail="Invalid percentile value. Use 'p5', 'p50', or 'p90'.")

    if not program or not scenarios or not variables or not decades:
        raise HTTPException(status_code=400, detail="Missing required fields: program, scenarios, variables, decades, percentile.")

    table = load_output_table_sync(program)
    
    for variable in variables:
        if variable not in table.columns:
            raise HTTPException(status_code=400, detail=f"Variable '{variable}' does not exist in the table.")
    
    scenario_list = [int(s) for s in scenarios]
    decade_list = list(range(int(decades[0]), int(decades[1]) + 1))
    
    async with async_session_pynuts() as session:
        query = (
            select(
                table.c.obj, table.c.ord, table.c.pk,
                *[table.c[variable] for variable in variables]
            ).where(
                table.c.scn.in_(scenario_list),
                table.c.dec.in_(decade_list)
            ).order_by(table.c.obj, table.c.ord, table.c.pk)
        )

        result = await session.execute(query)
        data = result.fetchall()
        
        result_data = {}
        for row in data:
            obj_ord_pk = f"{row.obj}_{row.ord}_{row.pk}"
            if obj_ord_pk not in result_data:
                result_data[obj_ord_pk] = {variable: [] for variable in variables}
            for variable in variables:
                result_data[obj_ord_pk][variable].append(getattr(row, variable))
    
    classes = {}
    for variable in variables:
        var_config = variable_config.get(variable, {})
        
        if var_config.get("classification") == "sld":
            continue

        values = [value for values_dict in result_data.values() for value in values_dict[variable]]
        classes[variable] = generate_class_intervals(values, var_config.get("nb_classes", 5), var_config.get("colors", []))

    # Calcul des percentiles avec numpy
    for obj_ord_pk, values_dict in result_data.items():
        for variable, values in values_dict.items():
            result_data[obj_ord_pk][variable] = np.percentile(values, percentile_map[percentile])
    
    # Récupération des features GeoJSON
    pk_features = await get_pk_features(program)
    
    # Ajout des nouvelles propriétés aux features
    for feature in pk_features:
        properties = feature.get("properties", {})
        obj_ord_pk = properties.get("obj_ord_pk")
        if obj_ord_pk in result_data:
            properties.update(result_data[obj_ord_pk])

    # Générer les fichiers SLD
    generate_sld_files(classes)

    return  {"type": "FeatureCollection", "features": pk_features}


@router.post("")
async def export_geopackage(body: dict):
    """
    Exporte les données hydrographiques d'un programme sous forme de GeoPackage.
    
    Args:
        body (dict): Contient les clés `program`, `scenarios`, `variables`, `decades` et le percentile (p5, p50 ou p90).
        
    Returns:
        StreamingResponse: Fichier GeoPackage
    """
    program = body.get("program")
    scenarios = body.get("scenarios", [])
    variables = [variable.lower() for variable in body.get("variables", [])]
    decades = body.get("decades", [])
    percentile = body.get("percentile", "p50")

    logger.info("Program : %s", program)
    logger.info("Scenarios : %s", scenarios)
    logger.info("Variables : %s", variables)
    logger.info("Decades : %s", decades)
    logger.info("Percentile : %s", percentile)


    zipfile_path_params = "_".join([program, *(str(scn) for scn in scenarios), *(str(variable) for variable in variables), *(str(decade) for decade in decades), percentile])
    pkmap_file_path = f"/tmp/{program}_pkmap.gpkg"
    zipfile_path = f"/tmp/{zipfile_path_params}.zip"
    
    """
        Check if the zip file is already created
        If the file is older than 10 minutes, delete it
        else return the existing file
    """
    if os.path.exists(zipfile_path):
        if (os.path.getmtime(zipfile_path) < (time.time() - 600)):
            os.remove(zipfile_path)     
        else:
            return FileResponse(zipfile_path, media_type='application/zip', filename=f"{program}.zip")
    
    pk_map_feature = await get_geojson_with_properties(program, scenarios, variables, decades, percentile)
    
    gdf = gpd.GeoDataFrame.from_features(pk_map_feature)
    gdf.to_file(pkmap_file_path, driver="GPKG")

    # Create the metadata
    metadata = {
        "name": f"{program}",
        "date": time.strftime("%A %d %B %Y %H:%M:%S", time.localtime())
    }
    
    variables_paths = []
    for variable in variables:
        var_config = variable_config.get(variable, {})
        if var_config.get("classification") == "quantile":
            logger.info(f"variable quantile: {variable}")
            variables_paths.append(f"/tmp/{variable}.sld")
        elif var_config.get("classification") == "sld":
            variables_paths.append(os.path.join(RESOURCES_PATH, VARIABLE_FOLDER, f"{variable}.sld") )

    logger.info(f"variables_paths: {variables_paths}")
    
    # Create the zip file
    with ZipFile(zipfile_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(pkmap_file_path, f"{program}_pkmap.gpkg")
        zipf.writestr("metadata.json", json.dumps(metadata, ensure_ascii=False, indent=2))
        for variable_path in variables_paths:
            zipf.write(variable_path, os.path.basename(variable_path))
        os.remove(pkmap_file_path)
    logger.info("Everything okey is done")
    return FileResponse(zipfile_path, media_type='application/zip', filename=f"{program}.zip")
            