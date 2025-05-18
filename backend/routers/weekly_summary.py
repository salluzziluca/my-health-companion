from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import date, datetime, timedelta
from collections import Counter

from config.database import get_session
from models.weight_logs import WeightLog, WeightLogCreate, WeightLogRead
from models.weekly_notes import WeeklyNote, WeeklyNoteCreate, WeeklyNoteRead, WeeklyNoteUpdate
from models.meals import Meal
from models.foods import Food
from schemas.weekly_summary import (
    WeeklySummaryResponse, 
    WeeklySummaryHistoryResponse,
    WeightData, 
    CalorieData, 
    MealTrends
)
from utils.security import get_current_patient

router_weight_logs = APIRouter(
    prefix="/patients",
    tags=["Weight Logs"],
    responses={404: {"description": "Not found"}},
)

router_weekly_summaries = APIRouter(
    prefix="/patients",
    tags=["Weekly Summaries"],
    responses={404: {"description": "Not found"}},
)

router_weekly_notes = APIRouter(
    prefix="/patients",
    tags=["Weekly Notes"],
    responses={404: {"description": "Not found"}},
)


def get_week_start_date(date_obj: date) -> date:
    """Obtiene el inicio de la semana (lunes) para una fecha dada"""
    days_since_monday = date_obj.weekday()
    return date_obj - timedelta(days=days_since_monday)


def get_week_end_date(week_start: date) -> date:
    """Obtiene el final de la semana (domingo) para un inicio de semana dado"""
    return week_start + timedelta(days=6)


# ==================== WEIGHT LOGS ====================

@router_weight_logs.post("/weight", response_model=WeightLogRead)
def create_weight_log(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    weight_log: WeightLogCreate,
):
    """Registrar nuevo peso del paciente"""
    db_weight_log = WeightLog(
        **weight_log.model_dump(),
        patient_id=current_patient.id
    )
    session.add(db_weight_log)
    session.commit()
    session.refresh(db_weight_log)
    return db_weight_log


@router_weight_logs.get("/weight-history", response_model=List[WeightLogRead])
def get_weight_history(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (formato: YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (formato: YYYY-MM-DD)"),
    limit: int = Query(100, description="Número máximo de registros"),
):
    """Obtener historial de peso del paciente"""
    query = select(WeightLog).where(WeightLog.patient_id == current_patient.id)
    
    if start_date:
        query = query.where(func.date(WeightLog.timestamp) >= start_date)
    if end_date:
        query = query.where(func.date(WeightLog.timestamp) <= end_date)
    
    query = query.order_by(WeightLog.timestamp.desc()).limit(limit)
    weight_logs = session.exec(query).all()
    
    return weight_logs


# ==================== WEEKLY NOTES ====================

@router_weekly_notes.post("/weekly-notes", response_model=WeeklyNoteRead)
def create_or_update_weekly_note(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    weekly_note: WeeklyNoteCreate,
):
    """Crear o actualizar notas de la semana"""
    # Verificar si ya existe una nota para esta semana
    existing_note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == weekly_note.week_start_date
        )
    ).first()
    
    if existing_note:
        # Actualizar nota existente
        existing_note.notes = weekly_note.notes
        existing_note.updated_at = datetime.utcnow()
        session.add(existing_note)
        session.commit()
        session.refresh(existing_note)
        return existing_note
    else:
        # Crear nueva nota
        db_note = WeeklyNote(
            **weekly_note.model_dump(),
            patient_id=current_patient.id
        )
        session.add(db_note)
        session.commit()
        session.refresh(db_note)
        return db_note


@router_weekly_notes.get("/weekly-notes/{week_start_date}", response_model=WeeklyNoteRead)
def get_weekly_note(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    week_start_date: date,
):
    """Obtener notas de una semana específica"""
    note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == week_start_date
        )
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron notas para esta semana",
        )
    
    return note


