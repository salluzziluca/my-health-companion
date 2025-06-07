from typing import Optional
from pydantic import field_validator, model_validator
from sqlmodel import Field, SQLModel, Relationship
from datetime import date, datetime
from enum import Enum

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.patients import Patient
    from models.professionals import Professional


class GoalType(str, Enum):
    WEIGHT = "weight"
    CALORIES = "calories"
    WATER = "water"


class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class GoalBase(SQLModel):
    goal_type: GoalType
    target_weight: Optional[float] = None  # en kg
    target_calories: Optional[int] = None  
    target_milliliters: Optional[int] = None  # mililitros de agua diarios
    start_date: date
    target_date: Optional[date] = None
    status: GoalStatus = GoalStatus.ACTIVE
    
    @field_validator('target_weight')
    @classmethod
    def validate_target_weight(cls, value):
        if value is not None and value <= 0:
            raise ValueError('El peso objetivo debe ser positivo')
        if value is not None and value >= 1000:
            raise ValueError('El peso objetivo no puede exceder los 3 dígitos')
        return value
    
    @field_validator('target_calories')
    @classmethod
    def validate_target_calories(cls, value):
        if value is not None and value <= 0:
            raise ValueError('Las calorías objetivo deben ser positivas')
        if value is not None and value > 10000:
            raise ValueError('Las calorías objetivo no pueden exceder las 10000')
        return value
    
    @field_validator('target_milliliters')
    @classmethod
    def validate_target_milliliters(cls, value):
        if value is not None and value <= 0:
            raise ValueError('Los mililitros de agua objetivos deben ser positivos')
        if value is not None and value > 10000:
            raise ValueError('Los mililitros de agua objetivos no pueden exceder los 10000')
        return value

    @field_validator('target_date')
    @classmethod
    def validate_target_date(cls, value, info):
        if value is not None:
            start_date = info.data.get('start_date')
            if start_date and value <= start_date:
                raise ValueError('La fecha objetivo debe ser posterior a la fecha de inicio')
        return value


class Goal(GoalBase, table=True):
    __tablename__ = "goals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id")
    professional_id: int = Field(foreign_key="professionals.id")
    achieved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relaciones
    patient: "Patient" = Relationship()
    professional: "Professional" = Relationship()

class GoalCreate(GoalBase):
    patient_id: int
    
    @model_validator(mode='after')
    def validate_goal_requirements(self):
        """Validación personalizada a nivel de modelo"""
        if self.goal_type == GoalType.WEIGHT and self.target_weight is None:
            raise ValueError('Se requiere target_weight para objetivos de peso')
        if self.goal_type == GoalType.CALORIES and self.target_calories is None:
            raise ValueError('Se requiere target_calories para objetivos de calorías')
        if self.goal_type == GoalType.WATER and self.target_milliliters is None:
            raise ValueError('Se requiere target_milliliters para objetivos de hidratación')
        
        return self


class GoalRead(GoalBase):
    id: int
    patient_id: int
    professional_id: int
    achieved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class GoalUpdate(SQLModel):
    goal_type: Optional[GoalType] = None
    target_weight: Optional[float] = None
    target_calories: Optional[int] = None
    target_milliliters: Optional[int] = None
    target_date: Optional[date] = None
    status: Optional[GoalStatus] = None
    
    @field_validator('target_weight')
    @classmethod
    def validate_target_weight(cls, value):
        if value is not None and value <= 0:
            raise ValueError('El peso objetivo debe ser positivo')
        if value is not None and value >= 1000:
            raise ValueError('El peso objetivo no puede exceder los 3 dígitos')
        return value
    
    @field_validator('target_calories')
    @classmethod
    def validate_target_calories(cls, value):
        if value is not None and value <= 0:
            raise ValueError('Las calorías objetivo deben ser positivas')
        if value is not None and value > 10000:
            raise ValueError('Las calorías objetivo no pueden exceder las 10000')
        return value
    
    @field_validator('target_milliliters')
    @classmethod
    def validate_target_milliliters(cls, value):
        if value is not None and value <= 0:
            raise ValueError('Los mililitros de agua objetivos deben ser positivos')
        if value is not None and value > 10000:
            raise ValueError('Los mililitros de agua objetivos no pueden exceder los 10000')
        return value