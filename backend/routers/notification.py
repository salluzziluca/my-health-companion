from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from models.notification import Notification
from config.database import get_session
from utils.security import get_current_patient
from sqlalchemy import func

router_notifications = APIRouter(prefix="/notifications", tags=["notifications"])

# Obtener notificaciones
@router_notifications.get("/", response_model=list[Notification])
def get_my_notifications(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient)
):
    return session.exec(
        select(Notification)
        .where(Notification.patient_id == current_patient.id)
        .order_by(Notification.created_at.desc())
    ).all()

# Marcar notifiacion como leida
@router_notifications.post("/{id}/read")
def mark_notification_as_read(
    id: int,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient)
):
    notification = session.get(Notification, id)
    if not notification or notification.patient_id != current_patient.id:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    notification.is_read = True
    session.add(notification)
    session.commit()
    return {"message": "Notificación marcada como leída"}

# Eliminar una notificacion
@router_notifications.delete("/{id}")
def delete_notification(
    id: int,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient)
):
    notification = session.get(Notification, id)
    if not notification or notification.patient_id != current_patient.id:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")

    session.delete(notification)
    session.commit()
    return {"message": "Notificación eliminada"}

# Contar notificaciones sin leer
@router_notifications.get("/unread-count")
def get_unread_notifications_count(
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient)
):
    count = session.exec(
    select(func.count()).select_from(Notification).where(
        Notification.patient_id == current_patient.id,
        Notification.is_read == False
    )
    ).one()

    return {"unread_count": count}