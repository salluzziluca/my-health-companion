from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel


class WeightData(BaseModel):
    start_weight: Optional[float] = None
    end_weight: Optional[float] = None
    weight_change: Optional[float] = None
    weight_logs: List[Dict[str, Any]] = []


class CalorieData(BaseModel):
    total_calories: float
    average_daily_calories: float
    days_logged: int
    daily_breakdown: List[Dict[str, Any]] = []


class MealTrends(BaseModel):
    total_meals: int
    favorite_foods: List[str] = []
    most_frequent_meal_time: Optional[str] = None
    meal_distribution: Dict[str, int] = {}  # breakfast, lunch, dinner, snack counts


class WeeklySummaryResponse(BaseModel):
    week_start_date: date
    week_end_date: date
    weight_data: WeightData
    calorie_data: CalorieData
    meal_trends: MealTrends
    notes: Optional[str] = None


class WeeklySummaryListItem(BaseModel):
    week_start_date: date
    week_end_date: date
    total_calories: float
    average_daily_calories: float
    weight_change: Optional[float] = None
    has_notes: bool = False


class WeeklySummaryHistoryResponse(BaseModel):
    summaries: List[WeeklySummaryListItem]
    total_count: int
    has_more: bool