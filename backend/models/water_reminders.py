from typing import  Optional
from datetime import datetime, time
from pydantic import BaseModel, Field, field_validator
from enum import Enum
from sqlmodel import SQLModel, Field as SQLField, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.patients import Patient

class ReminderFrequency(str, Enum):
    HOURLY = "hourly"
    EVERY_2_HOURS = "every_2_hours"
    EVERY_3_HOURS = "every_3_hours"
    CUSTOM = "custom"


class WaterReminderBase(BaseModel):
    """Configuración base para recordatorios de agua"""
    is_enabled: bool = True
    frequency: ReminderFrequency = ReminderFrequency.EVERY_2_HOURS
    start_time: time = Field(default=time(8, 0), description="Hora de inicio de recordatorios")
    end_time: time = Field(default=time(22, 0), description="Hora de fin de recordatorios")
    custom_message: Optional[str] = Field(None, max_length=200, description="Mensaje personalizado")
    
    @field_validator('start_time', 'end_time')
    @classmethod
    def validate_times(cls, value):
        if not isinstance(value, time):
            raise ValueError('Debe ser un objeto time válido')
        return value
    
    @field_validator('custom_message')
    @classmethod
    def validate_message(cls, value):
        if value and len(value) > 200:
            raise ValueError('El mensaje no puede exceder los 200 caracteres')
        return value


class WaterReminderCreate(WaterReminderBase):
    pass


class WaterReminderRead(WaterReminderBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime


class WaterReminderUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    frequency: Optional[ReminderFrequency] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    custom_message: Optional[str] = None




class WaterReminder(WaterReminderBase, SQLModel, table=True):
    __tablename__ = "water_reminders"
    
    id: Optional[int] = SQLField(default=None, primary_key=True)
    patient_id: int = SQLField(foreign_key="patients.id", unique=True)  # Un recordatorio por paciente
    created_at: datetime = SQLField(default_factory=datetime.now)
    updated_at: datetime = SQLField(default_factory=datetime.now)
    
    # Relaciones
    patient: "Patient" = Relationship(back_populates="water_reminder")

