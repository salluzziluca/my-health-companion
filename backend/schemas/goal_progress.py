from typing import Optional
from sqlmodel import SQLModel

from models.goals import GoalRead


class GoalProgress(SQLModel):
    """Modelo para mostrar el progreso de un objetivo (no es tabla, solo para respuestas)"""
    goal: GoalRead
    
    # Progreso de peso
    current_weight: Optional[float] = None
    weight_progress_difference: Optional[float] = None  # Diferencia con el objetivo (+ = falta bajar, - = se pasó)
    is_weight_achieved: Optional[bool] = None
    
    # Progreso de calorías
    current_daily_calories: Optional[int] = None
    calories_progress_difference: Optional[int] = None  # Diferencia con el objetivo (+ = exceso, - = déficit)
    is_calories_achieved: Optional[bool] = None
    
    # Progreso de hidratación
    current_daily_water: Optional[int] = None  # Mililitros promedio diarios
    water_progress_difference: Optional[int] = None  # Diferencia con el objetivo (+ = exceso, - = déficit)
    is_water_achieved: Optional[bool] = None
    
    # Estado general del objetivo
    is_fully_achieved: bool = False
    days_remaining: Optional[int] = None
    
    # Métricas adicionales para mejor seguimiento
    progress_percentage: Optional[float] = None  # Porcentaje general de progreso del objetivo
    achievement_rate: Optional[float] = None  # Tasa de cumplimiento (útil para objetivos a largo plazo)