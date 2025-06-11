import sqlite3
import psycopg2
from psycopg2.extras import execute_values

# Configuración de la base de datos SQLite (origen)
sqlite_conn = sqlite3.connect("health_app.sqlite")
sqlite_cursor = sqlite_conn.cursor()

# Configuración de la base de datos PostgreSQL (destino)
pg_conn = psycopg2.connect(
    dbname="health_app",
    user="postgres",
    password="1527",
    host="localhost",
    port="5432"
)
pg_cursor = pg_conn.cursor()

# === FUNCIONES DE MIGRACIÓN ===

def migrate_table(sqlite_query, postgres_insert, table_name):
    try:
        sqlite_cursor.execute(sqlite_query)
        rows = sqlite_cursor.fetchall()
        columns = [desc[0] for desc in sqlite_cursor.description]

        data_to_insert = []
        for row in rows:
            row_dict = dict(zip(columns, row))

            # ✅ Convertir 'completed' a booleano si es de la tabla weeklydietmeals
            if table_name == "weeklydietmeals" and "completed" in row_dict:
                row_dict["completed"] = bool(row_dict["completed"])

            data_to_insert.append(tuple(row_dict[col] for col in columns))

        execute_values(pg_cursor, postgres_insert, data_to_insert)
        pg_conn.commit()
        print(f"{len(data_to_insert)} registros insertados en '{table_name}'")

    except Exception as e:
        print(f"Error insertando datos en {table_name}: {e}")

# professionals
migrate_table(
    "SELECT email, first_name, last_name, specialization, uuid_code, password_hash FROM professionals",
    "INSERT INTO professionals (email, first_name, last_name, specialization, uuid_code, password_hash) VALUES %s",
    "professionals"
)

# patients
migrate_table(
    "SELECT email, first_name, last_name, weight, height, birth_date, gender, password_hash, professional_id FROM patients",
    "INSERT INTO patients (email, first_name, last_name, weight, height, birth_date, gender, password_hash, professional_id) VALUES %s",
    "patients"
)

# weight_logs
migrate_table(
    "SELECT weight, timestamp, patient_id FROM weight_logs",
    "INSERT INTO weight_logs (weight, timestamp, patient_id) VALUES %s",
    "weight_logs"
)

# weeklydiets
migrate_table(
    "SELECT week_start_date, created_at, updated_at, patient_id, professional_id FROM weeklydiets",
    "INSERT INTO weeklydiets (week_start_date, created_at, updated_at, patient_id, professional_id) VALUES %s",
    "weeklydiets"
)

# weeklydietmeals
migrate_table(
    "SELECT meal_name, day_of_week, meal_of_the_day, completed, food_id, weekly_diet_id FROM weeklydietmeals",
    "INSERT INTO weeklydietmeals (meal_name, day_of_week, meal_of_the_day, completed, food_id, weekly_diet_id) VALUES %s",
    "weeklydietmeals"
)

# meals
migrate_table(
    "SELECT meal_name, grams, meal_of_the_day, timestamp, food_id, patient_id, calories FROM meals",
    "INSERT INTO meals (meal_name, grams, meal_of_the_day, timestamp, food_id, patient_id, calories) VALUES %s",
    "meals"
)
# === CERRAR CONEXIONES ===
sqlite_conn.close()
pg_cursor.close()
pg_conn.close()