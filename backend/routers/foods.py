from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from config.database import get_session
from models.patients import Patient
from models.foods import Food, FoodCreate, FoodRead, FoodUpdate, FoodReadWithIngredients
from models.ingredients import Ingredient
from models.ingredient_food import IngredientFood, IngredientFoodCreate, IngredientFoodRead
from utils.security import get_current_patient

router_foods = APIRouter(
    prefix="/foods",
    tags=["Foods"],
    responses={404: {"description": "Not found"}},
)

@router_foods.get("/", response_model=List[FoodRead])
def get_custom_foods(
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
):
    """Obtener todas las comidas personalizadas del usuario actual"""
    foods = session.exec(
        select(Food).where(Food.patient_id == current_patient.id)
    ).all()
    
    return foods

@router_foods.get("/{food_id}/ingredients", response_model=FoodReadWithIngredients)
def get_food_ingredients(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    food_id: int,
):
    """Obtener los ingredientes de una comida. Si es una comida personalizada, solo el que la creó puede ver los ingredientes"""
    food = session.get(Food, food_id)
    
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    
    if food.patient_id != None and food.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this food")
    
    ingredient_links = session.exec(
        select(IngredientFood).where(IngredientFood.food_id == food_id)
    ).all()
    
    return FoodReadWithIngredients(**food.model_dump(), ingredients=ingredient_links)

@router_foods.post("/", response_model=FoodRead)
def create_custom_food(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    food_create: FoodCreate,
):
    """Crear una nueva comida personalizada para el usuario actual (sin ingredientes aun)"""
    food = Food(**food_create.model_dump())
    food.patient_id = current_patient.id
    
    session.add(food)
    session.commit()
    session.refresh(food)
    
    return food

# FALTA RETOCAR ESTA LOGICA
@router_foods.post("/{food_id}/ingredients", response_model=FoodRead)
def add_ingredients_to_custom_food(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    food_id: int,
    ingredients: List[IngredientFoodCreate],
):
    """Agregar ingredientes con gramos a una comida personalizada"""
    food = session.get(Food, food_id)
    
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    
    if food.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this food")
    
    existing_links = session.exec(
        select(IngredientFood).where(IngredientFood.food_id == food_id)
    ).all()
    existing_ingredient_ids = {link.ingredient_id for link in existing_links}
    
    # Verificar si los ingredientes existen
    ingredient_ids = [ingredient.ingredient_id for ingredient in ingredients]
    existing_ingredients = session.exec(
        select(Ingredient).where(Ingredient.id.in_(ingredient_ids))
    ).all()
    
    if len(existing_ingredients) != len(ingredient_ids):
        raise HTTPException(status_code=404, detail="Some ingredients not found")
    
    # Agregar los ingredientes a la comida
    for ingredient in ingredients:
        if ingredient.ingredient_id in existing_ingredient_ids:
            raise HTTPException(status_code=400, detail=f"Ingredient {ingredient.ingredient_id} already added")
        ingredient_food = IngredientFood(**ingredient.model_dump())
        session.add(ingredient_food)
    
    session.commit()
    session.refresh(food)
    
    return food