from fastapi import APIRouter, Depends, HTTPException, Query
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
from datetime import date, datetime, time

router_nutrient_summary = APIRouter(
    prefix="/nutrient-summary",
    tags=["Nutrient Summary"],
    responses={404: {"description": "Not found"}},
)

@router_nutrient_summary.get("/daily", response_model=NutrientSummaryResponse)
def daily_nutrient_summary(
    date: date = Query(..., description="Date in YYYY-MM-DD format"),
    session: Session = Depends(get_session)
):
    
    start = datetime.combine(date, time.min)
    end = datetime.combine(date, time.max)

    meals = session.exec(
        select(Meal).where(Meal.timestamp >= start, Meal.timestamp <= end)
    ).all()

    if not meals:
        raise HTTPException(status_code=404, detail="No meals found for the specified date.")

    total_nutrients = {
        "protein_g": 0.0,
        "carbs_g": 0.0,
        "fat_g": 0.0,
        "calcium_mg": 0.0,
        "iron_mg": 0.0,
        "vitamin_c_mg": 0.0
    }

    for meal in meals:
        meal_nutrients = get_meal_nutrients(session, meal)
        for key in total_nutrients:
            total_nutrients[key] += meal_nutrients[key]

    return NutrientSummaryResponse(
        total_macros=MacroSummary(
            protein_g=total_nutrients["protein_g"],
            carbs_g=total_nutrients["carbs_g"],
            fat_g=total_nutrients["fat_g"]
        ),
        total_micros=MicroSummary(
            iron_mg=total_nutrients["iron_mg"],
            vitamin_c_mg=total_nutrients["vitamin_c_mg"],
            calcium_mg=total_nutrients["calcium_mg"]
        ),
        alerts=Alerts(
            protein=classify_nutrient(total_nutrients["protein_g"], 10, 30),
            carbs=classify_nutrient(total_nutrients["carbs_g"], 20, 60),
            fat=classify_nutrient(total_nutrients["fat_g"], 10, 30),
            iron=classify_nutrient(total_nutrients["iron_mg"], 1, 10),
            vitamin_c=classify_nutrient(total_nutrients["vitamin_c_mg"], 15, 90),
            calcium=classify_nutrient(total_nutrients["calcium_mg"], 200, 1000)
        )
    )

@router_nutrient_summary.get("/{meal_id}", response_model=NutrientSummaryResponse)
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