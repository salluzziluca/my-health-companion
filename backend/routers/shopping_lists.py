from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from config.database import get_session
from models.patients import Patient
from models.shopping_lists import (
    ShoppingList, ShoppingListCreate, ShoppingListUpdate, 
    ShoppingListRead, ShoppingListReadWithItems, ShoppingListStatus
)
from models.shopping_list_items import (
    ShoppingListItem, ShoppingListItemCreate, ShoppingListItemUpdate,
    ShoppingListItemRead, AddItemsFromDietRequest, BulkUpdateItemsRequest,
    ItemSource
)
from models.weekly_diets import WeeklyDiets
from models.weekly_diet_meals import WeeklyDietMeals
from models.foods import Food
from models.ingredients import Ingredient
from models.ingredient_food import IngredientFood
from utils.security import get_current_patient

router_shopping_lists = APIRouter(
    prefix="/shopping-lists",
    tags=["Shopping Lists"],
    responses={404: {"description": "Not found"}},
)

# ===== ENDPOINTS PARA LISTAS DE COMPRAS =====

@router_shopping_lists.get("/", response_model=List[ShoppingListRead])
def get_my_shopping_lists(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    status: Optional[ShoppingListStatus] = Query(None, description="Filtrar por estado"),
):
    """Obtener todas las listas de compras del usuario actual"""
    query = select(ShoppingList).where(ShoppingList.patient_id == current_patient.id)
    
    if status:
        query = query.where(ShoppingList.status == status)
    
    query = query.order_by(ShoppingList.created_at.desc())
    shopping_lists = session.exec(query).all()
    
    return shopping_lists

@router_shopping_lists.get("/{list_id}", response_model=ShoppingListReadWithItems)
def get_shopping_list_with_items(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
):
    """Obtener una lista de compras específica con todos sus items"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this shopping list")
    
    # Obtener items de la lista
    items = session.exec(
        select(ShoppingListItem)
        .where(ShoppingListItem.shopping_list_id == list_id)
        .order_by(ShoppingListItem.created_at.desc())
    ).all()
    
    return ShoppingListReadWithItems(**shopping_list.model_dump(), items=items)

@router_shopping_lists.post("/", response_model=ShoppingListRead)
def create_shopping_list(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_data: ShoppingListCreate,
):
    """Crear una nueva lista de compras"""
    shopping_list = ShoppingList(
        **list_data.model_dump(),
        patient_id=current_patient.id,
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    session.add(shopping_list)
    session.commit()
    session.refresh(shopping_list)
    
    return shopping_list

@router_shopping_lists.patch("/{list_id}", response_model=ShoppingListRead)
def update_shopping_list(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
    list_update: ShoppingListUpdate,
):
    """Actualizar una lista de compras"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this shopping list")
    
    # Actualizar campos
    update_data = list_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(shopping_list, key, value)
    
    shopping_list.updated_at = datetime.now()
    
    session.add(shopping_list)
    session.commit()
    session.refresh(shopping_list)
    
    return shopping_list

@router_shopping_lists.delete("/{list_id}", status_code=204)
def delete_shopping_list(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
):
    """Eliminar una lista de compras y todos sus items"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this shopping list")
    
    # Los items se eliminan automáticamente por cascade_delete=True
    session.delete(shopping_list)
    session.commit()
    
    return

# ===== ENDPOINTS PARA OPERACIONES EN LOTE =====

@router_shopping_lists.patch("/{list_id}/items/bulk-update", response_model=List[ShoppingListItemRead])
def bulk_update_items(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
    bulk_update: BulkUpdateItemsRequest,
):
    """Marcar múltiples items como comprados/no comprados"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this shopping list")
    
    # Obtener items que pertenecen a esta lista
    items = session.exec(
        select(ShoppingListItem)
        .where(
            ShoppingListItem.shopping_list_id == list_id,
            ShoppingListItem.id.in_(bulk_update.item_ids)
        )
    ).all()
    
    if len(items) != len(bulk_update.item_ids):
        raise HTTPException(status_code=400, detail="Some items were not found in this shopping list")
    
    # Actualizar items
    updated_items = []
    for item in items:
        item.is_purchased = bulk_update.is_purchased
        if bulk_update.is_purchased:
            item.purchased_at = datetime.now()
        else:
            item.purchased_at = None
        
        session.add(item)
        updated_items.append(item)
    
    session.commit()
    
    for item in updated_items:
        session.refresh(item)
    
    return updated_items

# ===== ENDPOINTS PARA ITEMS DE LISTAS =====

