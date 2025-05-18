from fastapi import FastAPI
import uvicorn
from config.database import create_db_and_tables

# Importar todos los modelos para asegurar que estén registrados en la metadata de SQLModel
from models.patients import Patient
from models.professionals import Professional
from models.foods import Food
from models.ingredients import Ingredient
from models.ingredient_food import IngredientFood
from models.meals import Meal

# Importación de routers
from routers.auth import router_auth
from routers.patients import router_patients
from routers.professionals import router_professionals
from routers.meals import router_meals
from routers.foods import router_foods
from routers.ingredients import router_ingredients

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="API de Nutrición y Salud")

# Crear tablas en la base de datos
create_db_and_tables()

# Incluir routers
app.include_router(router_auth)
app.include_router(router_patients)
app.include_router(router_professionals)
app.include_router(router_meals)
app.include_router(router_foods)
app.include_router(router_ingredients)


@app.get("/")
async def root():
    return {"message": "API de Nutrición y Salud está en línea"}


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)