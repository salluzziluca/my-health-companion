from fastapi import APIRouter, Depends, HTTPException, Path
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import date, datetime

from config.database import get_session
from models.goals import Goal, GoalCreate, GoalRead, GoalUpdate, GoalProgress, GoalStatus, GoalType
from models.patients import Patient
from models.professionals import Professional
from models.weight_logs import WeightLog
from models.meals import Meal
from utils.security import get_current_patient, get_current_professional

router_goals = APIRouter(
    prefix="/goals",
    tags=["Goals"],
    responses={404: {"description": "Not found"}},
)


@router_goals.post("/", response_model=GoalRead)
def create_goal(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    goal: GoalCreate,
):
    """Crear un nuevo objetivo para un paciente (solo profesionales)"""
    # Verificar que el paciente existe y pertenece al profesional
    patient = session.get(Patient, goal.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    if patient.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para asignar objetivos a este paciente")
    
    # Cancelar objetivos activos anteriores del mismo tipo
    existing_goals = session.exec(
        select(Goal)
        .where(Goal.patient_id == goal.patient_id)
        .where(Goal.status == GoalStatus.ACTIVE)
        .where(Goal.goal_type == goal.goal_type)
    ).all()
    
    for existing_goal in existing_goals:
        existing_goal.status = GoalStatus.CANCELLED
        existing_goal.updated_at = datetime.now()
        session.add(existing_goal)
    
    # Crear el nuevo objetivo
    db_goal = Goal(
        **goal.model_dump(),
        professional_id=current_professional.id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    session.add(db_goal)
    session.commit()
    session.refresh(db_goal)
    
    return db_goal


@router_goals.get("/patient/{patient_id}", response_model=List[GoalRead])
def get_patient_goals(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    patient_id: int = Path(..., description="ID del paciente"),
    status: Optional[GoalStatus] = None,
):
    """Obtener objetivos de un paciente (solo profesionales)"""
    # Verificar que el paciente existe y pertenece al profesional
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    if patient.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver los objetivos de este paciente")
    
    query = select(Goal).where(Goal.patient_id == patient_id)
    
    if status:
        query = query.where(Goal.status == status)
    
    query = query.order_by(Goal.created_at.desc())
    goals = session.exec(query).all()
    
    return goals


@router_goals.get("/my-goals", response_model=List[GoalRead])
def get_my_goals(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
    status: Optional[GoalStatus] = None,
):
    """Obtener mis objetivos (solo pacientes)"""
    query = select(Goal).where(Goal.patient_id == current_patient.id)
    
    if status:
        query = query.where(Goal.status == status)
    
    query = query.order_by(Goal.created_at.desc())
    goals = session.exec(query).all()
    
    return goals


@router_goals.get("/my-goals/active", response_model=List[GoalRead])
def get_my_active_goals(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
):
    """Obtener mis objetivos activos (solo pacientes)"""
    query = select(Goal).where(
        Goal.patient_id == current_patient.id,
        Goal.status == GoalStatus.ACTIVE
    ).order_by(Goal.created_at.desc())
    
    goals = session.exec(query).all()
    return goals


@router_goals.get("/my-goals/progress", response_model=List[GoalProgress])
def get_my_goals_progress(
    *,
    session: Session = Depends(get_session),
    current_patient = Depends(get_current_patient),
):
    """Obtener el progreso de mis objetivos activos (solo pacientes)"""
    # Obtener objetivos activos
    active_goals = session.exec(
        select(Goal).where(
            Goal.patient_id == current_patient.id,
            Goal.status == GoalStatus.ACTIVE
        )
    ).all()
    
    if not active_goals:
        return []
    
    progress_list = []
    
    for goal in active_goals:
        progress = GoalProgress(goal=goal)
        
        # Calcular progreso de peso
        if goal.goal_type in [GoalType.WEIGHT, GoalType.BOTH] and goal.target_weight:
            # Obtener el peso más reciente
            latest_weight = session.exec(
                select(WeightLog)
                .where(WeightLog.patient_id == current_patient.id)
                .order_by(WeightLog.timestamp.desc())
                .limit(1)
            ).first()
            
            if latest_weight:
                progress.current_weight = latest_weight.weight
                
                # Calcular porcentaje de progreso de peso
                initial_weight = current_patient.weight or latest_weight.weight
                if initial_weight != goal.target_weight:
                    weight_diff = abs(latest_weight.weight - initial_weight)
                    target_diff = abs(goal.target_weight - initial_weight)
                    progress.weight_progress_percentage = min((weight_diff / target_diff) * 100, 100) if target_diff > 0 else 100
                else:
                    progress.weight_progress_percentage = 100
                
                # Verificar si se alcanzó el objetivo de peso (con tolerancia de 0.5kg)
                progress.is_weight_achieved = abs(latest_weight.weight - goal.target_weight) <= 0.5
        
        # Calcular progreso de calorías (promedio de los últimos 7 días)
        if goal.goal_type in [GoalType.CALORIES, GoalType.BOTH] and goal.target_calories:
            # Obtener calorías de los últimos 7 días
            seven_days_ago = datetime.now().date() - date.today().replace(day=7)
            recent_meals = session.exec(
                select(Meal)
                .where(
                    Meal.patient_id == current_patient.id,
                    func.date(Meal.timestamp) >= seven_days_ago
                )
            ).all()
            
            if recent_meals:
                # Agrupar por día y sumar calorías
                daily_calories = {}
                for meal in recent_meals:
                    meal_date = meal.timestamp.date()
                    if meal_date not in daily_calories:
                        daily_calories[meal_date] = 0
                    daily_calories[meal_date] += meal.calories
                
                if daily_calories:
                    avg_calories = sum(daily_calories.values()) / len(daily_calories)
                    progress.current_daily_calories = int(avg_calories)
                    
                    # Calcular porcentaje de progreso de calorías
                    progress.calories_progress_percentage = min((avg_calories / goal.target_calories) * 100, 100)
                    
                    # Verificar si se alcanzó el objetivo de calorías (con tolerancia del 5%)
                    tolerance = goal.target_calories * 0.05
                    progress.is_calories_achieved = abs(avg_calories - goal.target_calories) <= tolerance
        
        # Verificar si el objetivo está completamente alcanzado
        if goal.goal_type == GoalType.WEIGHT:
            progress.is_fully_achieved = progress.is_weight_achieved or False
        elif goal.goal_type == GoalType.CALORIES:
            progress.is_fully_achieved = progress.is_calories_achieved or False
        elif goal.goal_type == GoalType.BOTH:
            progress.is_fully_achieved = (progress.is_weight_achieved or False) and (progress.is_calories_achieved or False)
        
        # Calcular días restantes
        if goal.target_date:
            days_remaining = (goal.target_date - date.today()).days
            progress.days_remaining = max(days_remaining, 0)
        
        progress_list.append(progress)
    
    return progress_list


@router_goals.put("/{goal_id}", response_model=GoalRead)
def update_goal(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    goal_id: int = Path(..., description="ID del objetivo"),
    goal_update: GoalUpdate,
):
    """Actualizar un objetivo (solo profesionales)"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    
    # Verificar que el objetivo pertenece al profesional
    if goal.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar este objetivo")
    
    # Actualizar campos
    goal_data = goal_update.model_dump(exclude_unset=True)
    for key, value in goal_data.items():
        setattr(goal, key, value)
    
    goal.updated_at = datetime.now()
    
    # Si se marca como completado, establecer achieved_at
    if goal_update.status == GoalStatus.COMPLETED and not goal.achieved_at:
        goal.achieved_at = datetime.now()
    
    session.add(goal)
    session.commit()
    session.refresh(goal)
    
    return goal


@router_goals.delete("/{goal_id}")
def delete_goal(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    goal_id: int = Path(..., description="ID del objetivo"),
):
    """Eliminar un objetivo (solo profesionales)"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    
    # Verificar que el objetivo pertenece al profesional
    if goal.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este objetivo")
    
    session.delete(goal)
    session.commit()
    
    return {"message": "Objetivo eliminado exitosamente"}


@router_goals.post("/{goal_id}/complete")
def mark_goal_as_completed(
    *,
    session: Session = Depends(get_session),
    current_professional = Depends(get_current_professional),
    goal_id: int = Path(..., description="ID del objetivo"),
):
    """Marcar un objetivo como completado (solo profesionales)"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    
    # Verificar que el objetivo pertenece al profesional
    if goal.professional_id != current_professional.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para modificar este objetivo")
    
    goal.status = GoalStatus.COMPLETED
    goal.achieved_at = datetime.now()
    goal.updated_at = datetime.now()
    
    session.add(goal)
    session.commit()
    session.refresh(goal)
    
    return {"message": "Objetivo marcado como completado", "goal": goal}