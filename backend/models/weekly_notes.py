from typing import Optional
from datetime import date,datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import UniqueConstraint
from pydantic import field_validator

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.patients import Patient


class WeeklyNoteBase(SQLModel):
    week_start_date: date
    notes: Optional[str] = None
    
    @field_validator('notes')
    @classmethod
    def validate_notes(cls, value):
        if value is not None and len(value) > 1000:
            raise ValueError('Las notas no pueden exceder los 1000 caracteres')
        return value


class WeeklyNote(WeeklyNoteBase, table=True):
    __tablename__ = "weekly_notes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patients.id")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # Relationships
    patient: "Patient" = Relationship(back_populates="weekly_notes")

    class Config:
        # Para asegurar que no se puedan tener múltiples notas para la misma semana
        table_args = (
            UniqueConstraint("patient_id", "week_start_date"),
        )


class WeeklyNoteCreate(WeeklyNoteBase):
    patient_id: int  # 👈 Agregá este campo



class WeeklyNoteRead(WeeklyNoteBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime


class WeeklyNoteUpdate(SQLModel):
    notes: Optional[str] = None
    
    @field_validator('notes')
    @classmethod
    def validate_notes(cls, value):
        if value is not None and len(value) > 1000:
            raise ValueError('Las notas no pueden exceder los 1000 caracteres')
        return value


# Importar las dependencias necesarias
from datetime import datetime
import sqlalchemy