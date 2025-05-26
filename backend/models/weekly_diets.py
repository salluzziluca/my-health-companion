from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date

class WeeklyDiets(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    week_start_date: date  # fecha del lunes de esa semana
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    patient_id: int = Field(foreign_key="patients.id")
    professional_id: int = Field(foreign_key="professionals.id")

    meals: List["WeeklyDietMeals"] = Relationship(back_populates="weekly_diet") # type: ignore