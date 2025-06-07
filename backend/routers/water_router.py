from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import date, datetime, timezone, timedelta

from config.database import get_session
from models.water import WaterIntake, WaterIntakeCreate, WaterIntakeRead, WaterIntakeUpdate
from models.goals import Goal, GoalType, GoalStatus
from models.patients import Patient
from utils.security import get_current_patient, get_current_professional
from utils.notifications import create_notification


router_water = APIRouter(
    prefix="/water",
    tags=["Water Intake"],
    responses={404: {"description": "Not found"}},
)


@router_water.post("/", response_model=WaterIntakeRead)
def create_water_intake(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    water_intake: WaterIntakeCreate,
):
    """Registrar una nueva ingesta de agua (solo pacientes)"""
    # Verificar que el paciente está registrando para sí mismo
    if water_intake.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Solo puedes registrar tu propia ingesta de agua")
    
    # Crear la nueva ingesta
    db_water_intake = WaterIntake(**water_intake.model_dump())
    session.add(db_water_intake)
    session.commit()
    session.refresh(db_water_intake)
    
    # Verificar si se alcanzó la meta diaria de agua
    check_daily_water_goal(session, current_patient.id, water_intake.intake_time.date())
    
    return db_water_intake


@router_water.get("/", response_model=List[WaterIntakeRead])
def get_my_water_intakes(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    start_date: Optional[date] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    limit: Optional[int] = Query(50, le=100, description="Límite de resultados"),
):
    """Obtener mis ingestas de agua (solo pacientes)"""
    query = select(WaterIntake).where(WaterIntake.patient_id == current_patient.id)
    
    if start_date:
        query = query.where(func.date(WaterIntake.intake_time) >= start_date)
    if end_date:
        query = query.where(func.date(WaterIntake.intake_time) <= end_date)
    
    query = query.order_by(WaterIntake.intake_time.desc())
    
    if limit:
        query = query.limit(limit)
    
    water_intakes = session.exec(query).all()
    return water_intakes


@router_water.get("/daily-summary")
def get_daily_water_summary(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    target_date: Optional[date] = Query(None, description="Fecha objetivo (por defecto hoy)"),
):
    """Obtener resumen diario de consumo de agua"""
    if not target_date:
        target_date = date.today()
    
    # Obtener todas las ingestas del día
    daily_intakes = session.exec(
        select(WaterIntake)
        .where(
            WaterIntake.patient_id == current_patient.id,
            func.date(WaterIntake.intake_time) == target_date
        )
        .order_by(WaterIntake.intake_time)
    ).all()
    
    total_ml = sum(intake.amount_ml for intake in daily_intakes)
    total_glasses = round(total_ml / 250, 1)  # Asumiendo 250ml por vaso
    
    # Obtener meta de agua activa
    water_goal = session.exec(
        select(Goal)
        .where(
            Goal.patient_id == current_patient.id,
            Goal.goal_type == GoalType.WATER,
            Goal.status == GoalStatus.ACTIVE
        )
        .order_by(Goal.created_at.desc())
        .limit(1)
    ).first()
    
    goal_ml = water_goal.target_milliliters if water_goal else 2000  # Meta por defecto: 2L
    goal_glasses = round(goal_ml / 250, 1)
    
    progress_percentage = min(round((total_ml / goal_ml) * 100, 1), 100) if goal_ml > 0 else 0
    remaining_ml = max(goal_ml - total_ml, 0)
    remaining_glasses = round(remaining_ml / 250, 1)
    
    return {
        "date": target_date,
        "total_consumed_ml": total_ml,
        "total_consumed_glasses": total_glasses,
        "goal_ml": goal_ml,
        "goal_glasses": goal_glasses,
        "progress_percentage": progress_percentage,
        "remaining_ml": remaining_ml,
        "remaining_glasses": remaining_glasses,
        "is_goal_achieved": total_ml >= goal_ml,
        "intakes_count": len(daily_intakes),
        "intakes": [
            {
                "id": intake.id,
                "amount_ml": intake.amount_ml,
                "amount_glasses": round(intake.amount_ml / 250, 1),
                "time": intake.intake_time.strftime("%H:%M"),
                "notes": intake.notes
            }
            for intake in daily_intakes
        ]
    }


