import json
from typing import List

import os
import hashlib
import json
import sqlite3
import logging

import asyncio
import os
from sqlalchemy import create_engine, MetaData, Table, select, text
from core.database import sync_engine_pynuts 

PATH_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_DB_FILE = os.path.join(PATH_CURRENT_DIR, "checked_folder_hashes.db")
DATA_FOLDER = os.path.join(PATH_CURRENT_DIR, "dataviz")

LIST_TABLE : List[str] = ["output_edl_240912", "pk_map", "pk_station", "seneque_aesn_hydro", "seneque_aesn_hydro_basin"]

EXPECTED_FILES = {
    "metadata.json",
    "seneque_aesn_hydro.sld",
    "seneque_aesn_hydro_basin.sld",
    "stations_donuts.sld",
    "background.png", 
    "pk_map.sld"
}

REQUIRED_KEYS = {
    "name": str,
    "title": str,
    "description": str,
    "variables": list,
    "exutoire_id": int
}

def initialize_database():
    """Crée la table pour stocker les hashes si elle n'existe pas."""
    conn = sqlite3.connect(PATH_DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS folder_hashes (
            folder_name TEXT PRIMARY KEY,
            hash_value TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def setup_logger(folder_name):
    """
    Configure un logger pour écrire les erreurs dans un fichier spécifique au dossier non conforme.
    
    :param folder_name: Nom du dossier pour personnaliser le fichier de log.
    :return: L'objet logger configuré.
    """
    log_dir = "error_log"
    os.makedirs(log_dir, exist_ok=True)  # Créer le dossier error_log s'il n'existe pas

    log_file = os.path.join(log_dir, f"{folder_name}.log")
    
    logger = logging.getLogger(folder_name)
    logger.setLevel(logging.ERROR)
    
    if not logger.handlers:  # Évite d'ajouter plusieurs handlers
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        file_handler = logging.FileHandler(log_file, mode='a', encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

def path_from_folder_name(folder_name):
    """Retourne le chemin complet d'un dossier."""
    return os.path.join(DATA_FOLDER, folder_name)

def calculate_hash_for_folder(folder_path):
    """Calcule un hash SHA256 pour un dossier, y compris le nom des dossiers, fichiers et leur contenu."""
    sha256 = hashlib.sha256()

    # Parcourir les dossiers, sous-dossiers et fichiers par ordre alphabétique pour cohérence
    for root, dirs, files in sorted(os.walk(folder_path)):
        folder_name = os.path.basename(root)
        print(f"Hashing du dossier : {folder_name}")
        sha256.update(folder_name.encode('utf-8'))
        
        # Trier et parcourir les fichiers pour cohérence
        for file in sorted(files):
            file_path = os.path.join(root, file)
            # print(f"Hashing du fichier : {file_path}")
            
            # Ajouter le nom du fichier au hash
            sha256.update(file.encode('utf-8'))
            
            # Ajouter le contenu du fichier au hash
            if os.path.isfile(file_path):
                try:
                    with open(file_path, 'rb') as f:
                        while chunk := f.read(8192):  # Lecture par blocs pour gros fichiers
                            sha256.update(chunk)
                except Exception as e:
                    print(f"Impossible de lire {file_path}: {e}")

    # Retourner le hash global
    print(f"Hash global du dossier : {sha256.hexdigest()}")
    return sha256.hexdigest()



def get_previous_hash(folder_name):
    """Récupère le hash précédent d'un dossier."""
    conn = sqlite3.connect(PATH_DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT hash_value FROM folder_hashes WHERE folder_name = ?", (folder_name,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

def update_hash(folder_name, hash_value):
    """Met à jour ou insère un hash pour un dossier."""
    conn = sqlite3.connect(PATH_DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO folder_hashes (folder_name, hash_value)
        VALUES (?, ?)
        ON CONFLICT(folder_name) DO UPDATE SET hash_value=excluded.hash_value
    """, (folder_name, hash_value))
    conn.commit()
    conn.close()

def need_to_be_updated(folder_name, folder_hash):
    """Vérifie si un dossier a été modifié depuis la dernière vérification."""
    previous_hash = get_previous_hash(folder_name)
    if previous_hash:
        return folder_hash != previous_hash
    else:
        return True
    

def remove_invalid_hash(folder_name):
    """Supprime l'entrée de hash pour un dossier donné."""
    conn = sqlite3.connect(PATH_DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM folder_hashes WHERE folder_name = ?", (folder_name,))
    conn.commit()
    conn.close()


def update_changes():
    for item in os.listdir(DATA_FOLDER):
        item_path = path_from_folder_name(item)
        if os.path.isdir(item_path):
            folder_hash = calculate_hash_for_folder(item_path)
            if need_to_be_updated(item, folder_hash):
                if is_metadata_json_valide(item_path):
                    if is_folder_valide(item_path, EXPECTED_FILES):
                        update_hash(item, folder_hash)


def is_folder_valide(folder_path, expected_files):
    # Liste des fichiers dans le dossier
    try:
        files_in_folder = set(os.listdir(folder_path))
    except FileNotFoundError:
        print(f"Le dossier '{folder_path}' n'existe pas.")
        return False

    # Convertir la liste des fichiers attendus en un ensemble
    expected_set = set(expected_files)
    
    # Vérifier si le dossier contient exactement les fichiers attendus
    if files_in_folder == expected_set:
        print("Le dossier est conforme.")
        return True
    else:
        missing_files = expected_set - files_in_folder
        extra_files = files_in_folder - expected_set
        logger = setup_logger(os.path.basename(folder_path))
        if missing_files:
            logger.error(f"Fichiers manquants : {missing_files}")
        if extra_files:
            logger.error(f"Fichiers inattendus : {extra_files}")
        return False

def is_metadata_json_valide(folder_path):
    """
    Vérifie que le fichier metadata.json dans le dossier est bien formé et respecte la structure attendue.

    :param folder_path: Chemin vers le dossier contenant metadata.json.
    :return: True si le fichier est valide, False sinon.
    """
    folder_name = os.path.basename(folder_path)  # Nom du dossier pour les logs
    
    error_msg = []
    json_path = os.path.join(folder_path, "metadata.json")

    # Vérifier si le fichier metadata.json existe
    if not os.path.exists(json_path):
        logger = setup_logger(folder_name)
        logger.error(f"Le fichier 'metadata.json' est manquant dans '{folder_path}'.")
        return False

    try:
        # Charger le fichier JSON
        with open(json_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        # Vérifier la présence des clés requises et leurs types
        for key, expected_type in REQUIRED_KEYS.items():
            if key not in data:
                error_msg.append(f"La clé requise '{key}' est manquante dans metadata.json.")
            else:
                if not isinstance(data[key], expected_type):
                    error_msg.append(f"Type incorrect pour '{key}': attendu {expected_type}, trouvé {type(data[key])}.")

        # Vérifier qu'il n'y a pas de clés supplémentaires
        extra_keys = set(data.keys()) - set(REQUIRED_KEYS.keys())
        if extra_keys:
            error_msg.append(f"Clés supplémentaires dans metadata.json : {extra_keys}")

        # Vérifier que 'variables' est une liste de chaînes
        if not all(isinstance(var, str) for var in data["variables"]):
            error_msg.append(f"La clé 'variables' doit être une liste de chaînes de caractères.")

        is_valid_db, db_errors = validate_schema_and_data(
            data["name"], 
            data["variables"], 
            data["exutoire_id"]
        )

        if not is_valid_db: # Si les datas ne sont pas dans la bdd
            error_msg.extend(db_errors)
        
        if error_msg:
            logger = setup_logger(folder_name)
            for msg in error_msg:
                logger.error(msg)
            remove_invalid_hash(folder_name)
            return False


        print(f"Le fichier '{json_path}' est valide.")
        return True

    except json.JSONDecodeError as e:
        logger = setup_logger(folder_name)
        logger.error(f"Le fichier metadata.json n'est pas un JSON valide : {e}")
    except Exception as e:
        logger = setup_logger(folder_name)
        logger.error(f"Erreur inattendue lors de la vérification de metadata.json : {e}")
        

    
    return False

def validate_schema_and_data(schema_name, variables, exutoire_id):
    """
    Vérifie que :
    - le schéma existe dans la base de données
    - les variables existent comme colonnes dans la table output_edl_240912
    - exutoire_id existe dans la table seneque_aesn_hydro
    - les tables dans LIST_TABLE existent dans la base de données
    """
    error_messages = []

    try:
        with sync_engine_pynuts.connect() as conn:

            # Vérifier si le schéma existe
            schema_query = text("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.schemata 
                    WHERE schema_name = :schema_name
                );
            """)
            result = conn.execute(schema_query, {"schema_name": schema_name})
            schema_exists = result.scalar()
            
            if not schema_exists:
                error_messages.append(f"Le schéma '{schema_name}' n'existe pas dans la base de données.")
                return False, error_messages
            
            # Vérifier si les tables dans LIST_TABLE existent
            for table in LIST_TABLE:
                table_query = text("""
                    SELECT EXISTS (
                        SELECT 1 
                        FROM information_schema.tables 
                        WHERE table_schema = :schema_name 
                        AND table_name = :table_name
                    );
                """)
                result = conn.execute(table_query, {"schema_name": schema_name, "table_name": table})
                table_exists = result.scalar()
                
                if not table_exists:
                    error_messages.append(f"La table '{table}' n'existe pas dans le schéma {schema_name}")
            
            # Vérifier si les variables existent dans la table output_edl_240912
            column_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = :schema_name 
                AND table_name = 'output_edl_240912';
            """)
            result = conn.execute(column_query, {"schema_name": schema_name})
            columns = [row[0].upper() for row in result.fetchall()]
            
            for variable in variables:
                if variable.upper() not in columns:
                    error_messages.append(f"La variable '{variable}' n'existe pas dans la table output_edl_240912 du schéma {schema_name}")
            
            # Vérifier si l'exutoire_id existe dans la table seneque_aesn_hydro
            exutoire_query = text(f"""
                SELECT EXISTS (
                    SELECT 1 
                    FROM {schema_name}.seneque_aesn_hydro 
                    WHERE id_hyd = :exutoire_id
                );
            """)
            result = conn.execute(exutoire_query, {"exutoire_id": exutoire_id})
            exutoire_exists = result.scalar()
            
            if not exutoire_exists:
                error_messages.append(f"L'exutoire_id {exutoire_id} n'existe pas dans la table seneque_aesn_hydro")
            
            return len(error_messages) == 0, error_messages
    
    except Exception as e:
        error_messages.append(f"Erreur lors de la validation de la base de données: {str(e)}")
        return False, error_messages

    
def main():
    initialize_database()
    update_changes()
    print("\nHashing terminé. Les résultats ont été sauvegardés dans la base de données.")
  
if __name__ == "__main__":
    main()
    

