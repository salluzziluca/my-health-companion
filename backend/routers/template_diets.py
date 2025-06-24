from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from pydantic import BaseModel

from config.database import get_session
from utils.security import get_current_professional
from models.template_diets import TemplateDiet, TemplateDietMeal
from models.weekly_diet_meals import DayOfWeek, MealOfDay
from models.foods import Food
from models.professionals import Professional
from models.patients import Patient
from utils.notifications import create_notification
from utils.email_notifications import send_full_diet_email
from models.weekly_diets import WeeklyDiets
from models.weekly_diet_meals import WeeklyDietMeals
from datetime import date

router_template_diets = APIRouter(prefix="/template-diets", tags=["Template Diets"])

class CreateTemplateDietRequest(BaseModel):
    name: str

class CreateFromWeeklyDietRequest(BaseModel):
    weekly_diet_id: int
    name: str

class AssignTemplateRequest(BaseModel):
    patient_id: int
    week_start_date: date

class AddMealToTemplateRequest(BaseModel):
    meal_name: str
    day_of_week: DayOfWeek
    meal_of_the_day: MealOfDay
    food_id: int

# Crear una plantilla de dieta
@router_template_diets.post("/", response_model=TemplateDiet)
def create_template_diet(
    request: CreateTemplateDietRequest,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional)
):
    """Crear una nueva plantilla de dieta asociada al profesional actual"""
    from datetime import datetime
    template = TemplateDiet(
        name=request.name, 
        professional_id=current_professional.id,
        created_at=datetime.now()
    )
    session.add(template)
    session.commit()
    session.refresh(template)
    return template


# Agregar comida a la plantilla
@router_template_diets.post("/{template_diet_id}/meals", response_model=TemplateDietMeal)
def add_meal_to_template(
    template_diet_id: int,
    request: AddMealToTemplateRequest,
    session: Session = Depends(get_session)
):
    template = session.get(TemplateDiet, template_diet_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template diet not found")

    food = session.get(Food, request.food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    meal = TemplateDietMeal(
        meal_name=request.meal_name,
        day_of_week=request.day_of_week,
        meal_of_the_day=request.meal_of_the_day,
        food_id=request.food_id,
        template_diet_id=template_diet_id
    )
    session.add(meal)
    session.commit()
    session.refresh(meal)
    return meal


# Obtener todas las plantillas del profesional actual
@router_template_diets.get("/", response_model=List[TemplateDiet])
def get_template_diets(
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional)
):
    """Obtener todas las plantillas de dieta del profesional actual"""
    templates = session.exec(
        select(TemplateDiet).where(TemplateDiet.professional_id == current_professional.id)
    ).all()
    
    # Para cada plantilla, obtener sus comidas
    for template in templates:
        meals = session.exec(
            select(TemplateDietMeal).where(TemplateDietMeal.template_diet_id == template.id)
        ).all()
        template.meals = meals
    
    return templates


# Obtener una plantilla específica
@router_template_diets.get("/{template_diet_id}", response_model=TemplateDiet)
def get_template_diet(
    template_diet_id: int,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional)
):
    """Obtener una plantilla de dieta por ID si fue creada por el profesional actual"""
    template = session.exec(
        select(TemplateDiet).where(
            TemplateDiet.id == template_diet_id,
            TemplateDiet.professional_id == current_professional.id
        )
    ).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template diet not found")
    
    return template
    