@router_water.get("/weekly-summary")
def get_weekly_water_summary(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    week_start: Optional[date] = Query(None, description="Inicio de la semana (por defecto: lunes de esta semana)"),
):
    """Obtener resumen semanal de consumo de agua"""
    if not week_start:
        today = date.today()
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
    
    week_end = week_start + timedelta(days=6)
    
    # Obtener todas las ingestas de la semana
    weekly_intakes = session.exec(
        select(WaterIntake)
        .where(
            WaterIntake.patient_id == current_patient.id,
            func.date(WaterIntake.intake_time) >= week_start,
            func.date(WaterIntake.intake_time) <= week_end
        )
        .order_by(WaterIntake.intake_time)
    ).all()
    
    # Agrupar por día
    daily_totals = {}
    for i in range(7):
        current_date = week_start + timedelta(days=i)
        daily_totals[current_date] = 0
    
    for intake in weekly_intakes:
        intake_date = intake.intake_time.date()
        if intake_date in daily_totals:
            daily_totals[intake_date] += intake.amount_ml
    
    # Obtener meta de agua activa
    water_goal = session.exec(
        select(Goal)
        .where(
            Goal.patient_id == current_patient.id,
            Goal.goal_type == GoalType.WATER,
            Goal.status == GoalStatus.ACTIVE
        )
        .order_by(Goal.created_at.desc())
        .limit(1)
    ).first()
    
    goal_ml = water_goal.target_milliliters if water_goal else 2000
    
    # Calcular estadísticas
    total_week_ml = sum(daily_totals.values())
    avg_daily_ml = round(total_week_ml / 7, 1)
    days_goal_achieved = sum(1 for total in daily_totals.values() if total >= goal_ml)
    
    # Preparar datos diarios
    daily_data = []
    for current_date, total_ml in daily_totals.items():
        daily_data.append({
            "date": current_date,
            "day_name": current_date.strftime("%A"),
            "total_ml": total_ml,
            "total_glasses": round(total_ml / 250, 1),
            "progress_percentage": min(round((total_ml / goal_ml) * 100, 1), 100) if goal_ml > 0 else 0,
            "goal_achieved": total_ml >= goal_ml
        })
    
    return {
        "week_start": week_start,
        "week_end": week_end,
        "total_week_ml": total_week_ml,
        "total_week_glasses": round(total_week_ml / 250, 1),
        "average_daily_ml": avg_daily_ml,
        "average_daily_glasses": round(avg_daily_ml / 250, 1),
        "goal_ml": goal_ml,
        "goal_glasses": round(goal_ml / 250, 1),
        "days_goal_achieved": days_goal_achieved,
        "weekly_success_rate": round((days_goal_achieved / 7) * 100, 1),
        "daily_data": daily_data
    }


@router_water.put("/{intake_id}", response_model=WaterIntakeRead)
def update_water_intake(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    intake_id: int = Path(..., description="ID de la ingesta de agua"),
    water_update: WaterIntakeUpdate,
):
    """Actualizar una ingesta de agua (solo pacientes - sus propias ingestas)"""
    water_intake = session.get(WaterIntake, intake_id)
    if not water_intake:
        raise HTTPException(status_code=404, detail="Ingesta de agua no encontrada")
    
    # Verificar que la ingesta pertenece al paciente actual
    if water_intake.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Solo puedes modificar tus propias ingestas de agua")
    
    # Actualizar campos
    update_data = water_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(water_intake, key, value)
    
    session.add(water_intake)
    session.commit()
    session.refresh(water_intake)
    
    return water_intake


@router_water.delete("/{intake_id}")
def delete_water_intake(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    intake_id: int = Path(..., description="ID de la ingesta de agua"),
):
    """Eliminar una ingesta de agua (solo pacientes - sus propias ingestas)"""
    water_intake = session.get(WaterIntake, intake_id)
    if not water_intake:
        raise HTTPException(status_code=404, detail="Ingesta de agua no encontrada")
    
    # Verificar que la ingesta pertenece al paciente actual
    if water_intake.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Solo puedes eliminar tus propias ingestas de agua")
    
    session.delete(water_intake)
    session.commit()
    
    return {"message": "Ingesta de agua eliminada exitosamente"}


