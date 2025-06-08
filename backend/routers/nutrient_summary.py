from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Callable
from config.database import get_session
from models.nutrient_summary import NutrientSummaryResponse, MacroSummary, MicroSummary, Alerts
from models.patients import Patient
from models.ingredient_food import IngredientFood
from models.ingredients import Ingredient
from models.foods import Food
from models.meals import Meal
from utils.nutrients import calculate_adjusted_nutrient, classify_nutrient, get_meal_nutrients

router_nutrient_summary = APIRouter(
    prefix="/nutrient_summary",
    tags=["Nutrient Summary"],
    responses={404: {"description": "Not found"}},
)

@router_nutrient_summary.get("/nutrient-summary/{meal_id}", response_model=NutrientSummaryResponse)
def nutrient_summary(meal_id: int, session: Session = Depends(get_session)):
    meal = session.exec(select(Meal).where(Meal.id == meal_id)).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found.")

    nutrients = get_meal_nutrients(session, meal)

    return NutrientSummaryResponse(
        total_macros=MacroSummary(
            protein_g=nutrients["protein_g"],
            carbs_g=nutrients["carbs_g"],
            fat_g=nutrients["fat_g"]
        ),
        total_micros=MicroSummary(
            iron_mg=nutrients["iron_mg"],
            vitamin_c_mg=nutrients["vitamin_c_mg"],
            calcium_mg=nutrients["calcium_mg"]
        ),
        alerts=Alerts(
            protein=classify_nutrient(nutrients["protein_g"], 10, 30),
            carbs=classify_nutrient(nutrients["carbs_g"], 20, 60),
            fat=classify_nutrient(nutrients["fat_g"], 10, 30),
            iron=classify_nutrient(nutrients["iron_mg"], 1, 10),
            vitamin_c=classify_nutrient(nutrients["vitamin_c_mg"], 15, 90),
            calcium=classify_nutrient(nutrients["calcium_mg"], 200, 1000)
        )
    )
