import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """ Initialisation des variables d'environnement
    """
    DATABASE_PYNUTS_URL = os.getenv("DATABASE_PYNUTS_URL")
    DATABASE_DONUTS_URL = os.getenv("DATABASE_DONUTS_URL")
    TESTING = os.getenv("TESTING", "False").lower() == "true"  
    LOG_LEVEL = os.getenv("LOG_LEVEL", "CRITICAL")
    DB_ENGINE_LOG = os.getenv("DB_ENGINE_LOG", "False").lower() == "true"
    SECRET_ADMIN_KEY = os.getenv("SECRET_ADMIN_KEY", "")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    
settings = Settings()
