import psycopg2
import os

def insert_default_data():
    # Conexión usando la misma configuración que la aplicación principal
    # Nota: En desarrollo local usa puerto 5433, en producción usa DATABASE_URL
    
    # Verificar si estamos en producción (usando DATABASE_URL)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Producción: usar DATABASE_URL (como en Render)
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        conn = psycopg2.connect(database_url)
        print("🌐 Conectando usando DATABASE_URL (producción)")
    else:
        # Desarrollo: usar configuración por partes
        conn = psycopg2.connect(
            dbname=os.getenv("POSTGRES_DB", "health_app"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", "1527"),
            host=os.getenv("POSTGRES_HOST", "localhost"),
            port=os.getenv("POSTGRES_PORT", "5433")  # Puerto para desarrollo local
        )
        print("🏠 Conectando usando configuración local (desarrollo)")
    cursor = conn.cursor()

    # SQL en múltiples sentencias separadas por punto y coma
    sql_script = '''
    -- Insertar ingredientes 
    INSERT INTO ingredients (name, category, grams, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
    ('Pechuga de pollo', 'animal', 100, 165, 31, 3.6, 0, 1.0, 15, 0),
    ('Muslo de pollo', 'animal', 100, 177, 24, 8.0, 0, 1.3, 11, 0),
    ('Carne de vaca', 'animal', 100, 250, 26, 17, 0, 2.6, 11, 0),
    ('Carne molida magra', 'animal', 100, 215, 26, 12, 0, 2.5, 18, 0),
    ('Lomo de cerdo', 'animal', 100, 143, 21, 5, 0, 0.9, 10, 0),
    ('Costilla de cerdo', 'animal', 100, 291, 20, 24, 0, 1.1, 18, 0),
    ('Salmón', 'animal', 100, 208, 20, 13, 0, 0.5, 9, 0),
    ('Atún', 'animal', 100, 132, 28, 1.0, 0, 1.0, 10, 0),
    ('Huevo', 'animal', 100, 155, 13, 5, 0.6, 1.2, 25, 0);

    -- Ingredientes - verduras
    INSERT INTO ingredients (name, category, grams, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
    ('Zanahoria', 'verdura', 100, 41, 0.9, 0.2, 10, 0.3, 33, 5.9),
    ('Brócoli', 'verdura', 100, 34, 2.8, 0.4, 7, 0.7, 47, 89),
    ('Espinaca', 'verdura', 100, 23, 2.9, 0.4, 3.6, 2.7, 99, 28),
    ('Papa', 'verdura', 100, 77, 2.0, 0.1, 17, 0.8, 12, 19.7),
    ('Batata', 'verdura', 100, 86, 1.6, 0.1, 20, 0.6, 30, 2.4),
    ('Tomate', 'verdura', 100, 18, 0.9, 0.2, 3.9, 0.3, 10, 13.7),
    ('Cebolla', 'verdura', 100, 40, 1.1, 0.1, 9.3, 0.2, 23, 8.1),
    ('Morrón rojo', 'verdura', 100, 31, 1.0, 0.3, 6.0, 0.4, 7, 127),
    ('Ajo', 'verdura', 100, 149, 6.4, 0.5, 33, 1.7, 181, 31.2);

    -- Ingredientes - frutas
    INSERT INTO ingredients (name, category, grams, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
    ('Manzana', 'fruta', 100, 52, 0.3, 0.2, 14, 0.1, 6, 4.6),
    ('Banana', 'fruta', 100, 89, 1.1, 0.3, 23, 0.3, 5, 8.7),
    ('Naranja', 'fruta', 100, 47, 0.9, 0.1, 12, 0.1, 40, 53),
    ('Uva', 'fruta', 100, 69, 0.7, 0.2, 18, 0.4, 10, 10.8),
    ('Pera', 'fruta', 100, 57, 0.4, 0.1, 15, 0.2, 9, 4.3),
    ('Frutilla', 'fruta', 100, 32, 0.7, 0.3, 7.7, 0.4, 16, 58.8),
    ('Kiwi', 'fruta', 100, 61, 1.1, 0.5, 15, 0.3, 34, 92.7),
    ('Sandía', 'fruta', 100, 30, 0.6, 0.2, 8, 0.2, 7, 8.1);

    -- Proteínas vegetales
    INSERT INTO ingredients (name, category, grams, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
    ('Tofu', 'proteína vegetal', 100, 76, 8.0, 4.8, 1.9, 1.6, 350, 0.1),
    ('Lentejas cocidas', 'proteína vegetal', 100, 116, 9.0, 0.4, 20, 3.3, 19, 1.5),
    ('Garbanzos cocidos', 'proteína vegetal', 100, 164, 8.9, 2.6, 27.4, 2.9, 49, 1.3),
    ('Porotos negros cocidos', 'proteína vegetal', 100, 132, 8.9, 0.5, 23.7, 2.1, 27, 0.0),
    ('Soja cocida', 'proteína vegetal', 100, 173, 16.6, 9.0, 9.9, 2.5, 102, 6.0),
    ('Seitán', 'proteína vegetal', 100, 121, 21, 2.0, 4.0, 1.2, 14, 0);

    -- Alimentos
    INSERT INTO foods (food_name) VALUES
    ('Ensalada César'),
    ('Milanesa de pollo'),
    ('Tortilla de papa'),
    ('Arroz con pollo'),
    ('Hamburguesa'),
    ('Pizza margarita'),
    ('Guiso de lentejas'),
    ('Sopa de verduras'),
    ('Omelette de huevo'),
    ('Pollo al horno'),
    ('Ensalada de frutas');

    -- Relación ingredientes-alimentos
    INSERT INTO ingredients_foods (ingredient_id, food_id, grams) VALUES
    (2, 1, 100),
    (10, 1, 50),
    (12, 1, 50),
    (1, 2, 150),
    (17, 2, 60),
    (15, 2, 100),
    (15, 3, 250),
    (17, 3, 100),
    (1, 4, 100),
    (15, 4, 100),
    (18, 4, 150),
    (3, 5, 120),
    (7, 5, 80),
    (14, 6, 100),
    (17, 6, 50),
    (20, 7, 150),
    (10, 7, 80),
    (11, 8, 100),
    (12, 8, 80),
    (13, 8, 100),
    (9, 9, 150),   
    (1, 10, 200),  
    (23, 11, 100), 
    (24, 11, 100), 
    (25, 11, 100); 
    '''

    try:
        # Ejecutar múltiples sentencias separadas por punto y coma
        for statement in sql_script.strip().split(';'):
            if statement.strip():
                cursor.execute(statement)

        # Guardar cambios y cerrar
        conn.commit()
        print("Datos insertados correctamente.")
    except Exception as e:
        print(f"Error al insertar datos: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    insert_default_data()