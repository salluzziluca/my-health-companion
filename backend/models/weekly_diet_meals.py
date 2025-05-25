from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from enum import Enum

class DayOfWeek(str, Enum):
    lunes = "lunes"
    martes = "martes"
    miercoles = "miércoles"
    jueves = "jueves"
    viernes = "viernes"
    sabado = "sábado"
    domingo = "domingo"

class MealOfDay(str, Enum):
    desayuno = "desayuno"
    almuerzo = "almuerzo"
    merienda = "merienda"
    cena = "cena"


class WeeklyDietMeals(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meal_name: str
    day_of_week: DayOfWeek
    meal_of_the_day: MealOfDay
    completed: bool = False

    food_id: int = Field(foreign_key="foods.id")
    weekly_diet_id: int = Field(foreign_key="weeklydiets.id")

    weekly_diet: "WeeklyDiets" = Relationship(back_populates="meals")