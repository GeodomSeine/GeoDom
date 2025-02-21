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
    return db.query(User).filter(User.username == username).first()

# Générer un token JWT
def create_access_token(username: str):
    expire = datetime.utcnow() + timedelta(hours=1)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

@auth_router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Nom d'utilisateur ou mot de passe incorrect")
    
    access_token = create_access_token(user.username)
    return {"access_token": access_token, "token_type": "bearer"}


# Vérifier que l'utilisateur est admin
def get_current_admin_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="Les nouveaux mots de passe ne correspondent pas.")

    if not pwd_context.verify(old_password, current_user.password):
        raise HTTPException(status_code=400, detail="L'ancien mot de passe est incorrect.")

    current_user.password = hash_password(new_password)
    db.commit()
    return {"message": "Mot de passe modifié avec succès !"}