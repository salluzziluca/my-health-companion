from typing import Optional
from sqlmodel import SQLModel, Field

class IngredientFood(SQLModel, table=True):
    __tablename__ = "ingredients_foods"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    ingredient_id: int = Field(foreign_key="ingredients.id")
    food_id: int = Field(foreign_key="foods.id")