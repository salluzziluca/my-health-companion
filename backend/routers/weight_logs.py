from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import date

from config.database import get_session
from models.weight_logs import WeightLog, WeightLogCreate, WeightLogRead
from models.patients import Patient
from utils.security import get_current_patient

router_weight_logs = APIRouter(
    prefix="/patients",
    tags=["Weight Logs"],
    responses={404: {"description": "Not found"}},
)

@router_weight_logs.post("/weight", response_model=WeightLogRead)
def create_weight_log(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    weight_log: WeightLogCreate,
):
    """Registrar nuevo peso del paciente y actualizar el peso actual del paciente"""
    db_weight_log = WeightLog(
        **weight_log.model_dump(),
        patient_id=current_patient.id
    )
    session.add(db_weight_log)
    
    # Actualizar el campo weight del paciente con el último peso registrado
    current_patient.weight = weight_log.weight
    session.add(current_patient)
    session.commit()
    session.refresh(db_weight_log)
    
    return db_weight_log


@router_weight_logs.get("/weight-history", response_model=List[WeightLogRead])
def get_weight_history(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (formato: YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (formato: YYYY-MM-DD)"),
    limit: int = Query(100, description="Número máximo de registros"),
):
    """Obtener historial de peso del paciente"""
    query = select(WeightLog).where(WeightLog.patient_id == current_patient.id)
    
    if start_date:
        query = query.where(func.date(WeightLog.timestamp) >= start_date)
    if end_date:
        query = query.where(func.date(WeightLog.timestamp) <= end_date)
    
    query = query.order_by(WeightLog.timestamp.desc()).limit(limit)
    weight_logs = session.exec(query).all()
    
    return weight_logs