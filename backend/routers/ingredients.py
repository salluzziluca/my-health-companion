from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from config.database import get_session

from models.patients import Patient
from models.ingredients import Ingredient, IngredientCreate, IngredientRead
from models.ingredient_food import IngredientFood, IngredientFoodCreate, IngredientFoodRead
from models.foods import Food, FoodCreate, FoodRead, FoodUpdate, FoodReadWithIngredients
from utils.security import get_current_patient

router_ingredients = APIRouter(
    prefix="/ingredients",
    tags=["Ingredients"],
    responses={404: {"description": "Not found"}},
)

@router_ingredients.get("/{ingredient_id}", response_model=IngredientRead)
def get_ingredient(
    *,
    session: Session = Depends(get_session),
    ingredient_id: int,
):
    """Obtener un ingrediente por su ID"""
    ingredient = session.get(Ingredient, ingredient_id)
    
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    return ingredient

@router_ingredients.get("/", response_model=list[IngredientRead])
def get_all_ingredients(
    *,
    session: Session = Depends(get_session),
):
    """Obtener todos los ingredientes existentes"""
    ingredients = session.exec(
        select(Ingredient)
    ).all()
    
    return ingredients