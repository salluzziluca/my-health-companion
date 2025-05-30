from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.foods import Food
    from models.patients import Patient


class MealBase(SQLModel):
    meal_name: str
    grams: float
    meal_of_the_day: str  # breakfast, lunch, dinner, snack, etc.
    timestamp: datetime

    @field_validator('timestamp')
    @classmethod
    def validate_not_future(cls, value):
        if value > datetime.now():
            raise ValueError('La fecha no puede ser mayor a la actual')
        return value
    
    @field_validator('meal_name')
    @classmethod
    def validate_meal_name(cls, value):
        if len(value) > 100:
            raise ValueError('El nombre de la comida no puede exceder los 100 caracteres')
        return value
    
    @field_validator('grams')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value < 0:
            raise ValueError('Los valores no pueden ser negativos')
        return value
    
    @field_validator('meal_of_the_day')
    @classmethod
    def validate_meal_of_the_day(cls, value):
        valid_meals = ["breakfast", "lunch", "dinner", "snack"]
        if value.lower() not in valid_meals:
            raise ValueError(f'Tipo de comida no válido. Debe ser uno de: {", ".join(valid_meals)}')
        return value


class Meal(MealBase, table=True):
    __tablename__ = "meals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    food_id: int = Field(foreign_key="foods.id")
    patient_id: int = Field(foreign_key="patients.id")
    calories: float
    
    # Relationships
    food: "Food" = Relationship(back_populates="meals")
    patient: "Patient" = Relationship(back_populates="meals")


class MealCreate(MealBase):
    meal_name: str
    grams: float
    meal_of_the_day: str
    timestamp: datetime


class MealRead(MealBase):
    id: int
    food_id: int
    patient_id: int
    calories: float


class MealUpdate(SQLModel):
    grams: Optional[float] = None
    meal_of_the_day: Optional[str] = None
    timestamp: Optional[datetime] = None
    
    @field_validator('grams')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value is not None and value < 0:
            raise ValueError('Los valores no pueden ser negativos')
        return value
    
    @field_validator('meal_of_the_day')
    @classmethod
    def validate_meal_of_the_day(cls, value):
        if value is None:
            return value
        valid_meals = ["breakfast", "lunch", "dinner", "snack"] 
        if value.lower() not in valid_meals:
            raise ValueError(f'Tipo de comida no válido. Debe ser uno de: {", ".join(valid_meals)}')
        return value