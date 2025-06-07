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

sqlite_file_name = "../health_app.sqlite"
base_dir = os.path.dirname(os.path.realpath(__file__))

DATABASE_URL = f"sqlite:///{os.path.join(base_dir, sqlite_file_name)}"

connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)