from typing import Optional, ClassVar
from datetime import date
from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel, Relationship


class UserBase(SQLModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: str  # "user" o "nutritionist"
    
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
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
  
    profile: Optional["Profile"] = Relationship(back_populates="user")


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