@router_weekly_notes.delete("/weekly-notes/{week_start_date}")
def delete_weekly_note(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    week_start_date: date,
):
    """Eliminar notas de una semana"""
    note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == week_start_date
        )
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron notas para esta semana",
        )
    
    session.delete(note)
    session.commit()
    
    return {"message": "Notas eliminadas exitosamente"}


# ==================== WEEKLY SUMMARIES ====================

@router_weekly_summaries.get("/weekly-summary", response_model=WeeklySummaryResponse)
def get_weekly_summary(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    week_start_date: Optional[date] = Query(None, description="Fecha de inicio de la semana (lunes). Si no se proporciona, usa la semana actual"),
):
    """Obtener resumen semanal del progreso del paciente"""
    
    # Si no se proporciona fecha, usar la semana actual
    if not week_start_date:
        today = date.today()
        week_start_date = get_week_start_date(today)
    
    week_end_date = get_week_end_date(week_start_date)
    
    # Convertir a datetime para las consultas
    week_start_datetime = datetime.combine(week_start_date, datetime.min.time())
    week_end_datetime = datetime.combine(week_end_date, datetime.max.time())
    
    # ========== DATOS DE PESO ==========
    weight_data = WeightData()
    
    # Obtener pesos de la semana
    week_weights = session.exec(
        select(WeightLog).where(
            WeightLog.patient_id == current_patient.id,
            WeightLog.timestamp >= week_start_datetime,
            WeightLog.timestamp <= week_end_datetime
        ).order_by(WeightLog.timestamp)
    ).all()
    
    if week_weights:
        weight_data.start_weight = week_weights[0].weight
        weight_data.end_weight = week_weights[-1].weight
        weight_data.weight_change = weight_data.end_weight - weight_data.start_weight
        weight_data.weight_logs = [
            {
                "date": log.timestamp.date().isoformat(),
                "weight": log.weight,
                "timestamp": log.timestamp.isoformat()
            }
            for log in week_weights
        ]
    
    # ========== DATOS DE CALORÍAS ==========
    # Obtener comidas de la semana con información de comida
    week_meals = session.exec(
        select(Meal, Food).join(Food).where(
            Meal.patient_id == current_patient.id,
            Meal.timestamp >= week_start_datetime,
            Meal.timestamp <= week_end_datetime
        ).order_by(Meal.timestamp)
    ).all()
    
    total_calories = sum(meal.calories for meal, _ in week_meals)
    
    # Agrupar por día
    daily_calories = {}
    for meal, food in week_meals:
        meal_date = meal.timestamp.date()
        if meal_date not in daily_calories:
            daily_calories[meal_date] = {"calories": 0, "meals_count": 0}
        daily_calories[meal_date]["calories"] += meal.calories
        daily_calories[meal_date]["meals_count"] += 1
    
    days_logged = len(daily_calories)
    average_daily_calories = total_calories / days_logged if days_logged > 0 else 0
    
    daily_breakdown = [
        {
            "date": date_key.isoformat(),
            "calories": data["calories"],
            "meals_count": data["meals_count"]
        }
        for date_key, data in sorted(daily_calories.items())
    ]
    
    calorie_data = CalorieData(
        total_calories=total_calories,
        average_daily_calories=round(average_daily_calories, 2),
        days_logged=days_logged,
        daily_breakdown=daily_breakdown
    )
    
    # ========== TENDENCIAS DE COMIDAS ==========
    all_foods = [food.food_name for _, food in week_meals]
    food_counter = Counter(all_foods)
    favorite_foods = [food for food, _ in food_counter.most_common(5)]
    
    # Distribución por tipo de comida
    meal_distribution = {}
    meal_times = []
    for meal, _ in week_meals:
        meal_type = meal.meal_of_the_day.lower()
        meal_distribution[meal_type] = meal_distribution.get(meal_type, 0) + 1
        meal_times.append(meal.timestamp.hour)
    
    # Hora más frecuente de comida
    most_frequent_hour = None
    if meal_times:
        hour_counter = Counter(meal_times)
        most_frequent_hour = hour_counter.most_common(1)[0][0]
        most_frequent_meal_time = f"{most_frequent_hour:02d}:00-{most_frequent_hour+1:02d}:00"
    else:
        most_frequent_meal_time = None
    
    meal_trends = MealTrends(
        total_meals=len(week_meals),
        favorite_foods=favorite_foods,
        most_frequent_meal_time=most_frequent_meal_time,
        meal_distribution=meal_distribution
    )
    
    # ========== NOTAS SEMANALES ==========
    weekly_note = session.exec(
        select(WeeklyNote).where(
            WeeklyNote.patient_id == current_patient.id,
            WeeklyNote.week_start_date == week_start_date
        )
    ).first()
    
    notes = weekly_note.notes if weekly_note else None
    
    return WeeklySummaryResponse(
        week_start_date=week_start_date,
        week_end_date=week_end_date,
        weight_data=weight_data,
        calorie_data=calorie_data,
        meal_trends=meal_trends,
        notes=notes
    )


