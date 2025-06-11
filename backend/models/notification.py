from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id")
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.now)

    patient: "Patient" = Relationship() # type: ignore