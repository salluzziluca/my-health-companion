import sqlite3

# Conexión a la base de datos
conn = sqlite3.connect('backend/health_app.sqlite')
cursor = conn.cursor()

cursor.executescript('''
INSERT INTO ingredients (name, category, unit, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
('Pechuga de pollo', 'animal', '100g', 165, 31, 3.6, 0, 1.0, 15, 0),
('Muslo de pollo', 'animal', '100g', 177, 24, 8.0, 0, 1.3, 11, 0),
('Carne de vaca', 'animal', '100g', 250, 26, 17, 0, 2.6, 11, 0),
('Carne molida magra', 'animal', '100g', 215, 26, 12, 0, 2.5, 18, 0),
('Lomo de cerdo', 'animal', '100g', 143, 21, 5, 0, 0.9, 10, 0),
('Costilla de cerdo', 'animal', '100g', 291, 20, 24, 0, 1.1, 18, 0),
('Salmón', 'animal', '100g', 208, 20, 13, 0, 0.5, 9, 0),
('Atún', 'animal', '100g', 132, 28, 1.0, 0, 1.0, 10, 0),
('Huevo', 'animal', 'unidad', 70, 6, 5, 0.6, 1.2, 25, 0);

-- Verduras
INSERT INTO ingredients (name, category, unit, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
('Zanahoria', 'verdura', '100g', 41, 0.9, 0.2, 10, 0.3, 33, 5.9),
('Brócoli', 'verdura', '100g', 34, 2.8, 0.4, 7, 0.7, 47, 89),
('Espinaca', 'verdura', '100g', 23, 2.9, 0.4, 3.6, 2.7, 99, 28),
('Papa', 'verdura', '100g', 77, 2.0, 0.1, 17, 0.8, 12, 19.7),
('Batata', 'verdura', '100g', 86, 1.6, 0.1, 20, 0.6, 30, 2.4),
('Tomate', 'verdura', '100g', 18, 0.9, 0.2, 3.9, 0.3, 10, 13.7),
('Cebolla', 'verdura', '100g', 40, 1.1, 0.1, 9.3, 0.2, 23, 8.1),
('Morrón rojo', 'verdura', '100g', 31, 1.0, 0.3, 6.0, 0.4, 7, 127),
('Ajo', 'verdura', '100g', 149, 6.4, 0.5, 33, 1.7, 181, 31.2);

-- Frutas
INSERT INTO ingredients (name, category, unit, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
('Manzana', 'fruta', '100g', 52, 0.3, 0.2, 14, 0.1, 6, 4.6),
('Banana', 'fruta', '100g', 89, 1.1, 0.3, 23, 0.3, 5, 8.7),
('Naranja', 'fruta', '100g', 47, 0.9, 0.1, 12, 0.1, 40, 53),
('Uva', 'fruta', '100g', 69, 0.7, 0.2, 18, 0.4, 10, 10.8),
('Pera', 'fruta', '100g', 57, 0.4, 0.1, 15, 0.2, 9, 4.3),
('Frutilla', 'fruta', '100g', 32, 0.7, 0.3, 7.7, 0.4, 16, 58.8),
('Kiwi', 'fruta', '100g', 61, 1.1, 0.5, 15, 0.3, 34, 92.7),
('Sandía', 'fruta', '100g', 30, 0.6, 0.2, 8, 0.2, 7, 8.1);

-- Proteínas vegetales
INSERT INTO ingredients (name, category, unit, calories_kcal, protein_g, fat_g, carbs_g, iron_mg, calcium_mg, vitamin_c_mg) VALUES
('Tofu', 'proteína vegetal', '100g', 76, 8.0, 4.8, 1.9, 1.6, 350, 0.1),
('Lentejas cocidas', 'proteína vegetal', '100g', 116, 9.0, 0.4, 20, 3.3, 19, 1.5),
('Garbanzos cocidos', 'proteína vegetal', '100g', 164, 8.9, 2.6, 27.4, 2.9, 49, 1.3),
('Porotos negros cocidos', 'proteína vegetal', '100g', 132, 8.9, 0.5, 23.7, 2.1, 27, 0.0),
('Soja cocida', 'proteína vegetal', '100g', 173, 16.6, 9.0, 9.9, 2.5, 102, 6.0),
('Seitán', 'proteína vegetal', '100g', 121, 21, 2.0, 4.0, 1.2, 14, 0);

-- Alimentos (foods)
INSERT INTO foods (food_name) VALUES
('Ensalada César'),
('Milanesa de pollo'),
('Tortilla de papa'),
('Arroz con pollo'),
('Hamburguesa'),
('Pizza margarita'),
('Guiso de lentejas'),
('Sopa de verduras');

-- Relación ingredientes-alimentos (ingredients_foods)
INSERT INTO ingredients_foods (ingredient_id, food_id) VALUES
(2, 1),  -- Ensalada César: Muslo de pollo
(10, 1), -- Ensalada César: Zanahoria
(12, 1), -- Ensalada César: Espinaca
(1, 2), -- Milanesa de pollo: Pechuga de pollo
(17, 2), -- Milanesa de pollo: Huevo
(15, 2), -- Milanesa de pollo: Papa
(15, 3), -- Tortilla de papa: Papa
(17, 3), -- Tortilla de papa: Huevo
(1, 4),  -- Arroz con pollo: Pechuga de pollo
(15, 4), -- Arroz con pollo: Papa
(18, 4), -- Arroz con pollo: Batata
(3, 5),  -- Hamburguesa: Carne de vaca
(7, 5),  -- Hamburguesa: Salmón
(14, 6), -- Pizza margarita: Tomate
(17, 6), -- Pizza margarita: Huevo
(20, 7), -- Guiso de lentejas: Lentejas cocidas
(10, 7), -- Guiso de lentejas: Zanahoria
(11, 8), -- Sopa de verduras: Brócoli
(12, 8), -- Sopa de verduras: Espinaca
(13, 8); -- Sopa de verduras: Papa
''')

conn.commit()
conn.close()
print('Datos insertados correctamente.')
