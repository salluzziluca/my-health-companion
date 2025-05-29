from typing import Optional, List
from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel, Relationship
import re
import uuid

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.patients import Patient

class ProfessionalBase(SQLModel):
    email: EmailStr
    first_name: str
    last_name: str
    specialization: str # "nutritionist" o "personal trainer"
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        pattern = re.compile(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not pattern.match(value):
            raise ValueError('El correo electrónico contiene caracteres no permitidos')
        return value
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value):
        if len(value) > 40:
            raise ValueError('El nombre no puede exceder los 40 caracteres')
        if not value.isalpha():
            raise ValueError('El nombre debe contener solo letras')
        return value
    
    @field_validator('specialization')
    @classmethod
    def validate_specialization(cls, value):
        if value is not None and value not in ["nutritionist", "personal trainer"]:
            raise ValueError('La especialización debe ser "nutritionist" o "personal trainer"')
        return value


class Professional(ProfessionalBase, table=True):
    __tablename__ = "professionals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid_code: str = Field(default_factory=lambda: str(uuid.uuid4()), unique=True, index=True)
    password_hash: str
    
    # Relación one-to-many: un profesional puede tener muchos pacientes
    patients: List["Patient"] = Relationship(back_populates="professional")


class ProfessionalCreate(ProfessionalBase):
    password: str


class ProfessionalRead(ProfessionalBase):
    id: int


class ProfessionalUpdate(SQLModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    specialization: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, value):
        if value is None:
            return value
        pattern = re.compile(r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not pattern.match(value):
            raise ValueError('El correo electrónico contiene caracteres no permitidos')
        return value
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_name(cls, value):
        if value is None:
            return value
        if len(value) > 40:
            raise ValueError('El nombre no puede exceder los 40 caracteres')
        if not value.isalpha():
            raise ValueError('El nombre debe contener solo letras')
        return value
    
    @field_validator('specialization')
    @classmethod
    def validate_specialization(cls, value):
        if value is None:
            return value
        if value not in ["nutritionist", "personal trainer"]:
            raise ValueError('La especialización debe ser "nutritionist" o "personal trainer"')
        return value