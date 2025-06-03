from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, date, timedelta

from config.database import get_session 
from models.weekly_diets import WeeklyDiets
from models.weekly_diet_meals import WeeklyDietMeals, DayOfWeek, MealOfDay
from models.foods import Food
from models.meals import Meal
from utils.calories import calculate_meal_calories
from utils.notifications import create_notification

router_weekly_diets = APIRouter(prefix="/weekly-diets", tags=["Weekly Diets"])

# Crear dieta semanal
@router_weekly_diets.post("/", response_model=WeeklyDiets)
def create_weekly_diet(
    week_start_date: date,
    patient_id: int,
    professional_id: int,
    session: Session = Depends(get_session)
):
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
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    session.add(new_diet)
    session.commit()
    session.refresh(new_diet)
    # (Notificaciones aquí solo si es necesario, pero no afectan la creación)
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


# Obtener todas las dietas semanales de un paciente
@router_weekly_diets.get("/patient/{patient_id}")
def get_patient_weekly_diets(
    patient_id: int,
    session: Session = Depends(get_session)
):
    from models.patients import Patient
    
    # Verificar que el paciente existe
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Obtener todas las dietas semanales del paciente
    weekly_diets = session.exec(
        select(WeeklyDiets).where(WeeklyDiets.patient_id == patient_id)
    ).all()
    
    return weekly_diets

# Obtener todas las dietas semanales de un profesional
@router_weekly_diets.get("/professional/{professional_id}")
def get_professional_weekly_diets(
    professional_id: int,
    session: Session = Depends(get_session)
):
    from models.professionals import Professional
    
    # Verificar que el profesional existe
    professional = session.get(Professional, professional_id)
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    
    # Obtener todas las dietas semanales creadas por el profesional
    weekly_diets = session.exec(
        select(WeeklyDiets).where(WeeklyDiets.professional_id == professional_id)
    ).all()
    
    return weekly_diets

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
    try:
        # Obtener la dieta y sus comidas en una sola consulta
        diet = session.get(WeeklyDiets, weekly_diet_id)
        if not diet:
            raise HTTPException(status_code=404, detail="Weekly diet not found")

        # Obtener todas las comidas en una sola consulta
        meals = session.exec(
            select(WeeklyDietMeals)
            .where(WeeklyDietMeals.weekly_diet_id == weekly_diet_id)
        ).all()

        # Eliminar todas las comidas en una sola operación
        for meal in meals:
            session.delete(meal)
        
        # Eliminar la dieta
        session.delete(diet)
        
        # Intentar hacer commit con reintentos
        max_retries = 3
        retry_count = 0
        while retry_count < max_retries:
            try:
                session.commit()
                break
            except Exception as e:
                retry_count += 1
                if retry_count == max_retries:
                    session.rollback()
                    raise HTTPException(
                        status_code=500,
                        detail="Error al eliminar la dieta. Por favor, intentá nuevamente."
                    )
                session.rollback()
                continue

        return
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail="Error inesperado al eliminar la dieta. Por favor, intentá nuevamente."
        )

# Marcar una comida como completada y agregarla a las meals del paciente
@router_weekly_diets.patch("/{weekly_diet_id}/meals/{meal_id}/complete")
def complete_weekly_diet_meal(
    weekly_diet_id: int,
    meal_id: int,
    grams: float,
    timestamp: datetime = Query(default_factory=datetime.now),
    session: Session = Depends(get_session)
):
    # Verificar que existe la comida en la dieta semanal
    weekly_meal = session.get(WeeklyDietMeals, meal_id)
    if not weekly_meal or weekly_meal.weekly_diet_id != weekly_diet_id:
        raise HTTPException(status_code=404, detail="Meal not found in the specified weekly diet")

    # Verificar si ya está completada
    if weekly_meal.completed:
        raise HTTPException(status_code=400, detail="Meal is already marked as completed")

    # Verificar que la dieta semanal existe y obtener el patient_id
    weekly_diet = session.get(WeeklyDiets, weekly_diet_id)
    if not weekly_diet:
        raise HTTPException(status_code=404, detail="Weekly diet not found")

    # Obtener información del food para calcular calorías
    food = session.get(Food, weekly_meal.food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    # Calcular calorías basado en los gramos usando la función existente
    calories = calculate_meal_calories(
        session=session,
        food_id=weekly_meal.food_id,
        meal_grams=grams
    )

    # Crear nueva meal en la tabla meals
    new_meal = Meal(
        meal_name=weekly_meal.meal_name,
        grams=grams,
        meal_of_the_day=weekly_meal.meal_of_the_day.value,
        timestamp=timestamp,
        food_id=weekly_meal.food_id,
        patient_id=weekly_diet.patient_id,
        calories=calories
    )

    # Marcar la comida de la dieta semanal como completada
    weekly_meal.completed = True

    session.add(new_meal)
    session.commit()
    session.refresh(new_meal)
    session.refresh(weekly_meal)

    return {"message": "Meal completed successfully", "meal": new_meal, "weekly_meal": weekly_meal}

# Endpoint para desmarcar una comida como completada y eliminar el registro de meals
@router_weekly_diets.patch("/{weekly_diet_id}/meals/{meal_id}/uncomplete")
def uncomplete_weekly_diet_meal(
    weekly_diet_id: int,
    meal_id: int,
    session: Session = Depends(get_session)
):
    # Verificar que existe la comida en la dieta semanal
    weekly_meal = session.get(WeeklyDietMeals, meal_id)
    if not weekly_meal or weekly_meal.weekly_diet_id != weekly_diet_id:
        raise HTTPException(status_code=404, detail="Meal not found in the specified weekly diet")
    
    # Verificar que la comida está marcada como completada
    if not weekly_meal.completed:
        raise HTTPException(status_code=400, detail="Meal is not marked as completed")
    
    # Verificar que la dieta semanal existe y obtener el patient_id
    weekly_diet = session.get(WeeklyDiets, weekly_diet_id)
    if not weekly_diet:
        raise HTTPException(status_code=404, detail="Weekly diet not found")
    
    # Buscar y eliminar el registro correspondiente en la tabla meals
    # Buscamos por los campos que relacionan ambas tablas
    meal_to_delete = session.exec(
        select(Meal).where(
            Meal.food_id == weekly_meal.food_id,
            Meal.patient_id == weekly_diet.patient_id,
            Meal.meal_name == weekly_meal.meal_name,
            Meal.meal_of_the_day == weekly_meal.meal_of_the_day.value
        ).order_by(Meal.timestamp.desc())  # Obtener el más reciente
    ).first()
    
    if meal_to_delete:
        session.delete(meal_to_delete)
    
    # Marcar la comida de la dieta semanal como no completada
    weekly_meal.completed = False
    
    session.commit()
    session.refresh(weekly_meal)
    
    return {
        "message": "Meal unmarked as completed successfully", 
        "weekly_meal": weekly_meal,
        "deleted_meal_id": meal_to_delete.id if meal_to_delete else None
    }