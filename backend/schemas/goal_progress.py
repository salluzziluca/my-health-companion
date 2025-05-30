
from typing import Optional
from sqlmodel import SQLModel

from models.goals import GoalRead


class GoalProgress(SQLModel):
    """Modelo para mostrar el progreso de un objetivo (no es tabla, solo para respuestas)"""
    goal: GoalRead
    current_weight: Optional[float] = None
    current_daily_calories: Optional[int] = None
    weight_progress_percentage: Optional[float] = None
    calories_progress_percentage: Optional[float] = None
    is_weight_achieved: Optional[bool] = None
    is_calories_achieved: Optional[bool] = None
    is_fully_achieved: bool = False
    days_remaining: Optional[int] = None