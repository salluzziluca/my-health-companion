from typing import Optional
from sqlmodel import Field, SQLModel, Relationship

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from models.users import User

class PatientProfessional(SQLModel, table=True):
    __tablename__ = "patient_professional"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="user.id")
    professional_id: int = Field(foreign_key="user.id")

    patient: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "PatientProfessional.patient_id == User.id",
            "foreign_keys": "PatientProfessional.patient_id"  
        }
    )
    
    professional: "User" = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "PatientProfessional.professional_id == User.id",
            "foreign_keys": "PatientProfessional.professional_id"  
        }
    )