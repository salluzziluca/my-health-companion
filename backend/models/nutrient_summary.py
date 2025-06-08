from pydantic import BaseModel
from typing import Literal

class MacroSummary(BaseModel):
    protein_g: float
    carbs_g: float
    fat_g: float

class MicroSummary(BaseModel):
    iron_mg: float
    vitamin_c_mg: float
    calcium_mg: float

class Alerts(BaseModel):
    protein: Literal["deficit", "within range", "excess"]
    carbs: Literal["deficit", "within range", "excess"]
    fat: Literal["deficit", "within range", "excess"]
    iron: Literal["deficit", "within range", "excess"]
    vitamin_c: Literal["deficit", "within range", "excess"]
    calcium: Literal["deficit", "within range", "excess"]

class NutrientSummaryResponse(BaseModel):
    total_macros: MacroSummary
    total_micros: MicroSummary
    alerts: Alerts
