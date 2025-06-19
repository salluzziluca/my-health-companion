import os
from sqlmodel import Session, SQLModel, create_engine

from models.patients import Patient
from models.professionals import Professional
from models.foods import Food
from models.ingredients import Ingredient
from models.ingredient_food import IngredientFood
from models.meals import Meal
from models.weekly_notes import WeeklyNote
from models.weight_logs import WeightLog
from models.notification import Notification
from models.water_intake import WaterIntake
from models.shopping_lists import ShoppingList
from models.shopping_list_items import ShoppingListItem

# Configuración de la base de datos según el entorno
ENV = os.getenv("ENV", "development")

if ENV == "production":
    # En producción, Render proporciona DATABASE_URL
    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        # Render usa postgres:// pero SQLAlchemy necesita postgresql://
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # En desarrollo, usar configuración local
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1527@localhost:5432/health_app")

#connect_args = {"check_same_thread": False}
#engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
engine = create_engine(DATABASE_URL, echo=False)

# Función para usar como dependencia en FastAPI
def get_session():
    """Función generadora para usar como dependencia en FastAPI"""
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()


# Función simple para crear sesiones fuera de FastAPI
def create_session():
    """Crear una nueva sesión para usar fuera de FastAPI"""
    return Session(engine)


def create_db_and_tables():
    """Crear todas las tablas en la base de datos"""
    SQLModel.metadata.create_all(engine)