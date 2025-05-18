from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator
from models.ingredient_food import IngredientFood 

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.patients import Patient
    from models.meals import Meal
    from models.ingredients import Ingredient

class FoodBase(SQLModel):
    food_name: str
    
    @field_validator('food_name')
    @classmethod
    def validate_food_name(cls, value):
        if len(value) > 100:
            raise ValueError('El nombre de la comida no puede exceder los 100 caracteres')
        return value


class Food(FoodBase, table=True):
    __tablename__ = "foods"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: Optional[int] = Field(default=None, foreign_key="patients.id")
    
    patient: Optional["Patient"] = Relationship(back_populates="custom_foods")
    ingredients: List["Ingredient"] = Relationship(
        back_populates="foods", 
        link_model=IngredientFood
    )
    meals: List["Meal"] = Relationship(back_populates="food")


class FoodCreate(FoodBase):
    patient_id: Optional[int] = None


class FoodRead(FoodBase):
    id: int
    patient_id: Optional[int] = None


class FoodUpdate(SQLModel):
    food_name: Optional[str] = None
    
    @field_validator('food_name')
    @classmethod
    def validate_food_name(cls, value):
        if value is not None and len(value) > 100:
            raise ValueError('El nombre de la comida no puede exceder los 100 caracteres')
        return value