from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from config.database import get_session
from models.users import User
from models.profiles import Profile, ProfileRead, ProfileUpdate
from utils.security import get_current_user

router_profiles = APIRouter(
    prefix="/profiles",
    tags=["Profiles"],
    responses={404: {"description": "Not found"}},
)


@router_profiles.get("/me", response_model=ProfileRead)
def get_my_profile(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Obtener el perfil del usuario actual"""
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    return profile


@router_profiles.patch("/me", response_model=ProfileRead)
def update_my_profile(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    profile_update: ProfileUpdate,
):
    """Actualizar el perfil del usuario actual"""
    profile = session.exec(
        select(Profile).where(Profile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    profile_data = profile_update.model_dump(exclude_unset=True)
    for key, value in profile_data.items():
        setattr(profile, key, value)
    
    session.add(profile)
    session.commit()
    session.refresh(profile)
    
    return profile


@router_profiles.get("/user/{user_id}", response_model=ProfileRead)
def get_user_profile(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    user_id: int,
):
    """Obtener el perfil de un usuario (para nutricionistas)"""
    # Solo los nutricionistas pueden ver los perfiles de otros usuarios
    if current_user.role != "nutritionist" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No está autorizado para ver este perfil",
        )
    
    profile = session.exec(select(Profile).where(Profile.user_id == user_id)).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )
    
    return profile