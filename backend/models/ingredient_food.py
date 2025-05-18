from typing import Optional
from sqlmodel import SQLModel, Field

class IngredientFoodBase(SQLModel):
    ingredient_id: int
    grams: float

    @classmethod
    def validate_grams(cls, value):
        if value <= 0:
            raise ValueError("Grams must be greater than 0")
        return value

class IngredientFood(SQLModel, table=True):
    __tablename__ = "ingredients_foods"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    ingredient_id: int = Field(foreign_key="ingredients.id")
    food_id: int = Field(foreign_key="foods.id")
    grams: float

class IngredientFoodCreate(IngredientFoodBase):
    pass

class IngredientFoodRead(IngredientFoodBase):
    id: int
    ingredient_id: int