# Endpoints para profesionales
@router_water.get("/patient/{patient_id}", response_model=List[WaterIntakeRead])
def get_patient_water_intakes(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    patient_id: int = Path(..., description="ID del paciente"),
    start_date: Optional[date] = Query(None, description="Fecha de inicio"),
    end_date: Optional[date] = Query(None, description="Fecha de fin"),
    limit: Optional[int] = Query(50, le=100),
):
    """Obtener ingestas de agua de un paciente (solo profesionales asignados)"""
    # Verificar que el paciente existe y pertenece al profesional
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    if patient.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver los datos de este paciente")
    
    query = select(WaterIntake).where(WaterIntake.patient_id == patient_id)
    
    if start_date:
        query = query.where(func.date(WaterIntake.intake_time) >= start_date)
    if end_date:
        query = query.where(func.date(WaterIntake.intake_time) <= end_date)
    
    query = query.order_by(WaterIntake.intake_time.desc())
    
    if limit:
        query = query.limit(limit)
    
    water_intakes = session.exec(query).all()
    return water_intakes


@router_water.get("/patient/{patient_id}/daily-summary")
def get_patient_daily_water_summary(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    patient_id: int = Path(..., description="ID del paciente"),
    target_date: Optional[date] = Query(None, description="Fecha objetivo"),
):
    """Obtener resumen diario de agua de un paciente (solo profesionales asignados)"""
    # Verificar que el paciente existe y pertenece al profesional
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    if patient.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver los datos de este paciente")
    
    if not target_date:
        target_date = date.today()
    
    # Obtener todas las ingestas del día
    daily_intakes = session.exec(
        select(WaterIntake)
        .where(
            WaterIntake.patient_id == patient_id,
            func.date(WaterIntake.intake_time) == target_date
        )
        .order_by(WaterIntake.intake_time)
    ).all()
    
    total_ml = sum(intake.amount_ml for intake in daily_intakes)
    
    # Obtener meta de agua activa
    water_goal = session.exec(
        select(Goal)
        .where(
            Goal.patient_id == patient_id,
            Goal.goal_type == GoalType.WATER,
            Goal.status == GoalStatus.ACTIVE
        )
        .order_by(Goal.created_at.desc())
        .limit(1)
    ).first()
    
    goal_ml = water_goal.target_milliliters if water_goal else 2000
    progress_percentage = min(round((total_ml / goal_ml) * 100, 1), 100) if goal_ml > 0 else 0
    
    return {
        "patient_id": patient_id,
        "date": target_date,
        "total_consumed_ml": total_ml,
        "total_consumed_glasses": round(total_ml / 250, 1),
        "goal_ml": goal_ml,
        "goal_glasses": round(goal_ml / 250, 1),
        "progress_percentage": progress_percentage,
        "is_goal_achieved": total_ml >= goal_ml,
        "intakes_count": len(daily_intakes)
    }


# Función auxiliar para verificar metas diarias
def check_daily_water_goal(session: Session, patient_id: int, target_date: date):
    """Verificar si se alcanzó la meta diaria de agua y crear notificación"""
    # Obtener meta de agua activa
    water_goal = session.exec(
        select(Goal)
        .where(
            Goal.patient_id == patient_id,
            Goal.goal_type == GoalType.WATER,
            Goal.status == GoalStatus.ACTIVE
        )
        .order_by(Goal.created_at.desc())
        .limit(1)
    ).first()
    
    if not water_goal:
        return
    
    # Calcular total del día
    daily_total = session.exec(
        select(func.sum(WaterIntake.amount_ml))
        .where(
            WaterIntake.patient_id == patient_id,
            func.date(WaterIntake.intake_time) == target_date
        )
    ).first() or 0
    
    # Si se alcanzó la meta, crear notificación
    if daily_total >= water_goal.target_milliliters:
        message = f"💧 ¡Excelente! Alcanzaste tu meta diaria de hidratación: {water_goal.target_milliliters}ml"
        create_notification(session, patient_id, message)
        session.commit()