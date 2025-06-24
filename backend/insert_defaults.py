import psycopg2
import os
from config.database import create_db_and_tables

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
    
    # Insert ingredients first
    cursor.execute('''
    INSERT INTO ingredients (name, category, grams, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
    ('Pechuga de pollo', 'animal', 100, 165, 31, 3.6, 0, 1.0, 15, 0),
    ('Muslo de pollo', 'animal', 100, 177, 24, 8.0, 0, 1.3, 11, 0),
    ('Carne de vaca', 'animal', 100, 250, 26, 17, 0, 2.6, 11, 0),
    ('Carne molida magra', 'animal', 100, 215, 26, 12, 0, 2.5, 18, 0),
    ('Lomo de cerdo', 'animal', 100, 143, 21, 5, 0, 0.9, 10, 0),
    ('Costilla de cerdo', 'animal', 100, 291, 20, 24, 0, 1.1, 18, 0),
    ('Salmón', 'animal', 100, 208, 20, 13, 0, 0.5, 9, 0),
    ('Atún', 'animal', 100, 132, 28, 1.0, 0, 1.0, 10, 0),
    ('Huevo', 'animal', 100, 155, 6, 5, 0.6, 1.2, 25, 0),
    ('Zanahoria', 'verdura', 100, 41, 0.9, 0.2, 10, 0.3, 33, 5.9),
    ('Brócoli', 'verdura', 100, 34, 2.8, 0.4, 7, 0.7, 47, 89),
    ('Espinaca', 'verdura', 100, 23, 2.9, 0.4, 3.6, 2.7, 99, 28),
    ('Papa', 'verdura', 100, 77, 2.0, 0.1, 17, 0.8, 12, 19.7),
    ('Batata', 'verdura', 100, 86, 1.6, 0.1, 20, 0.6, 30, 2.4),
    ('Tomate', 'verdura', 100, 18, 0.9, 0.2, 3.9, 0.3, 10, 13.7),
    ('Cebolla', 'verdura', 100, 40, 1.1, 0.1, 9.3, 0.2, 23, 8.1),
    ('Morrón rojo', 'verdura', 100, 31, 1.0, 0.3, 6.0, 0.4, 7, 127),
    ('Ajo', 'verdura', 100, 149, 6.4, 0.5, 33, 1.7, 181, 31.2),
    ('Manzana', 'fruta', 100, 52, 0.3, 0.2, 14, 0.1, 6, 4.6),
    ('Banana', 'fruta', 100, 89, 1.1, 0.3, 23, 0.3, 5, 8.7),
    ('Naranja', 'fruta', 100, 47, 0.9, 0.1, 12, 0.1, 40, 53),
    ('Uva', 'fruta', 100, 69, 0.7, 0.2, 18, 0.4, 10, 10.8),
    ('Pera', 'fruta', 100, 57, 0.4, 0.1, 15, 0.2, 9, 4.3),
    ('Frutilla', 'fruta', 100, 32, 0.7, 0.3, 7.7, 0.4, 16, 58.8),
    ('Kiwi', 'fruta', 100, 61, 1.1, 0.5, 15, 0.3, 34, 92.7),
    ('Sandía', 'fruta', 100, 30, 0.6, 0.2, 8, 0.2, 7, 8.1),
    ('Tofu', 'proteína vegetal', 100, 76, 8.0, 4.8, 1.9, 1.6, 350, 0.1),
    ('Lentejas cocidas', 'proteína vegetal', 100, 116, 9.0, 0.4, 20, 3.3, 19, 1.5),
    ('Garbanzos cocidos', 'proteína vegetal', 100, 164, 8.9, 2.6, 27.4, 2.9, 49, 1.3),
    ('Porotos negros cocidos', 'proteína vegetal', 100, 132, 8.9, 0.5, 23.7, 2.1, 27, 0.0),
    ('Soja cocida', 'proteína vegetal', 100, 173, 16.6, 9.0, 9.9, 2.5, 102, 6.0),
    ('Seitán', 'proteína vegetal', 100, 121, 21, 2.0, 4.0, 1.2, 14, 0),
    ('Avena cocida', 'cereal', 100, 71, 2.5, 1.5, 12, 0.9, 14, 0.0),
    ('Masa de tarta', 'cereal', 100, 310, 6.0, 18, 32, 1.2, 15, 0.0),
    ('Leche descremada', 'lácteo', 100, 36, 3.5, 0.2, 5, 0.1, 120, 0.0),
    ('Aceite de oliva', 'grasa', 100, 884, 0.0, 100.0, 0, 0.0, 1, 0.0),
    ('Arroz blanco cocido', 'cereal', 100, 130, 2.4, 0.3, 28, 1.0, 10, 0.0),
    ('Pan de hamburguesa', 'cereal', 100, 265, 8.0, 3.5, 49, 2.0, 30, 0.0),
    ('Masa de pizza', 'cereal', 100, 270, 7.0, 4.0, 45, 1.5, 20, 0.0),
    ('Queso mozzarella', 'lácteo', 100, 280, 18.0, 17.0, 3, 0.5, 505, 0.0),
    ('Miel', 'azúcar', 100, 304, 0.3, 0.0, 82, 0.4, 6, 0.5),
    ('Yogur natural', 'lácteo', 100, 61, 3.5, 3.3, 4.7, 0.1, 121, 0.5)
    ''')
    
    # Insert foods
    cursor.execute('''
    INSERT INTO foods (food_name) VALUES
    ('Ensalada César'),
    ('Milanesa de pollo'),
    ('Tortilla de papa'),
    ('Arroz con pollo'),
    ('Hamburguesa'),
    ('Pizza margarita'),
    ('Guiso de lentejas'),
    ('Sopa de verduras'),
    ('Tarta de espinaca'),
    ('Ensalada vegana de tofu'),
    ('Desayuno de avena con banana'),
    ('Yogur con frutas')
    ''')
    
    # Insert ingredients-foods relationships using subqueries to find both ingredient and food IDs by name
    cursor.execute('''
    INSERT INTO ingredients_foods (ingredient_id, food_id, grams) VALUES
    -- Ensalada César
    ((SELECT id FROM ingredients WHERE name = 'Muslo de pollo'), (SELECT id FROM foods WHERE food_name = 'Ensalada César'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Espinaca'), (SELECT id FROM foods WHERE food_name = 'Ensalada César'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Zanahoria'), (SELECT id FROM foods WHERE food_name = 'Ensalada César'), 30),
    
    -- Milanesa de pollo
    ((SELECT id FROM ingredients WHERE name = 'Pechuga de pollo'), (SELECT id FROM foods WHERE food_name = 'Milanesa de pollo'), 150),
    ((SELECT id FROM ingredients WHERE name = 'Huevo'), (SELECT id FROM foods WHERE food_name = 'Milanesa de pollo'), 60),
    ((SELECT id FROM ingredients WHERE name = 'Batata'), (SELECT id FROM foods WHERE food_name = 'Milanesa de pollo'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Masa de tarta'), (SELECT id FROM foods WHERE food_name = 'Milanesa de pollo'), 30),
    ((SELECT id FROM ingredients WHERE name = 'Aceite de oliva'), (SELECT id FROM foods WHERE food_name = 'Milanesa de pollo'), 10),
    
    -- Tortilla de papa
    ((SELECT id FROM ingredients WHERE name = 'Papa'), (SELECT id FROM foods WHERE food_name = 'Tortilla de papa'), 250),
    ((SELECT id FROM ingredients WHERE name = 'Huevo'), (SELECT id FROM foods WHERE food_name = 'Tortilla de papa'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Cebolla'), (SELECT id FROM foods WHERE food_name = 'Tortilla de papa'), 30),
    
    -- Arroz con pollo
    ((SELECT id FROM ingredients WHERE name = 'Pechuga de pollo'), (SELECT id FROM foods WHERE food_name = 'Arroz con pollo'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Zanahoria'), (SELECT id FROM foods WHERE food_name = 'Arroz con pollo'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Cebolla'), (SELECT id FROM foods WHERE food_name = 'Arroz con pollo'), 30),
    ((SELECT id FROM ingredients WHERE name = 'Arroz blanco cocido'), (SELECT id FROM foods WHERE food_name = 'Arroz con pollo'), 150),
    
    -- Hamburguesa
    ((SELECT id FROM ingredients WHERE name = 'Carne de vaca'), (SELECT id FROM foods WHERE food_name = 'Hamburguesa'), 120),
    ((SELECT id FROM ingredients WHERE name = 'Cebolla'), (SELECT id FROM foods WHERE food_name = 'Hamburguesa'), 30),
    ((SELECT id FROM ingredients WHERE name = 'Pan de hamburguesa'), (SELECT id FROM foods WHERE food_name = 'Hamburguesa'), 60),
    ((SELECT id FROM ingredients WHERE name = 'Tomate'), (SELECT id FROM foods WHERE food_name = 'Hamburguesa'), 30),
    
    -- Pizza margarita
    ((SELECT id FROM ingredients WHERE name = 'Tomate'), (SELECT id FROM foods WHERE food_name = 'Pizza margarita'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Morrón rojo'), (SELECT id FROM foods WHERE food_name = 'Pizza margarita'), 30),
    ((SELECT id FROM ingredients WHERE name = 'Masa de pizza'), (SELECT id FROM foods WHERE food_name = 'Pizza margarita'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Queso mozzarella'), (SELECT id FROM foods WHERE food_name = 'Pizza margarita'), 80),
    
    -- Guiso de lentejas
    ((SELECT id FROM ingredients WHERE name = 'Lentejas cocidas'), (SELECT id FROM foods WHERE food_name = 'Guiso de lentejas'), 150),
    ((SELECT id FROM ingredients WHERE name = 'Zanahoria'), (SELECT id FROM foods WHERE food_name = 'Guiso de lentejas'), 60),
    ((SELECT id FROM ingredients WHERE name = 'Cebolla'), (SELECT id FROM foods WHERE food_name = 'Guiso de lentejas'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Papa'), (SELECT id FROM foods WHERE food_name = 'Guiso de lentejas'), 80),
    
    -- Sopa de verduras
    ((SELECT id FROM ingredients WHERE name = 'Brócoli'), (SELECT id FROM foods WHERE food_name = 'Sopa de verduras'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Espinaca'), (SELECT id FROM foods WHERE food_name = 'Sopa de verduras'), 80),
    ((SELECT id FROM ingredients WHERE name = 'Zanahoria'), (SELECT id FROM foods WHERE food_name = 'Sopa de verduras'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Papa'), (SELECT id FROM foods WHERE food_name = 'Sopa de verduras'), 60),
    
    -- Tarta de espinaca
    ((SELECT id FROM ingredients WHERE name = 'Masa de tarta'), (SELECT id FROM foods WHERE food_name = 'Tarta de espinaca'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Espinaca'), (SELECT id FROM foods WHERE food_name = 'Tarta de espinaca'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Huevo'), (SELECT id FROM foods WHERE food_name = 'Tarta de espinaca'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Cebolla'), (SELECT id FROM foods WHERE food_name = 'Tarta de espinaca'), 30),
    
    -- Ensalada vegana de tofu
    ((SELECT id FROM ingredients WHERE name = 'Tofu'), (SELECT id FROM foods WHERE food_name = 'Ensalada vegana de tofu'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Tomate'), (SELECT id FROM foods WHERE food_name = 'Ensalada vegana de tofu'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Espinaca'), (SELECT id FROM foods WHERE food_name = 'Ensalada vegana de tofu'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Aceite de oliva'), (SELECT id FROM foods WHERE food_name = 'Ensalada vegana de tofu'), 10),
    
    -- Desayuno de avena con banana
    ((SELECT id FROM ingredients WHERE name = 'Avena cocida'), (SELECT id FROM foods WHERE food_name = 'Desayuno de avena con banana'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Banana'), (SELECT id FROM foods WHERE food_name = 'Desayuno de avena con banana'), 80),
    ((SELECT id FROM ingredients WHERE name = 'Leche descremada'), (SELECT id FROM foods WHERE food_name = 'Desayuno de avena con banana'), 100),
    
    -- Yogur con frutas
    ((SELECT id FROM ingredients WHERE name = 'Yogur natural'), (SELECT id FROM foods WHERE food_name = 'Yogur con frutas'), 100),
    ((SELECT id FROM ingredients WHERE name = 'Frutilla'), (SELECT id FROM foods WHERE food_name = 'Yogur con frutas'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Banana'), (SELECT id FROM foods WHERE food_name = 'Yogur con frutas'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Kiwi'), (SELECT id FROM foods WHERE food_name = 'Yogur con frutas'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Avena cocida'), (SELECT id FROM foods WHERE food_name = 'Yogur con frutas'), 50),
    ((SELECT id FROM ingredients WHERE name = 'Miel'), (SELECT id FROM foods WHERE food_name = 'Yogur con frutas'), 10)
    ''')

    conn.commit()
    conn.close()
    print('Datos insertados correctamente.')


if __name__ == "__main__":
    insert_default_data()