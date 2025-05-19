from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from config.database import get_session
from models.meals import Meal, MealCreate, MealRead, MealUpdate
from models.patients import Patient
from models.foods import Food
from models.ingredient_food import IngredientFood
from models.ingredients import Ingredient
from utils.security import get_current_patient
from utils.calories import calculate_meal_calories

router_meals = APIRouter(
    prefix="/meals",
    tags=["Meals"],
    responses={404: {"description": "Not found"}},
)

@router_meals.get("/", response_model=List[MealRead])
def get_meals(
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
):
    """Obtener todas las comidas del usuario actual"""
    meals = session.exec(
        select(Meal).where(Meal.patient_id == current_patient.id)
    ).all()
    
    return meals

@router_meals.post("/", response_model=MealRead)
def create_meal(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    meal_create: MealCreate,
):
    """Crear una nueva comida para el usuario actual"""
    # Si la comida ingresada ya existe en nuestra base de Foods, se usa ese food_id y
    # se recorren los ingredientes que incluye para calcular el total de calorías

    # Buscar comida por nombre
    food = search_food_by_name(session=session, food_name=meal_create.meal_name, current_patient=current_patient)
    
    # Calcular las calorías de la comida
    adjusted_calories = calculate_meal_calories(
        session=session,
        food_id=food.id,
        meal_grams=meal_create.grams,
    )

    # Crear la comida
    new_meal = Meal(
        meal_name=meal_create.meal_name,
        grams=meal_create.grams,
        meal_of_the_day=meal_create.meal_of_the_day,
        timestamp=meal_create.timestamp,
        calories=adjusted_calories,
        food_id=food.id,
        patient_id=current_patient.id,
    )
    
    session.add(new_meal)
    session.commit()
    session.refresh(new_meal)
    
    return new_meal

@router_meals.get("/{meal_id}", response_model=MealRead)
def get_meal(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    meal_id: int,
):
    """Obtener una comida específica del usuario actual"""
    meal = session.exec(
        select(Meal).where(Meal.id == meal_id, Meal.patient_id == current_patient.id)
    ).first()
    
    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found",
        )
    
    return meal

@router_meals.patch("/{meal_id}", response_model=MealRead)
def update_meal(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    meal_id: int,
    meal_update: MealUpdate,
):
    """Actualizar una comida específica del usuario actual"""
    meal = session.exec(
        select(Meal).where(Meal.id == meal_id, Meal.patient_id == current_patient.id)
    ).first()
    
    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found",
        )
    
    meal_data = meal_update.model_dump(exclude_unset=True)
    
    for key, value in meal_data.items():
        setattr(meal, key, value)

    # Si se actualiza la cantidad de gramos, recalcular las calorías
    if "grams" in meal_data:
        food = search_food_by_name(session=session, food_name=meal.meal_name, current_patient=current_patient)
        
        adjusted_calories = calculate_meal_calories(
            session=session,
            food_id=food.id,
            meal_grams=meal.grams,
        )
        
        meal.calories = adjusted_calories
    
    session.add(meal)
    session.commit()
    session.refresh(meal)
    
    return meal

@router_meals.delete("/{meal_id}")
def delete_meal(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    meal_id: int,
):
    """Eliminar una comida específica del usuario actual"""
    meal = session.exec(
        select(Meal).where(Meal.id == meal_id, Meal.patient_id == current_patient.id)
    ).first()
    
    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found",
        )
    
    session.delete(meal)
    session.commit()
    
    return {"message": "Meal deleted successfully"}

def search_food_by_name(
    session: Session,
    food_name: str,
    current_patient: Patient,
):
    """Buscar comida por nombre"""
    food = session.exec(
        select(Food).where(
            (Food.food_name == food_name) &
            ((Food.patient_id == None) | (Food.patient_id == current_patient.id))
        )
    ).first()
    
    if not food:
        raise HTTPException(
            status_code=404,
            detail="Food not found. Please create this food with its ingredients first.",
        )
    
    return food