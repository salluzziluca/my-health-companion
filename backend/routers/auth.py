from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from config.database import get_session
from models.users import User, UserCreate, UserRead
from models.profiles import Profile
from utils.security import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router_auth = APIRouter(
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)


class Token(dict):
    access_token: str
    token_type: str


@router_auth.post("/register", response_model=UserRead)
def register_user(*, session: Session = Depends(get_session), user_data: UserCreate):
    """Registrar un nuevo usuario"""
    # Verificar si el mail ya existe
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Correo electrónico ya registrado",
        )
    
    # Crear usuario
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role,
        password_hash=hashed_password,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    # Crear un perfil vacío para el usuario
    db_profile = Profile(user_id=db_user.id)
    session.add(db_profile)
    session.commit()
    
    return db_user


@router_auth.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Iniciar sesión y obtener un token de acceso"""
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mail o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}