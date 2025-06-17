from typing import Optional, List
from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel, Relationship
import re
from datetime import date

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.foods import Food
    from models.meals import Meal
    from models.professionals import Professional
    from models.weight_logs import WeightLog
    from models.weekly_notes import WeeklyNote
    from models.goals import Goal
    from models.water_intake import WaterIntake
    from models.water_reminders import WaterReminder
    from models.shopping_lists import ShoppingList

class PatientBase(SQLModel):
    email: EmailStr
    first_name: str
    last_name: str
    weight: Optional[float] = None  # en kg
    height: Optional[float] = None  # en cm
    birth_date: Optional[date] = None
    gender: Optional[str] = None # "male", "female", "other" o "prefer not to say"
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        pattern = re.compile(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not pattern.match(value):
            raise ValueError('El correo electrónico contiene caracteres no permitidos')
        return value
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value):
        if len(value) > 40:
            raise ValueError('El nombre no puede exceder los 40 caracteres')
        if not re.match(r'^(?:[A-Z][a-z]+[-\s]?)+$', value):
            raise ValueError('El nombre solo puede contener letras')
        return value
    
    @field_validator('weight', 'height')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value is not None and value <= 0:
            raise ValueError('Los valores deben ser positivos')
        return value
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, value):
        if value is not None and value >= 1000:
            raise ValueError('El peso debe ser menor a 1000 kg')
        return value
    
    @field_validator('height')
    @classmethod
    def validate_height(cls, value):
        if value is not None and value >= 1000:
            raise ValueError('La altura debe ser menor a 1000 cm')
        return value
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, value):
        if value is not None and value not in ["male", "female", "other", "prefer not to say"]:
            raise ValueError('Valor de género desconocido. Debe ser "male", "female", "other" o "prefer not to say"')
        return value

    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, value):
        if value is not None and value > date.today():
            raise ValueError('La fecha de nacimiento no puede ser futura')
        return value


class Patient(PatientBase, table=True):
    __tablename__ = "patients"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    
    # Relación con el profesional (un paciente pertenece a un profesional)
    professional_id: Optional[int] = Field(default=None, foreign_key="professionals.id")
    
    professional: Optional["Professional"] = Relationship(
        back_populates="patients",
        sa_relationship_kwargs={"foreign_keys": "Patient.professional_id"}
    )
    
    custom_foods: List["Food"] = Relationship(back_populates="patient")
    meals: List["Meal"] = Relationship(back_populates="patient")
    weight_logs: List["WeightLog"] = Relationship(back_populates="patient")
    weekly_notes: List["WeeklyNote"] = Relationship(back_populates="patient")
    goals: List["Goal"] = Relationship(back_populates="patient")
    water_intakes: List["WaterIntake"] = Relationship(back_populates="patient")
    water_reminder: List["WaterReminder"] = Relationship(back_populates="patient")
    shopping_lists: List["ShoppingList"] = Relationship(back_populates="patient")


class PatientCreate(PatientBase):
    password: str


class PatientRead(PatientBase):
    id: int
    professional_id: Optional[int] = None


class PatientUpdate(SQLModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    professional_id: Optional[int] = None