# Obtener comidas de una plantilla específica
@router_template_diets.get("/{template_diet_id}/meals", response_model=List[TemplateDietMeal])
def get_meals_from_template(
    template_diet_id: int,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional)
):
    """Obtener todas las comidas de una plantilla de dieta específica"""
    template = session.exec(
        select(TemplateDiet).where(
            TemplateDiet.id == template_diet_id,
            TemplateDiet.professional_id == current_professional.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template diet not found")
    
    meals = session.exec(
        select(TemplateDietMeal).where(TemplateDietMeal.template_diet_id == template_diet_id)
    ).all()
    
    return meals


# Asignar una plantilla de dieta a un paciente
@router_template_diets.post("/{template_diet_id}/assign-to-patient")
def assign_template_to_patient(
    template_diet_id: int,
    request: AssignTemplateRequest,
    session: Session = Depends(get_session)
):
    template = session.get(TemplateDiet, template_diet_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template diet not found")

    # Crear nueva dieta semanal
    new_diet = WeeklyDiets(
        week_start_date=request.week_start_date,
        patient_id=request.patient_id,
        professional_id=template.professional_id
    )
    session.add(new_diet)
    session.commit()
    session.refresh(new_diet)

    # Clonar las comidas
    meals = session.exec(
        select(TemplateDietMeal).where(TemplateDietMeal.template_diet_id == template_diet_id)
    ).all()

    for meal in meals:
        new_meal = WeeklyDietMeals(
            meal_name=meal.meal_name,
            day_of_week=meal.day_of_week,
            meal_of_the_day=meal.meal_of_the_day,
            food_id=meal.food_id,
            weekly_diet_id=new_diet.id
        )
        session.add(new_meal)

    session.commit()
    
    # Notificar al paciente
    patient = session.get(Patient, request.patient_id)
    if not patient or not patient.email:
        raise HTTPException(status_code=404, detail="Patient not found or email not available")

    # Agrupar comidas por día
    meals_by_day = {}
    for meal in meals:
        if meal.day_of_week not in meals_by_day:
            meals_by_day[meal.day_of_week] = []
        meals_by_day[meal.day_of_week].append({
            "meal_name": meal.meal_name,
            "meal_of_the_day": meal.meal_of_the_day.value,
        })

    # Enviar email
    try:
        send_full_diet_email(patient.first_name, patient.email, request.week_start_date, meals_by_day)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending diet email: {str(e)}")

    # Crear notificación interna
    create_notification(
        session=session,
        patient_id=patient.id,
        message="Se te ha asignado una nueva dieta semanal."
    )
    session.commit()

    return {
        "message": "Template assigned and patient notified",
        "weekly_diet_id": new_diet.id,
        "patient_email": patient.email
    }


# Crear una plantilla de dieta a partir de una dieta semanal existente
@router_template_diets.post("/from-weekly", response_model=TemplateDiet)
def create_template_from_weekly_diet(
    request: CreateFromWeeklyDietRequest,
    session: Session = Depends(get_session)
):
    # Obtener dieta semanal
    weekly_diet = session.get(WeeklyDiets, request.weekly_diet_id)
    if not weekly_diet:
        raise HTTPException(status_code=404, detail="Weekly diet not found")

    # Crear nueva plantilla
    from datetime import datetime
    template = TemplateDiet(
        name=request.name,
        professional_id=weekly_diet.professional_id,
        created_at=datetime.now()
    )
    session.add(template)
    session.commit()
    session.refresh(template)

    # Obtener comidas de la dieta semanal
    weekly_meals = session.exec(
        select(WeeklyDietMeals).where(WeeklyDietMeals.weekly_diet_id == request.weekly_diet_id)
    ).all()

    # Clonar cada comida como TemplateDietMeal
    for wm in weekly_meals:
        template_meal = TemplateDietMeal(
            meal_name=wm.meal_name,
            day_of_week=wm.day_of_week,
            meal_of_the_day=wm.meal_of_the_day,
            food_id=wm.food_id,
            template_diet_id=template.id
        )
        session.add(template_meal)

    session.commit()
    return template


# Eliminar una plantilla de dieta
@router_template_diets.delete("/{template_diet_id}", status_code=204)
def delete_template_diet(
    template_diet_id: int,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional)
):
    """Eliminar una plantilla de dieta si fue creada por el profesional actual"""
    template = session.exec(
        select(TemplateDiet).where(
            TemplateDiet.id == template_diet_id,
            TemplateDiet.professional_id == current_professional.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template diet not found")
    
    # Eliminar todas las comidas asociadas
    meals = session.exec(
        select(TemplateDietMeal).where(TemplateDietMeal.template_diet_id == template_diet_id)
    ).all()
    
    for meal in meals:
        session.delete(meal)
    
    session.delete(template)
    session.commit()
    return


# Eliminar una comida de una plantilla
@router_template_diets.delete("/{template_diet_id}/meals/{meal_id}", status_code=204)
def delete_meal_from_template(
    template_diet_id: int,
    meal_id: int,
    session: Session = Depends(get_session),
    current_professional: Professional = Depends(get_current_professional)
):
    """Eliminar una comida de una plantilla de dieta"""
    # Verificar que la plantilla existe y pertenece al profesional
    template = session.exec(
        select(TemplateDiet).where(
            TemplateDiet.id == template_diet_id,
            TemplateDiet.professional_id == current_professional.id
        )
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template diet not found")
    
    # Verificar que la comida existe y pertenece a la plantilla
    meal = session.exec(
        select(TemplateDietMeal).where(
            TemplateDietMeal.id == meal_id,
            TemplateDietMeal.template_diet_id == template_diet_id
        )
    ).first()
    
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found in template")
    
    session.delete(meal)
    session.commit()
    return