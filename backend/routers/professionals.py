from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from config.database import get_session
from models.professionals import Professional, ProfessionalRead, ProfessionalUpdate
from models.patients import Patient, PatientRead
from utils.security import get_current_professional, get_password_hash

router_professionals = APIRouter(
    prefix="/professionals",
    tags=["Professionals"],
    responses={404: {"description": "Not found"}},
)


@router_professionals.get("/me", response_model=ProfessionalRead)
def get_current_professional_info(current_professional: Professional = Depends(get_current_professional)):
    """Obtener información del profesional actual"""
    return current_professional


@router_professionals.patch("/me", response_model=ProfessionalRead)
def update_current_professional(
    *,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional),
    professional_update: ProfessionalUpdate,
):
    """Actualizar información del profesional actual"""
    # Verificar si el mail ya existe si se intenta cambiar
    if professional_update.email and professional_update.email != current_professional.email:
        # Verificar en ambas tablas
        existing_professional = session.exec(
            select(Professional).where(Professional.email == professional_update.email)
        ).first()
        
        existing_patient = session.exec(
            select(Patient).where(Patient.email == professional_update.email)
        ).first()
        
        if existing_professional or existing_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mail ya registrado",
            )
    
    # Actualizar datos del profesional
    professional_data = professional_update.model_dump(exclude_unset=True)
    
    # Hashear la contraseña si se está actualizando
    if "password" in professional_data:
        professional_data["password_hash"] = get_password_hash(professional_data.pop("password"))
    
    for key, value in professional_data.items():
        setattr(current_professional, key, value)
    
    session.add(current_professional)
    session.commit()
    session.refresh(current_professional)
    
    return current_professional


@router_professionals.get("/me/uuid", response_model=str)
def get_current_professional_uuid(
    current_professional: Professional = Depends(get_current_professional)
):
    """Obtener el UUID del profesional actual"""
    return current_professional.uuid_code


@router_professionals.get("/my-patients", response_model=List[PatientRead])
def get_patients_for_professional(
    *,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional),
):
    """Obtener lista de pacientes del profesional actual"""
    # En la relación one-to-many, podemos acceder directamente a los pacientes
    return current_professional.patients


@router_professionals.get("/patient/{patient_id}", response_model=PatientRead)
def get_specific_patient(
    *,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional),
    patient_id: int,
):
    """Obtener información de un paciente específico"""
    patient = session.get(Patient, patient_id)
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )
    
    # Verificar que el paciente pertenezca a este profesional
    if patient.professional_id != current_professional.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No está autorizado para acceder a este paciente",
        )
    
    return patient


@router_professionals.post("/assign-patient/{patient_id}", response_model=PatientRead)
def assign_patient_to_professional(
    *,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional),
    patient_id: int,
):
    """Asignar un paciente al profesional actual"""
    patient = session.get(Patient, patient_id)
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )
    
    # Verificar si el paciente ya está asignado a un profesional
    if patient.professional_id is not None:
        if patient.professional_id == current_professional.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El paciente ya está asignado a este profesional",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El paciente ya está asignado a otro profesional",
            )
    
    # Asignar el paciente a este profesional
    patient.professional_id = current_professional.id
    session.add(patient)
    session.commit()
    session.refresh(patient)
    
    return patient


@router_professionals.delete("/unassign-patient/{patient_id}", response_model=PatientRead)
def unassign_patient(
    *,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional),
    patient_id: int,
):
    """Desasignar un paciente del profesional actual"""
    patient = session.get(Patient, patient_id)
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente no encontrado",
        )
    
    # Verificar que el paciente pertenezca a este profesional
    if patient.professional_id != current_professional.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede desasignar un paciente que no le pertenece",
        )
    
    # Desasignar el paciente
    patient.professional_id = None
    session.add(patient)
    session.commit()
    session.refresh(patient)
    
    return patient