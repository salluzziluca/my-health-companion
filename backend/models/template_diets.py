from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from models.weekly_diet_meals import DayOfWeek, MealOfDay


class TemplateDiet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.now)

    professional_id: int = Field(foreign_key="professionals.id")

    meals: List["TemplateDietMeal"] = Relationship(back_populates="template_diet")  # type: ignore


class TemplateDietMeal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meal_name: str
    day_of_week: DayOfWeek
    meal_of_the_day: MealOfDay

    food_id: int = Field(foreign_key="foods.id")
    template_diet_id: int = Field(foreign_key="templatediet.id")

    template_diet: "TemplateDiet" = Relationship(back_populates="meals")  # type: ignore