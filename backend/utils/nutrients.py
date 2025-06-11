from typing import List, Callable
from sqlmodel import Session, select
from fastapi import HTTPException, Depends
from models.ingredient_food import IngredientFood
from models.ingredients import Ingredient
from models.meals import Meal

def classify_nutrient(value: float, min_value: float, max_value: float) -> str:
    if value < min_value:
        return "deficit"
    elif min_value <= value <= max_value:
        return "within range"
    else:
        return "excess"
    
def calculate_adjusted_nutrient(
    ingredient_food_links: List[IngredientFood],
    session: Session,
    meal_grams: float,
    nutrient_getter: Callable[[Ingredient], float]
) -> float:
    total_grams = 0.0
    total_nutrient = 0.0

    for link in ingredient_food_links:
        ingredient = session.exec(
            select(Ingredient).where(Ingredient.id == link.ingredient_id)
        ).first()

        if not ingredient:
            continue

        total_grams += link.grams
        total_nutrient += (nutrient_getter(ingredient) / 100) * link.grams

    if total_grams == 0:
        return 0.0
    
    nutrient_per_gram = total_nutrient / total_grams

    return nutrient_per_gram * meal_grams

def get_meal_nutrients(session: Session, meal: Meal) -> dict:
    ingredient_links = session.exec(
        select(IngredientFood).where(IngredientFood.food_id == meal.food_id)
    ).all()

    if not ingredient_links:
        raise HTTPException(status_code=404, detail="Meal has no ingredients.")

    nutrients = {
        "protein_g": calculate_adjusted_nutrient(ingredient_links, session, meal.grams, lambda i: i.protein_g),
        "carbs_g": calculate_adjusted_nutrient(ingredient_links, session, meal.grams, lambda i: i.carbs_g),
        "fat_g": calculate_adjusted_nutrient(ingredient_links, session, meal.grams, lambda i: i.fat_g),
        "calcium_mg": calculate_adjusted_nutrient(ingredient_links, session, meal.grams, lambda i: i.calcium_mg),
        "iron_mg": calculate_adjusted_nutrient(ingredient_links, session, meal.grams, lambda i: i.iron_mg),
        "vitamin_c_mg": calculate_adjusted_nutrient(ingredient_links, session, meal.grams, lambda i: i.vitamin_c_mg),
    }

    return nutrients