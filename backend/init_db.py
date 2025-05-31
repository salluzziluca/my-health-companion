from config.database import create_db_and_tables
from insert_defaults import insert_default_data

def init_db():
    print("Creando tablas...")
    create_db_and_tables()
    print("Insertando datos por defecto...")
    insert_default_data()
    print("¡Base de datos inicializada!")

if __name__ == "__main__":
    init_db() 