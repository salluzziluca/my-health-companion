from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from enum import Enum
from models.shopping_list_items import ShoppingListItemRead  

if TYPE_CHECKING:
    from models.patients import Patient
    from models.shopping_list_items import ShoppingListItem

class ShoppingListStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class ShoppingList(SQLModel, table=True):
    __tablename__ = "shopping_lists"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=500)
    status: ShoppingListStatus = Field(default=ShoppingListStatus.ACTIVE)
    patient_id: int = Field(foreign_key="patients.id")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    items: List["ShoppingListItem"] = Relationship(back_populates="shopping_list", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    patient: Optional["Patient"] = Relationship(back_populates="shopping_lists")

class ShoppingListBase(SQLModel):
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=500)

class ShoppingListCreate(ShoppingListBase):
    pass

class ShoppingListUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=500)
    status: Optional[ShoppingListStatus] = Field(default=None)

class ShoppingListRead(ShoppingListBase):
    id: int
    status: ShoppingListStatus
    patient_id: int
    created_at: datetime
    updated_at: datetime


class ShoppingListReadWithItems(ShoppingListRead):
    items: List[ShoppingListItemRead] = Field(default_factory=list)