from datetime import datetime, time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from config.database import get_session
from models.water_reminders import ReminderFrequency, WaterReminder, WaterReminderCreate, WaterReminderRead, WaterReminderUpdate
from utils.notifications import create_notification
from utils.security import get_current_patient


router_water_reminders = APIRouter(
    prefix="/water/reminders",
    tags=["Water Reminders"],
    responses={404: {"description": "Not found"}},
)


@router_water_reminders.post("/", response_model=WaterReminderRead)
def create_or_update_water_reminder(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    reminder_config: WaterReminderCreate,
):
    """Crear o actualizar configuración de recordatorios de agua"""
    # Verificar si ya existe un recordatorio para este paciente
    existing_reminder = session.exec(
        select(WaterReminder).where(WaterReminder.patient_id == current_patient.id)
    ).first()
    
    if existing_reminder:
        # Actualizar el existente
        for key, value in reminder_config.model_dump().items():
            setattr(existing_reminder, key, value)
        existing_reminder.updated_at = datetime.now()
        session.add(existing_reminder)
        session.commit()
        session.refresh(existing_reminder)
        return existing_reminder
    else:
        # Crear nuevo
        db_reminder = WaterReminder(
            **reminder_config.model_dump(),
            patient_id=current_patient.id
        )
        session.add(db_reminder)
        session.commit()
        session.refresh(db_reminder)
        return db_reminder


@router_water_reminders.get("/", response_model=Optional[WaterReminderRead])
def get_my_water_reminder(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
):
    """Obtener mi configuración de recordatorios de agua"""
    reminder = session.exec(
        select(WaterReminder).where(WaterReminder.patient_id == current_patient.id)
    ).first()
    
    return reminder


@router_water_reminders.put("/", response_model=WaterReminderRead)
def update_water_reminder(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    reminder_update: WaterReminderUpdate,
):
    """Actualizar configuración de recordatorios de agua"""
    reminder = session.exec(
        select(WaterReminder).where(WaterReminder.patient_id == current_patient.id)
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="No tienes recordatorios configurados")
    
    # Actualizar campos
    update_data = reminder_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(reminder, key, value)
    
    reminder.updated_at = datetime.now()
    session.add(reminder)
    session.commit()
    session.refresh(reminder)
    
    return reminder


@router_water_reminders.delete("/")
def delete_water_reminder(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
):
    """Eliminar configuración de recordatorios de agua"""
    reminder = session.exec(
        select(WaterReminder).where(WaterReminder.patient_id == current_patient.id)
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="No tienes recordatorios configurados")
    
    session.delete(reminder)
    session.commit()
    
    return {"message": "Recordatorios de agua eliminados exitosamente"}


@router_water_reminders.post("/send-now")
def send_water_reminder_now(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
):
    """Enviar un recordatorio de agua inmediatamente (para pruebas)"""
    reminder = session.exec(
        select(WaterReminder).where(WaterReminder.patient_id == current_patient.id)
    ).first()
    
    if not reminder or not reminder.is_enabled:
        raise HTTPException(status_code=400, detail="No tienes recordatorios habilitados")
    
    # Mensajes por defecto según frecuencia
    default_messages = {
        ReminderFrequency.HOURLY: "💧 ¡Hora de hidratarse! Recuerda beber un vaso de agua.",
        ReminderFrequency.EVERY_2_HOURS: "💧 ¡Es momento de beber agua! Tu cuerpo te lo agradecerá.",
        ReminderFrequency.EVERY_3_HOURS: "💧 ¡Tiempo de hidratación! Mantén tu cuerpo bien hidratado.",
        ReminderFrequency.CUSTOM: "💧 ¡Recuerda mantenerte hidratado!"
    }
    
    message = reminder.custom_message or default_messages.get(
        reminder.frequency, 
        "💧 ¡Recuerda beber agua!"
    )
    
    create_notification(session, current_patient.id, message)
    session.commit()
    
    return {"message": "Recordatorio enviado exitosamente"}


# Funciones utilitarias para el sistema de recordatorios
def get_reminder_interval_minutes(frequency: ReminderFrequency) -> int:
    """Obtener el intervalo en minutos según la frecuencia"""
    intervals = {
        ReminderFrequency.HOURLY: 60,
        ReminderFrequency.EVERY_2_HOURS: 120,
        ReminderFrequency.EVERY_3_HOURS: 180,
        ReminderFrequency.CUSTOM: 120  # Por defecto cada 2 horas
    }
    return intervals.get(frequency, 120)


def should_send_reminder(reminder: WaterReminder, current_time: time) -> bool:
    """Determinar si se debe enviar un recordatorio en el momento actual"""
    if not reminder.is_enabled:
        return False
    
    # Verificar si estamos dentro del horario configurado
    if reminder.start_time <= reminder.end_time:
        # Caso normal: start_time < end_time (ej: 8:00 - 22:00)
        return reminder.start_time <= current_time <= reminder.end_time
    else:
        # Caso especial: start_time > end_time (ej: 22:00 - 8:00, a través de medianoche)
        return current_time >= reminder.start_time or current_time <= reminder.end_time


# Función para el cron job o tarea programada
def send_scheduled_water_reminders(session: Session):
    """
    Función para enviar recordatorios programados de agua.
    Esta función debe ser llamada por un cron job o tarea programada.
    """
    from datetime import datetime
    
    current_time = datetime.now().time()
    current_minute = current_time.hour * 60 + current_time.minute
    
    # Obtener todos los recordatorios activos
    active_reminders = session.exec(
        select(WaterReminder).where(WaterReminder.is_enabled == True)
    ).all()
    
    for reminder in active_reminders:
        if should_send_reminder(reminder, current_time):
            interval_minutes = get_reminder_interval_minutes(reminder.frequency)
            
            # Verificar si es momento de enviar (según el intervalo)
            if current_minute % interval_minutes == 0:
                default_messages = {
                    ReminderFrequency.HOURLY: "💧 ¡Hora de hidratarse! Recuerda beber un vaso de agua.",
                    ReminderFrequency.EVERY_2_HOURS: "💧 ¡Es momento de beber agua! Tu cuerpo te lo agradecerá.",
                    ReminderFrequency.EVERY_3_HOURS: "💧 ¡Tiempo de hidratación! Mantén tu cuerpo bien hidratado.",
                    ReminderFrequency.CUSTOM: "💧 ¡Recuerda mantenerte hidratado!"
                }
                
                message = reminder.custom_message or default_messages.get(
                    reminder.frequency, 
                    "💧 ¡Recuerda beber agua!"
                )
                
                create_notification(session, reminder.patient_id, message)
    
    session.commit()