from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from datetime import datetime

from config.database import get_session
from models.patients import Patient
from models.foods import Food, FoodCreate, FoodRead, FoodUpdate, FoodReadWithIngredients
from models.ingredients import Ingredient
from models.ingredient_food import IngredientFood, IngredientFoodCreate, IngredientFoodRead, AddIngredientsRequest
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

@router_foods.post("/{food_id}/ingredients", response_model=FoodReadWithIngredients)
def add_ingredients_to_custom_food(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    food_id: int,
    ingredients: AddIngredientsRequest,
):
    """Agregar ingredientes con gramos a una comida personalizada"""
    food = session.get(Food, food_id)
    
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    
    if food.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this food")
    
    for ing in ingredients.ingredients:
        ingredient = session.get(Ingredient, ing.ingredient_id)
        if not ingredient:
            raise HTTPException(status_code=404, detail=f"Ingredient {ing.ingredient_id} not found")
        if ing.grams <= 0:
            raise HTTPException(status_code=400, detail="Grams must be greater than 0")
        
        # Verificar si ya existe ese ingrediente en esa comida (opcional)
        statement = select(IngredientFood).where(
            IngredientFood.food_id == food_id,
            IngredientFood.ingredient_id == ing.ingredient_id
        )
        existing_link = session.exec(statement).first()
        if existing_link:
            raise HTTPException(status_code=400, detail=f"Ingredient {ing.ingredient_id} already added") 

        # Crear el enlace entre el ingrediente y la comida
        link = IngredientFood(
            food_id=food_id,
            ingredient_id=ing.ingredient_id,
            grams=ing.grams
        )
        session.add(link)

    session.commit()
    session.refresh(food)
    return JSONResponse(status_code=201, content={"message": "Food created successfully"})