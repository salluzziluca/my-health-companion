from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.patients import Patient


class WaterIntakeBase(SQLModel):
    amount_ml: int  # Cantidad en mililitros
    intake_time: datetime
    notes: Optional[str] = None
    
    @field_validator('amount_ml')
    @classmethod
    def validate_amount(cls, value):
        if value <= 0:
            raise ValueError('La cantidad debe ser positiva')
        if value > 2000:  # 2 litros máximo por ingesta
            raise ValueError('La cantidad no puede exceder los 2000ml por ingesta')
        return value
    
    @field_validator('intake_time')
    @classmethod
    def validate_not_future(cls, value):
        now = datetime.now(timezone.utc)
        value_utc = value.astimezone(timezone.utc) if value.tzinfo else now
        if value_utc > now:
            raise ValueError('La fecha de ingesta no puede ser futura')
        return value
    
    @field_validator('notes')
    @classmethod
    def validate_notes(cls, value):
        if value is not None and len(value) > 200:
            raise ValueError('Las notas no pueden exceder los 200 caracteres')
        return value


class WaterIntake(WaterIntakeBase, table=True):
    __tablename__ = "water_intake"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id")
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    patient: "Patient" = Relationship(back_populates="water_intakes")


class WaterIntakeCreate(WaterIntakeBase):
    patient_id: int


class WaterIntakeRead(WaterIntakeBase):
    id: int
    patient_id: int
    created_at: datetime


class WaterIntakeUpdate(SQLModel):
    amount_ml: Optional[int] = None
    intake_time: Optional[datetime] = None
    notes: Optional[str] = None
    
    @field_validator('amount_ml')
    @classmethod
    def validate_amount(cls, value):
        if value is not None:
            if value <= 0:
                raise ValueError('La cantidad debe ser positiva')
            if value > 2000:
                raise ValueError('La cantidad no puede exceder los 2000ml por ingesta')
        return value
    
    @field_validator('intake_time')
    @classmethod
    def validate_not_future(cls, value):
        if value is not None:
            now = datetime.now(timezone.utc)
            value_utc = value.astimezone(timezone.utc) if value.tzinfo else now
            if value_utc > now:
                raise ValueError('La fecha de ingesta no puede ser futura')
        return value
    
    @field_validator('notes')
    @classmethod
    def validate_notes(cls, value):
        if value is not None and len(value) > 200:
            raise ValueError('Las notas no pueden exceder los 200 caracteres')
        return value