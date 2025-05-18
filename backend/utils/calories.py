from typing import List
from sqlmodel import Session, select
from fastapi import HTTPException

from models.ingredients import Ingredient
from models.ingredient_food import IngredientFood

def calculate_meal_calories(session: Session, food_id: int, meal_grams: float) -> float:
    """Calcula las calorías totales de una comida basada en sus ingredientes."""

    # Obtiene los ingredientes asociados a la comida
    ingredients_food: List[IngredientFood] = session.exec(
        select(IngredientFood).where(IngredientFood.food_id == food_id)
    ).all()

    if not ingredients_food:
        raise HTTPException(
            status_code=404,
            detail="La comida existe pero no tiene ingredientes asociados.",
        )

    total_grams = 0.0
    total_calories = 0.0

    for ingredient_food in ingredients_food:
        ingredient: Ingredient | None = session.exec(
            select(Ingredient).where(Ingredient.id == ingredient_food.ingredient_id)
        ).first()

        if not ingredient:
            raise HTTPException(
                status_code=404,
                detail=f"Ingrediente con ID {ingredient_food.ingredient_id} no encontrado.",
            )

        total_grams += ingredient_food.grams
        print(f"{ingredient.name} ingredient_food grams: {ingredient_food.grams}")
        print(f"{ingredient.name} calories for 100gr: {ingredient.calories_kcal}")
        total_calories += (ingredient.calories_kcal / 100) * ingredient_food.grams
        print(f"{ingredient.name} ingredient_food total_calories: {total_calories}")

    if total_grams == 0:
        raise HTTPException(
            status_code=400,
            detail="El total de gramos de los ingredientes no puede ser cero.",
        )

    calories_per_gram = total_calories / total_grams
    return calories_per_gram * meal_grams