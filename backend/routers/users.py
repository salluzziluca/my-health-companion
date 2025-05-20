from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from config.database import get_session
from models.users import User, UserRead, UserUpdate
from utils.security import get_current_user, get_password_hash

router_users = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)


@router_users.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return current_user


@router_users.patch("/me", response_model=UserRead)
def update_current_user(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    user_update: UserUpdate,
):
    """Actualizar información del usuario actual"""
    # Verificar si el mail ya existe si se intenta cambiar
    if user_update.email and user_update.email != current_user.email:
        existing_user = session.exec(
            select(User).where(User.email == user_update.email)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mail ya registrado",
            )
    
    # Actualizar datos del usuario
    user_data = user_update.model_dump(exclude_unset=True)
    
    # Hashear la contraseña
    if "password" in user_data:
        user_data["password_hash"] = get_password_hash(user_data.pop("password"))
    
    for key, value in user_data.items():
        setattr(current_user, key, value)
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user


# Para que los nutricionistas obtengan sus usuarios
@router_users.get("/my-users", response_model=List[UserRead])
def get_users_for_nutritionist(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Obtener usuarios para un nutricionista (Placeholder)"""
    if current_user.role != "nutritionist":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No autorizado - requiere rol de nutricionista",
        )
    
    # TODO Placeholder. Debería haber una relación entre nutricionistas y usuarios 
    users = session.exec(select(User).where(User.role == "user")).all()
    return users