from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta

from config.database import get_session
from models.patients import Patient, PatientCreate, PatientRead
from models.professionals import Professional, ProfessionalCreate, ProfessionalRead
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


@router_auth.post("/register/patient", response_model=PatientRead)
def register_patient(
    *, session: Session = Depends(get_session), patient_data: PatientCreate
):
    """Registrar un nuevo paciente"""
    existing_patient = session.exec(
        select(Patient).where(Patient.email == patient_data.email)
    ).first()
    
    # Verificar también que no exista un profesional con ese email
    existing_professional = session.exec(
        select(Professional).where(Professional.email == patient_data.email)
    ).first()
    
    if existing_patient or existing_professional:
        raise HTTPException(status_code=400, detail="Correo ya registrado")
    
    hashed_password = get_password_hash(patient_data.password)
    db_patient = Patient(
        email=patient_data.email,
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        password_hash=hashed_password,
        weight=patient_data.weight,
        height=patient_data.height,
        birth_date=patient_data.birth_date,
        gender=patient_data.gender
    )
    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    
    
    return db_patient


@router_auth.post("/register/professional", response_model=ProfessionalRead)
def register_professional(
    *, session: Session = Depends(get_session), professional_data: ProfessionalCreate
):
    """Registrar un nuevo profesional"""
    existing_professional = session.exec(
        select(Professional).where(Professional.email == professional_data.email)
    ).first()
    
    # Verificar también que no exista un paciente con ese email
    existing_patient = session.exec(
        select(Patient).where(Patient.email == professional_data.email)
    ).first()
    
    if existing_professional or existing_patient:
        raise HTTPException(status_code=400, detail="Correo ya registrado")
    
    hashed_password = get_password_hash(professional_data.password)
    db_professional = Professional(
        email=professional_data.email,
        first_name=professional_data.first_name,
        last_name=professional_data.last_name,
        password_hash=hashed_password,
        # Otros campos específicos de profesionales
        specialization=professional_data.specialization,
    )
    session.add(db_professional)
    session.commit()
    session.refresh(db_professional)
    
    return db_professional


@router_auth.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Iniciar sesión y obtener un token de acceso"""
    # Intentar autenticar como paciente primero
    user_type = "patient"
    user = authenticate_user(form_data.username, form_data.password, session, user_type)
    
    # Si no se encuentra como paciente, intentar como profesional
    if not user:
        user_type = "professional"
        user = authenticate_user(form_data.username, form_data.password, session, user_type)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mail o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_type": user_type}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_type": user_type}