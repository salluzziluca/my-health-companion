from typing import Optional
from datetime import date
from sqlmodel import Field, SQLModel, Relationship
from pydantic import field_validator


# Clase base para perfiles
class ProfileBase(SQLModel):
    weight: Optional[float] = None  # en kg
    height: Optional[float] = None  # en cm
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    
    @field_validator('weight', 'height')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value is not None and value <= 0:
            raise ValueError('El valor debe ser positivo')
        return value
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, value):
        if value is not None and value >= 1000:
            raise ValueError('El peso no puede exceder los 3 dígitos')
        return value
    
    @field_validator('height')
    @classmethod
    def validate_height(cls, value):
        if value is not None and value >= 1000:
            raise ValueError('La altura no puede exceder los 3 dígitos')
        return value
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, value):
        if value is not None and value not in ["male", "female", "other", "prefer not to say"]:
            raise ValueError('Valor de género desconocido. Debe ser "male", "female", "other" o "prefer not to say"')
        return value


# Clase para la tabla de perfiles
class Profile(ProfileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    user: "User" = Relationship(back_populates="profile")


# Clase para crear un nuevo perfil
class ProfileCreate(ProfileBase):
    pass


# Clase para leer datos de perfil
class ProfileRead(ProfileBase):
    id: int
    user_id: int


# Clase para actualizar datos de perfil
class ProfileUpdate(SQLModel):
    weight: Optional[float] = None
    height: Optional[float] = None
    birth_date: Optional[date] = None
    gender: Optional[str] = None
    
    @field_validator('weight', 'height')
    @classmethod
    def validate_positive_numbers(cls, value):
        if value is not None and value <= 0:
            raise ValueError('El valor debe ser positivo')
        return value
    
    @field_validator('weight')
    @classmethod
    def validate_weight(cls, value):
        if value is not None and value >= 1000:
            raise ValueError('El peso no puede exceder los 3 digitos')
        return value
    
    @field_validator('height')
    @classmethod
    def validate_height(cls, value):
        if value is not None and value >= 1000:
            raise ValueError('La altura no puede exceder los 3 digitos')
        return value
    
    @field_validator('gender')
    @classmethod
    def validate_gender(cls, value):
        if value is not None and value not in ["male", "female", "other", "prefer not to say"]:
            raise ValueError('Valor de género no válido')
        return value