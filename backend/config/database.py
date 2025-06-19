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

sqlite_file_name = "../health_app.sqlite"
base_dir = os.path.dirname(os.path.realpath(__file__))

DATABASE_URL = f"sqlite:///{os.path.join(base_dir, sqlite_file_name)}"

connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


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
    SQLModel.metadata.create_all(engine)