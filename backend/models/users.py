from typing import Optional, List
from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel, Relationship
import re

from models.patient_professional import PatientProfessional


class UserBase(SQLModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str  # "user" o "nutritionist"
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        # Validar que el email no contenga caracteres especiales no permitidos
        pattern = re.compile(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not pattern.match(value):
            raise ValueError('El correo electrónico contiene caracteres no permitidos')
        return value
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value):
        # Validar que el nombre no exceda los 40 caracteres y contenga solo letras
        if len(value) > 40:
            raise ValueError('El nombre no puede exceder los 40 caracteres')
        if not value.isalpha():
            raise ValueError('El nombre debe contener solo letras')
        return value
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, value):
        # Validar que el rol sea "user" o "nutritionist"
        if value not in ["user", "nutritionist"]:
            raise ValueError('El rol debe ser "user" o "nutritionist"')
        return value


# Clase para la tabla de usuarios
class User(UserBase, table=True):
    __tablename__ = "user"  
    
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
 
    profile: Optional["Profile"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False}) # type: ignore
    custom_foods: List["Food"] = Relationship(back_populates="user") # type: ignore
    meals: List["Meal"] = Relationship(back_populates="user") # type: ignore
    
    # Relación Many-to-many con si mismo mediante PatientProfessional
    patients: List["User"] = Relationship(
        sa_relationship_kwargs={
            "secondary": PatientProfessional.__table__,
            "primaryjoin": "User.id == PatientProfessional.professional_id",
            "secondaryjoin": "User.id == PatientProfessional.patient_id",
            "backref": "professionals"
        }
    )


# Clase para crear un nuevo usuario
class UserCreate(UserBase):
    password: str


# Clase para leer datos de usuario
class UserRead(UserBase):
    id: int


# Clase para actualizar datos de usuario
class UserUpdate(SQLModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        # Validar que el email no sea nulo y no contenga caracteres especiales no permitidos
        if value is None:
            return value
        pattern = re.compile(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not pattern.match(value):
            raise ValueError('El correo electrónico contiene caracteres no permitidos')
        return value
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value):
        # Validar que el nombre no sea nulo, no exceda los 40 caracteres y contenga solo letras
        if value is None:
            return value
        if len(value) > 40:
            raise ValueError('El nombre no puede exceder los 40 caracteres')
        if not value.isalpha():
            raise ValueError('El nombre debe contener solo letras')
        return value