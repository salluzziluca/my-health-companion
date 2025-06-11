from typing import Optional
from datetime import datetime, time
from pydantic import BaseModel, Field, field_validator
from sqlmodel import SQLModel, Field as SQLField, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.patients import Patient


class WaterReminderBase(BaseModel):
    """Configuración base para recordatorios de agua"""
    is_enabled: bool = True
    interval_minutes: int = Field(default=120, ge=1, le=1440, description="Intervalo en minutos entre recordatorios (1-1440)")
    start_time: time = Field(default=time(8, 0), description="Hora de inicio de recordatorios")
    end_time: time = Field(default=time(22, 0), description="Hora de fin de recordatorios")
    custom_message: Optional[str] = Field(None, max_length=200, description="Mensaje personalizado")
    
    @field_validator('interval_minutes')
    @classmethod
    def validate_interval_minutes(cls, value):
        if value < 1 or value > 1440:
            raise ValueError('El intervalo debe estar entre 1 y 1440 minutos (24 horas)')
        return value
    
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
    interval_minutes: Optional[int] = Field(None, ge=1, le=1440)
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    custom_message: Optional[str] = Field(None, max_length=200)
    
    @field_validator('interval_minutes')
    @classmethod
    def validate_interval_minutes(cls, value):
        if value is not None and (value < 1 or value > 1440):
            raise ValueError('El intervalo debe estar entre 1 y 1440 minutos (24 horas)')
        return value


class WaterReminder(WaterReminderBase, SQLModel, table=True):
    __tablename__ = "water_reminders"
    
    id: Optional[int] = SQLField(default=None, primary_key=True)
    patient_id: int = SQLField(foreign_key="patients.id", unique=True)  # Un recordatorio por paciente
    created_at: datetime = SQLField(default_factory=datetime.now)
    updated_at: datetime = SQLField(default_factory=datetime.now)
    
    # Relaciones
    patient: "Patient" = Relationship(back_populates="water_reminder")