@router_weekly_summaries.get("/weekly-summary/history", response_model=WeeklySummaryHistoryResponse)
def get_weekly_summary_history(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    limit: int = Query(10, description="Número máximo de semanas a retornar"),
    offset: int = Query(0, description="Número de semanas a saltar"),
):
    """Obtener historial de resúmenes semanales"""
    
    # Obtener todas las semanas con comidas del paciente
    meals_query = session.exec(
        select(func.date(Meal.timestamp).label('meal_date'))
        .where(Meal.patient_id == current_patient.id)
        .distinct()
        .order_by(func.date(Meal.timestamp).desc())
    ).all()
    
    # Agrupar fechas por semana
    weeks_with_data = set()
    for meal_date in meals_query:
        week_start = get_week_start_date(meal_date)
        weeks_with_data.add(week_start)
    
    # Convertir a lista ordenada
    sorted_weeks = sorted(weeks_with_data, reverse=True)
    
    # Aplicar paginación
    paginated_weeks = sorted_weeks[offset:offset + limit]
    
    summaries = []
    for week_start in paginated_weeks:
        week_end = get_week_end_date(week_start)
        
        # Obtener datos básicos de la semana
        week_start_datetime = datetime.combine(week_start, datetime.min.time())
        week_end_datetime = datetime.combine(week_end, datetime.max.time())
        
        # Calorías totales de la semana
        week_meals = session.exec(
            select(Meal).where(
                Meal.patient_id == current_patient.id,
                Meal.timestamp >= week_start_datetime,
                Meal.timestamp <= week_end_datetime
            )
        ).all()
        
        total_calories = sum(meal.calories for meal in week_meals)
        
        # Días únicos con comidas
        unique_days = len(set(meal.timestamp.date() for meal in week_meals))
        average_daily_calories = total_calories / unique_days if unique_days > 0 else 0
        
        # Cambio de peso
        week_weights = session.exec(
            select(WeightLog).where(
                WeightLog.patient_id == current_patient.id,
                WeightLog.timestamp >= week_start_datetime,
                WeightLog.timestamp <= week_end_datetime
            ).order_by(WeightLog.timestamp)
        ).all()
        
        weight_change = None
        if len(week_weights) >= 2:
            weight_change = week_weights[-1].weight - week_weights[0].weight
        
        # Verificar si tiene notas
        has_notes = bool(session.exec(
            select(WeeklyNote).where(
                WeeklyNote.patient_id == current_patient.id,
                WeeklyNote.week_start_date == week_start
            )
        ).first())
        
        summaries.append({
            "week_start_date": week_start,
            "week_end_date": week_end,
            "total_calories": total_calories,
            "average_daily_calories": round(average_daily_calories, 2),
            "weight_change": round(weight_change, 2) if weight_change else None,
            "has_notes": has_notes
        })
    
    return WeeklySummaryHistoryResponse(
        summaries=summaries,
        total_count=len(sorted_weeks),
        has_more=offset + limit < len(sorted_weeks)
    )