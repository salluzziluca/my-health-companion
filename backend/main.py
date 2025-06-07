from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from config.database import create_db_and_tables
from apscheduler.schedulers.background import BackgroundScheduler

# Importación de routers
from routers.auth import router_auth
from routers.patients import router_patients
from routers.professionals import router_professionals
from routers.meals import router_meals
from routers.foods import router_foods
from routers.ingredients import router_ingredients
from routers.weight_logs import router_weight_logs
from routers.weekly_summaries import router_weekly_summaries
from routers.weekly_notes import router_weekly_notes
from routers.weekly_diets import router_weekly_diets
from routers.goals import router_goals
from routers.notification import router_notifications
from routers.water_router import router_water
from routers.water_reminders import router_water_reminders, send_scheduled_water_reminders

from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app:FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(send_scheduled_water_reminders,"interval",minutes = 1)
    scheduler.start()
    yield

app = FastAPI(title="API de Nutrición y Salud",lifespan=lifespan)

# Crear tablas en la base de datos
create_db_and_tables()

# Incluir routers
app.include_router(router_auth)
app.include_router(router_patients)
app.include_router(router_professionals)
app.include_router(router_meals)
app.include_router(router_foods)
app.include_router(router_ingredients)
app.include_router(router_weight_logs)
app.include_router(router_weekly_summaries)
app.include_router(router_weekly_notes)
app.include_router(router_weekly_diets)
app.include_router(router_goals)
app.include_router(router_notifications)
app.include_router(router_water)
app.include_router(router_water_reminders)

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