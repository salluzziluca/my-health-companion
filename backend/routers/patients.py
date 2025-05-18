from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from config.database import get_session
from models.patients import Patient, PatientRead, PatientUpdate
from models.professionals import ProfessionalRead
from utils.security import get_current_patient, get_password_hash

router_patients = APIRouter(
    prefix="/patients",
    tags=["Patients"],
    responses={404: {"description": "Not found"}},
)


@router_patients.get("/me", response_model=PatientRead)
def get_current_patient_info(current_patient: Patient = Depends(get_current_patient)):
    """Obtener información del paciente actual"""
    return current_patient


@router_patients.patch("/me", response_model=PatientRead)
def update_current_patient(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    patient_update: PatientUpdate,
):
    """Actualizar información del paciente actual"""
    # Verificar si el mail ya existe si se intenta cambiar
    if patient_update.email and patient_update.email != current_patient.email:
        # Verificar en ambas tablas
        existing_patient = session.exec(
            select(Patient).where(Patient.email == patient_update.email)
        ).first()
        
        existing_professional = session.exec(
            select(Professional).where(Professional.email == patient_update.email)
        ).first()
        
        if existing_patient or existing_professional:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mail ya registrado",
            )
    
    # No permitimos que los pacientes cambien su professional_id directamente
    if "professional_id" in patient_update.model_dump(exclude_unset=True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede cambiar su profesional asignado directamente",
        )
    
    # Actualizar datos del paciente
    patient_data = patient_update.model_dump(exclude_unset=True)
    
    # Hashear la contraseña si se está actualizando
    if "password" in patient_data:
        patient_data["password_hash"] = get_password_hash(patient_data.pop("password"))
    
    for key, value in patient_data.items():
        setattr(current_patient, key, value)
    
    session.add(current_patient)
    session.commit()
    session.refresh(current_patient)
    
    return current_patient


@router_patients.get("/my-professional", response_model=ProfessionalRead)
def get_my_professional(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
):
    """Obtener información del profesional asignado al paciente"""
    if not current_patient.professional_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tiene un profesional asignado",
        )
    
    professional = session.get(Professional, current_patient.professional_id)
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El profesional asignado no fue encontrado",
        )
    
    return professional

# Importaciones que faltaban
from models.professionals import Professional, ProfessionalRead