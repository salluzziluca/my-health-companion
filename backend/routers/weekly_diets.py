from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, date

from config.database import get_session 
from models.weekly_diets import WeeklyDiets
from models.weekly_diet_meals import WeeklyDietMeals, DayOfWeek, MealOfDay
from models.foods import Food

router_weekly_diets = APIRouter(prefix="/weekly-diets", tags=["Weekly Diets"])

#Crear dieta semanal
@router_weekly_diets.post("/", response_model=WeeklyDiets)
def create_weekly_diet(
    week_start_date: date,
    patient_id: int,
    professional_id: int,
    session: Session = Depends(get_session)
):
    # Verificamos si ya existe una dieta para ese paciente en esa semana
    existing = session.exec(
        select(WeeklyDiets).where(
            WeeklyDiets.week_start_date == week_start_date,
            WeeklyDiets.patient_id == patient_id
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Weekly diet already exists for that patient and week")

    new_diet = WeeklyDiets(
        week_start_date=week_start_date,
        patient_id=patient_id,
        professional_id=professional_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(new_diet)
    session.commit()
    session.refresh(new_diet)
    return new_diet

#Agregar comida a dieta semanal específicada por ID
@router_weekly_diets.post("/{weekly_diet_id}/meals", response_model=WeeklyDietMeals)
def add_meal_to_weekly_diet(
    weekly_diet_id: int,
    meal_name: str,
    day_of_week: DayOfWeek,
    meal_of_the_day: MealOfDay,
    food_id: int,
    session: Session = Depends(get_session)
):
    # Validamos que exista la dieta
    diet = session.get(WeeklyDiets, weekly_diet_id)
    if not diet:
        raise HTTPException(status_code=404, detail="Weekly diet not found")

    # Validamos que el food exista
    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    meal = WeeklyDietMeals(
        meal_name=meal_name,
        day_of_week=day_of_week,
        meal_of_the_day=meal_of_the_day,
        food_id=food_id,
        weekly_diet_id=weekly_diet_id,
        completed=False
    )

    session.add(meal)
    session.commit()
    session.refresh(meal)
    return meal

#Para ver las comidas de la dieta semanal específica, con opción de pedirle completadas en true o false
@router_weekly_diets.get("/{weekly_diet_id}/meals")
def get_weekly_diet_meals_with_status(
    weekly_diet_id: int,                  
    completed: Optional[bool] = None,    # Parámetro opcional para filtrar comidas completadas o no
    session: Session = Depends(get_session)
):
    weekly_diet = session.get(WeeklyDiets, weekly_diet_id)
    if not weekly_diet:
        raise HTTPException(status_code=404, detail="Weekly diet not found")

    query = select(WeeklyDietMeals).where(WeeklyDietMeals.weekly_diet_id == weekly_diet_id)

    # Si el parámetro 'completed' fue enviado, agrego filtro para filtrar por ese estado
    if completed is not None:
        query = query.where(WeeklyDietMeals.completed == completed)

    meals = session.exec(query).all()

    return meals

# Borrar una comida específica de una dieta semanal
@router_weekly_diets.delete("/{weekly_diet_id}/meals/{meal_id}", status_code=204)
def delete_meal_from_weekly_diet(
    weekly_diet_id: int,
    meal_id: int,
    session: Session = Depends(get_session)
):
    meal = session.get(WeeklyDietMeals, meal_id)
    if not meal or meal.weekly_diet_id != weekly_diet_id:
        raise HTTPException(status_code=404, detail="Meal not found in the specified weekly diet")

    session.delete(meal)
    session.commit()
    return  

# Borrar una dieta semanal completa
@router_weekly_diets.delete("/{weekly_diet_id}", status_code=204)
def delete_weekly_diet(
    weekly_diet_id: int,
    session: Session = Depends(get_session)
):
    diet = session.get(WeeklyDiets, weekly_diet_id)
    if not diet:
        raise HTTPException(status_code=404, detail="Weekly diet not found")

    meals = session.exec(select(WeeklyDietMeals).where(WeeklyDietMeals.weekly_diet_id == weekly_diet_id)).all()
    for meal in meals:
        session.delete(meal)

    session.delete(diet)
    session.commit()
    return