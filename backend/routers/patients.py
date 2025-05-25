from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from config.database import get_session
from models.patients import Patient, PatientRead, PatientUpdate
from models.professionals import ProfessionalRead
from utils.security import get_current_patient, get_password_hash
from models.professionals import Professional, ProfessionalRead

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


@router_patients.post("/assign-professional/{uuid_code}", response_model=PatientRead)
def assign_professional_to_patient(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    uuid_code: str,
):
    """Enlazar un paciente con un profesional"""
    # Verificar si el paciente ya tiene un profesional asignado
    if current_patient.professional_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya tiene un profesional asignado",
        )
    
    # Buscar el profesional por uuid_code
    professional = session.exec(
        select(Professional).where(Professional.uuid_code == uuid_code)
    ).first()
    
    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profesional no encontrado",
        )
    
    # Asignar el profesional al paciente
    current_patient.professional_id = professional.id
    
    session.add(current_patient)
    session.commit()
    session.refresh(current_patient)
    
    return current_patient


@router_patients.delete("/unassign-professional", response_model=PatientRead)
def unassign_professional(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
):
    """Desvincular un paciente de su profesional asignado"""
    if not current_patient.professional_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No tiene un profesional asignado",
        )
    
    # Desvincular el profesional del paciente
    current_patient.professional_id = None
    
    session.add(current_patient)
    session.commit()
    session.refresh(current_patient)
    
    return current_patient