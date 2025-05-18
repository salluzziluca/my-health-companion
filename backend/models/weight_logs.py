from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.patients import Patient


class WeightLogBase(SQLModel):
    weight: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, value):
        if value <= 0:
            raise ValueError('El peso debe ser un valor positivo')
        if value >= 1000:
            raise ValueError('El peso no puede exceder los 3 dígitos')
        return value


class WeightLog(WeightLogBase, table=True):
    __tablename__ = "weight_logs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id")
    
    # Relationships
    patient: "Patient" = Relationship(back_populates="weight_logs")


class WeightLogCreate(WeightLogBase):
    pass  # patient_id se obtiene del token


class WeightLogRead(WeightLogBase):
    id: int
    patient_id: int


class WeightLogUpdate(SQLModel):
    weight: Optional[float] = None
    timestamp: Optional[datetime] = None
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, value):
        if value is not None and value <= 0:
            raise ValueError('El peso debe ser un valor positivo')
        if value is not None and value >= 1000:
            raise ValueError('El peso no puede exceder los 3 dígitos')
        return value