from sqlmodel import Session
from models.notification import Notification  

def create_notification(session: Session, patient_id: int, message: str):
    notification = Notification(
        patient_id=patient_id,
        message=message
    )
    session.add(notification)