@router_shopping_lists.post("/{list_id}/items", response_model=ShoppingListItemRead)
def add_item_to_list(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
    item_data: ShoppingListItemCreate,
):
    """Agregar un item manualmente a una lista de compras"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this shopping list")
    
    # Validar referencias opcionales
    if item_data.ingredient_id:
        ingredient = session.get(Ingredient, item_data.ingredient_id)
        if not ingredient:
            raise HTTPException(status_code=404, detail="Ingredient not found")
    
    if item_data.food_id:
        food = session.get(Food, item_data.food_id)
        if not food:
            raise HTTPException(status_code=404, detail="Food not found")
    
    item = ShoppingListItem(
        **item_data.model_dump(),
        shopping_list_id=list_id,
        created_at=datetime.now()
    )
    
    session.add(item)
    session.commit()
    session.refresh(item)
    
    return item

@router_shopping_lists.patch("/{list_id}/items/{item_id}", response_model=ShoppingListItemRead)
def update_shopping_list_item(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
    item_id: int,
    item_update: ShoppingListItemUpdate,
):
    """Actualizar un item de la lista de compras"""
    item = session.get(ShoppingListItem, item_id)
    
    if not item or item.shopping_list_id != list_id:
        raise HTTPException(status_code=404, detail="Item not found in the specified shopping list")
    
    # Verificar que el usuario es dueño de la lista
    shopping_list = session.get(ShoppingList, list_id)
    if not shopping_list or shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this shopping list")
    
    # Actualizar campos
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    # Si se marca como comprado, actualizar timestamp
    if "is_purchased" in update_data and update_data["is_purchased"]:
        item.purchased_at = datetime.now()
    elif "is_purchased" in update_data and not update_data["is_purchased"]:
        item.purchased_at = None
    
    session.add(item)
    session.commit()
    session.refresh(item)
    
    return item

@router_shopping_lists.delete("/{list_id}/items/{item_id}", status_code=204)
def delete_shopping_list_item(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
    item_id: int,
):
    """Eliminar un item específico de la lista de compras"""
    item = session.get(ShoppingListItem, item_id)
    
    if not item or item.shopping_list_id != list_id:
        raise HTTPException(status_code=404, detail="Item not found in the specified shopping list")
    
    # Verificar que el usuario es dueño de la lista
    shopping_list = session.get(ShoppingList, list_id)
    if not shopping_list or shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this shopping list")
    
    session.delete(item)
    session.commit()
    
    return



# ===== ENDPOINTS PARA GENERAR ITEMS DESDE DIETAS =====

@router_shopping_lists.post("/{list_id}/items/from-diet", response_model=List[ShoppingListItemRead])
def add_items_from_weekly_diet(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
    diet_request: AddItemsFromDietRequest,
):
    """Generar items en la lista de compras basados en una dieta semanal"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this shopping list")
    
    # Verificar que la dieta semanal existe y pertenece al usuario
    weekly_diet = session.get(WeeklyDiets, diet_request.weekly_diet_id)
    if not weekly_diet or weekly_diet.patient_id != current_patient.id:
        raise HTTPException(status_code=404, detail="Weekly diet not found or not accessible")
    
    # Obtener comidas de la dieta semanal
    query = select(WeeklyDietMeals).where(WeeklyDietMeals.weekly_diet_id == diet_request.weekly_diet_id)
    
    # Filtrar por días específicos si se proporcionaron
    if diet_request.days_to_include:
        query = query.where(WeeklyDietMeals.day_of_week.in_(diet_request.days_to_include))
    
    meals = session.exec(query).all()
    
    if not meals:
        raise HTTPException(status_code=404, detail="No meals found for the specified criteria")
    
    # Generar items basados en los ingredientes de las comidas
    created_items = []
    ingredient_quantities = {}  # Para agrupar ingredientes similares
    
    for meal in meals:
        food = session.get(Food, meal.food_id)
        if not food:
            continue
        
        # Obtener ingredientes de la comida
        ingredient_foods = session.exec(
            select(IngredientFood).where(IngredientFood.food_id == meal.food_id)
        ).all()
        
        for ing_food in ingredient_foods:
            ingredient = session.get(Ingredient, ing_food.ingredient_id)
            if not ingredient:
                continue
            
            # Agrupar ingredientes por nombre
            ing_key = ingredient.name.lower()
            if ing_key in ingredient_quantities:
                ingredient_quantities[ing_key]['quantity'] += ing_food.grams
            else:
                ingredient_quantities[ing_key] = {
                    'name': ingredient.name,
                    'quantity': ing_food.grams,
                    'unit': 'g',
                    'ingredient_id': ingredient.id,
                    'food_id': meal.food_id
                }
    
    # Crear items en la lista de compras
    for ing_data in ingredient_quantities.values():
        item = ShoppingListItem(
            name=ing_data['name'],
            quantity=ing_data['quantity'],
            unit=ing_data['unit'],
            shopping_list_id=list_id,
            source=ItemSource.FROM_DIET,
            ingredient_id=ing_data['ingredient_id'],
            food_id=ing_data['food_id'],
            notes=f"Generado desde dieta semanal (semana del {weekly_diet.week_start_date})",
            created_at=datetime.now()
        )
        
        session.add(item)
        created_items.append(item)
    
    if not created_items:
        raise HTTPException(status_code=400, detail="No ingredients found to add to shopping list")
    
    session.commit()
    
    for item in created_items:
        session.refresh(item)
    
    return created_items

# ===== ENDPOINTS DE ESTADÍSTICAS =====

@router_shopping_lists.get("/{list_id}/stats")
def get_shopping_list_stats(
    *,
    session: Session = Depends(get_session),
    current_patient: Patient = Depends(get_current_patient),
    list_id: int,
):
    """Obtener estadísticas de una lista de compras"""
    shopping_list = session.get(ShoppingList, list_id)
    
    if not shopping_list:
        raise HTTPException(status_code=404, detail="Shopping list not found")
    
    if shopping_list.patient_id != current_patient.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this shopping list")
    
    # Obtener estadísticas
    items = session.exec(
        select(ShoppingListItem).where(ShoppingListItem.shopping_list_id == list_id)
    ).all()
    
    total_items = len(items)
    purchased_items = len([item for item in items if item.is_purchased])
    pending_items = total_items - purchased_items
    
    items_by_source = {}
    for item in items:
        source = item.source.value
        if source not in items_by_source:
            items_by_source[source] = 0
        items_by_source[source] += 1
    
    return {
        "shopping_list_id": list_id,
        "total_items": total_items,
        "purchased_items": purchased_items,
        "pending_items": pending_items,
        "completion_percentage": round((purchased_items / total_items * 100) if total_items > 0 else 0, 2),
        "items_by_source": items_by_source,
        "last_updated": shopping_list.updated_at
    }