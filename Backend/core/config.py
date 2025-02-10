import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_PYNUTS_URL = os.getenv("DATABASE_PYNUTS_URL")
    DATABASE_DONUTS_URL = os.getenv("DATABASE_DONUTS_URL")
    TESTING = os.getenv("TESTING", "False").lower() == "true"  
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
