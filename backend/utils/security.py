from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional, Tuple, Union

from config.database import get_session
from models.patients import Patient
from models.professionals import Professional

SECRET_KEY = "YOUR_SECRET_KEY"  # TODO poner una clave
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    """Verificar que una contraseña en texto plano coincida con la contraseña hasheada"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Generar un hash de la contraseña"""
    return pwd_context.hash(password)


def authenticate_user(email: str, password: str, session: Session, user_type: str = "patient"):
    """Autenticar un usuario por mail y contraseña"""
    if user_type == "patient":
        user = session.exec(select(Patient).where(Patient.email == email)).first()
    else:  # user_type == "professional"
        user = session.exec(select(Professional).where(Professional.email == email)).first()
    
    if not user or not verify_password(password, user.password_hash):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear un token de acceso JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user_type_and_model(
    token: str = Depends(oauth2_scheme), 
    session: Session = Depends(get_session)
) -> Tuple[str, Union[Patient, Professional]]:
    """Obtener el tipo de usuario y sus datos a partir del token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_type: str = payload.get("user_type", "patient")  # Valor predeterminado para compatibilidad
        
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Buscar al usuario según su tipo
    if user_type == "patient":
        user = session.exec(select(Patient).where(Patient.email == email)).first()
    else:  # user_type == "professional"
        user = session.exec(select(Professional).where(Professional.email == email)).first()
    
    if user is None:
        raise credentials_exception
    
    return user_type, user


async def get_current_patient(
    current_user_info = Depends(get_current_user_type_and_model)
) -> Patient:
    """Obtener el paciente actual autenticado"""
    user_type, user = current_user_info
    
    if user_type != "patient":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La operación requiere un usuario con rol de paciente",
        )
    
    return user


async def get_current_professional(
    current_user_info = Depends(get_current_user_type_and_model)
) -> Professional:
    """Obtener el profesional actual autenticado"""
    user_type, user = current_user_info
    
    if user_type != "professional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La operación requiere un usuario con rol de profesional",
        )
    
    return user