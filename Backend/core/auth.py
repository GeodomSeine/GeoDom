import jwt
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .user_database import User, get_db, hash_password, pwd_context
from .config import settings
from fastapi import Form


SECRET_KEY = settings.SECRET_ADMIN_KEY
ALGORITHM = settings.ALGORITHM

auth_router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# Récupérer un utilisateur
def get_user(db: Session, username: str):
    """Récupère un utilisateur par son nom d'utilisateur.

    Args:
        db (Session): Session à la base de données.
        username (str): Nom d'utilisateur.

    Returns:
        User: Utilisateur.
    """
    return db.query(User).filter(User.username == username).first()

# Générer un token JWT
def create_access_token(username: str):
    """Génère un token JWT pour un utilisateur.

    Args:
        username (str): Nom d'utilisateur.

    Returns:
        str: Token JWT.
    """
    expire = datetime.utcnow() + timedelta(hours=1)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@auth_router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Endpoint pour se connecter et obtenir un token JWT.

    Args:
        form_data (OAuth2PasswordRequestForm, optional): authentification. Defaults to Depends().
        db (Session, optional): Session à la base de données. Defaults to Depends().

    Raises:
        HTTPException: Erreur si le nom d'utilisateur ou le mot de passe est incorrect.

    Returns:
        Json: Token JWT.
    """
    user = get_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Nom d'utilisateur ou mot de passe incorrect")
    
    access_token = create_access_token(user.username)
    return {"access_token": access_token, "token_type": "bearer"}


# Vérifier que l'utilisateur est admin
def get_current_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Vérifie que l'utilisateur est admin.

    Args:
        token (str, optional): Token JWT. Defaults to Depends(oauth2_scheme).
        db (Session, optional): Session à la base de données. Defaults to Depends(get_db).

    Raises:
        HTTPException: Token expiré.
        HTTPException: Token invalide.
        HTTPException: Accès refusé.

    Returns:
        User: Utilisateur.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

    user = get_user(db, username)
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Accès refusé")
    return user


@auth_router.post("/add_user")
def add_user(
    username: str = Form(...),
    password: str = Form(...),
    is_admin: bool = Form(...),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Ajouter un utilisateur.

    Args:
        username (str, optional): Nom de l'utilisateur. Defaults to Form(...).
        password (str, optional): Mot de passe. Defaults to Form(...).
        is_admin (bool, optional): Vérifier s'il à la role d'admin. Defaults to Form(...).
        current_user (User, optional): Utilisateur courant. Defaults to Depends(get_current_admin_user).
        db (Session, optional): Session de connexion à la base de données. Defaults to Depends(get_db).

    Raises:
        HTTPException: L'utilisateur existe déjà.

    Returns:
        Json: Message de succès.
    """
    if get_user(db, username):
        raise HTTPException(status_code=400, detail="L'utilisateur existe déjà")

    new_user = User(username=username, password=hash_password(password), is_admin=is_admin)
    db.add(new_user)
    db.commit()
    return {"message": f"Utilisateur '{username}' ajouté avec succès"}


@auth_router.post("/change_password")
def change_password(
    old_password: str = Form(...), 
    new_password: str = Form(...), 
    confirm_password: str = Form(...), 
    current_user: User = Depends(get_current_admin_user), 
    db: Session = Depends(get_db)
):
    """Changer le mot de passe de l'utilisateur.

    Args:
        old_password (str, optional): Ancien mot de passe. Defaults to Form(...).
        new_password (str, optional): Nouveau de mot de passe. Defaults to Form(...).
        confirm_password (str, optional): Confirmer le nouveau mot de passe. Defaults to Form(...).
        current_user (User, optional): Utilisateur courant. Defaults to Depends(get_current_admin_user).
        db (Session, optional): Session de connexion la base de donnée. Defaults to Depends(get_db).

    Raises:
        HTTPException: Les nouveaux mots de passe ne correspondent pas.
        HTTPException: L'ancien mot de passe est incorrect

    Returns:
        Json: Message de succès.
    """
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="Les nouveaux mots de passe ne correspondent pas.")

    if not pwd_context.verify(old_password, current_user.password):
        raise HTTPException(status_code=400, detail="L'ancien mot de passe est incorrect.")

    current_user.password = hash_password(new_password)
    db.commit()
    return {"message": "Mot de passe modifié avec succès !"}