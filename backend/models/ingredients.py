from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator
from models.ingredient_food import IngredientFood 

from typing import TYPE_CHECKING
if TYPE_CHECKING:  
    from backend.models.foods import Food

class IngredientBase(SQLModel):
    name: str
    category: str
    unit: str
    calories_kcal: float
    protein_g: float
    fat_g: float
    carbs_g: float
    iron_mg: Optional[float] = None
    calcium_mg: Optional[float] = None
    vitamin_c_mg: Optional[float] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, value):
        if len(value) > 100:
            raise ValueError('El nombre del ingrediente no puede exceder los 100 caracteres')
        return value
    
    @field_validator('calories_kcal', 'protein_g', 'fat_g', 'carbs_g', 'iron_mg', 'calcium_mg', 'vitamin_c_mg')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value is not None and value < 0:
            raise ValueError('Los valores nutricionales no pueden ser negativos')
        return value


class Ingredient(IngredientBase, table=True):
    __tablename__ = "ingredients"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    foods: List["Food"] = Relationship(
        back_populates="ingredients", 
        link_model=IngredientFood  
    )

class IngredientCreate(IngredientBase):
    pass


class IngredientRead(IngredientBase):
    id: int


class IngredientUpdate(SQLModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    calories_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    fat_g: Optional[float] = None
    carbs_g: Optional[float] = None
    iron_mg: Optional[float] = None
    calcium_mg: Optional[float] = None
    vitamin_c_mg: Optional[float] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, value):
        if value is not None and len(value) > 100:
            raise ValueError('El nombre del ingrediente no puede exceder los 100 caracteres')
        return value
    
    @field_validator('calories_kcal', 'protein_g', 'fat_g', 'carbs_g', 'iron_mg', 'calcium_mg', 'vitamin_c_mg')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value is not None and value < 0:
            raise ValueError('Los valores nutricionales no pueden ser negativos')
        return value