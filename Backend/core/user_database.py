from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from core.logger import logger

DATABASE_URL = "sqlite:///./fastapi_admin.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

BaseAdmin = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    """Hasher un mot de passe

    Args:
        password (str): Mot de passe à hasher

    Returns:
        str: _description_
    """
    return pwd_context.hash(password)

class User(BaseAdmin):
    """Classe de la table des utilisateurs

    Args:
        BaseAdmin (): Base déclarative
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)

def init_db():
    """Créer la base de données et l'admin par défaut"""
    BaseAdmin.metadata.create_all(bind=engine)

    db = SessionLocal()
    if not db.query(User).filter(User.username == "admin").first():
        admin = User(username="admin", password=hash_password("admin123"), is_admin=True) # admin123 est le mot de passe par défaut (A changer)
        db.add(admin)
        db.commit()
        logger.info("✅ Admin 'admin' créé avec le mot de passe 'admin123'")
    db.close()

def get_db():
    """Fournir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
