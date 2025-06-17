from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from models.shopping_lists import ShoppingList
    from models.ingredients import Ingredient
    from models.foods import Food

class ItemSource(str, Enum):
    MANUAL = "manual"
    FROM_DIET = "from_diet"
    FROM_INGREDIENT = "from_ingredient"

class ShoppingListItem(SQLModel, table=True):
    __tablename__ = "shopping_list_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    quantity: float = Field(gt=0)
    unit: str = Field(max_length=50, default="unidades")  # ej: kg, litros, unidades, etc.
    is_purchased: bool = Field(default=False)
    notes: Optional[str] = Field(default=None, max_length=500)
    source: ItemSource = Field(default=ItemSource.MANUAL)
    
    # Referencias opcionales para items creados desde dietas
    ingredient_id: Optional[int] = Field(default=None, foreign_key="ingredients.id")
    food_id: Optional[int] = Field(default=None, foreign_key="foods.id")
    
    # Relación con lista de compras
    shopping_list_id: int = Field(foreign_key="shopping_lists.id")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.now)
    purchased_at: Optional[datetime] = Field(default=None)
    
    shopping_list: Optional["ShoppingList"] = Relationship(back_populates="items")
    ingredient: Optional["Ingredient"] = Relationship()
    food: Optional["Food"] = Relationship()

class ShoppingListItemBase(SQLModel):
    name: str = Field(max_length=255)
    quantity: float = Field(gt=0)
    unit: str = Field(max_length=50, default="unidades")
    notes: Optional[str] = Field(default=None, max_length=500)

class ShoppingListItemCreate(ShoppingListItemBase):
    source: ItemSource = Field(default=ItemSource.MANUAL)
    ingredient_id: Optional[int] = Field(default=None)
    food_id: Optional[int] = Field(default=None)

class ShoppingListItemUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    quantity: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = Field(default=None, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=500)
    is_purchased: Optional[bool] = Field(default=None)

class ShoppingListItemRead(ShoppingListItemBase):
    id: int
    is_purchased: bool
    source: ItemSource
    ingredient_id: Optional[int]
    food_id: Optional[int]
    shopping_list_id: int
    created_at: datetime
    purchased_at: Optional[datetime]

# Modelo para agregar items desde dietas
class AddItemsFromDietRequest(SQLModel):
    weekly_diet_id: int
    days_to_include: Optional[List[str]] = Field(default=None)  # ["MONDAY", "TUESDAY", etc.]

# Modelo para marcar items como comprados en lote
class BulkUpdateItemsRequest(SQLModel):
    item_ids: List[int]
    is_purchased: bool