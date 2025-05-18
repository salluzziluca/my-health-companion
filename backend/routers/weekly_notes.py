from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import date, datetime

from config.database import get_session
from models.weekly_notes import WeeklyNote, WeeklyNoteCreate, WeeklyNoteRead
from utils.security import get_current_patient

router_weekly_notes = APIRouter(
    prefix="/patients",
    tags=["Weekly Notes"],
    responses={404: {"description": "Not found"}},
)


@router_weekly_notes.post("/weekly-notes", response_model=WeeklyNoteRead)
def create_or_update_weekly_note(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    weekly_note: WeeklyNoteCreate,
):
    """Crear o actualizar notas de la semana"""
    # Verificar si ya existe una nota para esta semana
    existing_note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == weekly_note.week_start_date
        )
    ).first()
    
    if existing_note:
        # Actualizar nota existente
        existing_note.notes = weekly_note.notes
        existing_note.updated_at = datetime.now()
        session.add(existing_note)
        session.commit()
        session.refresh(existing_note)
        return existing_note
    else:
        # Crear nueva nota
        db_note = WeeklyNote(
            **weekly_note.model_dump(),
            patient_id=current_patient.id
        )
        session.add(db_note)
        session.commit()
        session.refresh(db_note)
        return db_note


@router_weekly_notes.get("/weekly-notes/{week_start_date}", response_model=WeeklyNoteRead)
def get_weekly_note(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    week_start_date: date,
):
    """Obtener notas de una semana específica"""
    note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == week_start_date
        )
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron notas para esta semana",
        )
    
    return note


@router_weekly_notes.delete("/weekly-notes/{week_start_date}")
def delete_weekly_note(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    week_start_date: date,
):
    """Eliminar notas de una semana"""
    note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == week_start_date
        )
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron notas para esta semana",
        )
    
    session.delete(note)
    session.commit()
    
    return {"message": "Notas eliminadas exitosamente"}