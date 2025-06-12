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

#sqlite_file_name = "../health_app.sqlite"
#base_dir = os.path.dirname(os.path.realpath(__file__))

#DATABASE_URL = f"sqlite:///{os.path.join(base_dir, sqlite_file_name)}"

# Acá deben poner su usuario (postgres el mio) y su clave (1527 la mía), 5432 es el puerto
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1527@localhost:5432/health_app")

#connect_args = {"check_same_thread": False}
#engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)