# API Endpoints - Dietas Semanales

## Base URL

```
/weekly-diets
```

## 1. Crear Dieta Semanal

**Endpoint:** `POST /weekly-diets/`

**Descripción:** Crea una nueva dieta semanal para un paciente específico.

**Parámetros (Query Parameters):**

-   `week_start_date` (date, requerido): Fecha del lunes de la semana (formato: YYYY-MM-DD)
-   `patient_id` (int, requerido): ID del paciente
-   `professional_id` (int, requerido): ID del profesional que crea la dieta

**Ejemplo de Request:**

```bash
POST /weekly-diets/?week_start_date=2024-01-15&patient_id=123&professional_id=456
```

**Respuesta exitosa (200):**

```json
{
    "id": 1,
    "week_start_date": "2024-01-15",
    "patient_id": 123,
    "professional_id": 456,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
}
```

**Errores posibles:**

-   `400`: Ya existe una dieta para ese paciente en esa semana

---

## 2. Agregar Comida a Dieta Semanal

**Endpoint:** `POST /weekly-diets/{weekly_diet_id}/meals`

**Descripción:** Agrega una comida específica a una dieta semanal existente.

**Parámetros de URL:**

-   `weekly_diet_id` (int): ID de la dieta semanal

**Parámetros (Query Parameters):**

-   `meal_name` (string, requerido): Nombre descriptivo de la comida
-   `day_of_week` (string, requerido): Día de la semana
-   `meal_of_the_day` (string, requerido): Momento del día
-   `food_id` (int, requerido): ID del alimento

**Valores permitidos:**

-   `day_of_week`: "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"
-   `meal_of_the_day`: "breakfast", "lunch", "snack", "dinner"

**Ejemplo de Request:**

```bash
POST /weekly-diets/1/meals?meal_name=Ensalada%20de%20pollo&day_of_week=lunes&meal_of_the_day=lunch&food_id=789
```

**Respuesta exitosa (200):**

```json
{
    "id": 10,
    "meal_name": "Ensalada de pollo",
    "day_of_week": "lunes",
    "meal_of_the_day": "lunch",
    "completed": false,
    "food_id": 789,
    "weekly_diet_id": 1
}
```

**Errores posibles:**

-   `404`: Dieta semanal no encontrada
-   `404`: Alimento no encontrado

---

## 3. Obtener Comidas de Dieta Semanal

**Endpoint:** `GET /weekly-diets/{weekly_diet_id}/meals`

**Descripción:** Obtiene todas las comidas de una dieta semanal, con opción de filtrar por estado de completado.

**Parámetros de URL:**

-   `weekly_diet_id` (int): ID de la dieta semanal

**Parámetros opcionales (Query Parameters):**

-   `completed` (boolean, opcional): Filtrar por comidas completadas (true) o no completadas (false)

**Ejemplos de Request:**

```bash
# Obtener todas las comidas
GET /weekly-diets/1/meals

# Obtener solo comidas completadas
GET /weekly-diets/1/meals?completed=true

# Obtener solo comidas no completadas
GET /weekly-diets/1/meals?completed=false
```

**Respuesta exitosa (200):**

```json
[
    {
        "id": 10,
        "meal_name": "Ensalada de pollo",
        "day_of_week": "lunes",
        "meal_of_the_day": "lunch",
        "completed": false,
        "food_id": 789,
        "weekly_diet_id": 1
    },
    {
        "id": 11,
        "meal_name": "Yogurt con frutas",
        "day_of_week": "lunes",
        "meal_of_the_day": "snack",
        "completed": true,
        "food_id": 790,
        "weekly_diet_id": 1
    }
]
```

**Errores posibles:**

-   `404`: Dieta semanal no encontrada

---

## 4. Eliminar Comida Específica

**Endpoint:** `DELETE /weekly-diets/{weekly_diet_id}/meals/{meal_id}`

**Descripción:** Elimina una comida específica de una dieta semanal.

**Parámetros de URL:**

-   `weekly_diet_id` (int): ID de la dieta semanal
-   `meal_id` (int): ID de la comida a eliminar

**Ejemplo de Request:**

```bash
DELETE /weekly-diets/1/meals/10
```

**Respuesta exitosa (204):** Sin contenido

**Errores posibles:**

-   `404`: Comida no encontrada en la dieta especificada

---

## 5. Eliminar Dieta Semanal Completa

**Endpoint:** `DELETE /weekly-diets/{weekly_diet_id}`

**Descripción:** Elimina una dieta semanal completa junto con todas sus comidas asociadas.

**Parámetros de URL:**

-   `weekly_diet_id` (int): ID de la dieta semanal

**Ejemplo de Request:**

```bash
DELETE /weekly-diets/1
```

**Respuesta exitosa (204):** Sin contenido

**Errores posibles:**

-   `404`: Dieta semanal no encontrada

---

## Notas Importantes

1. **Fechas:** Usar formato ISO (YYYY-MM-DD) para `week_start_date`
2. **Unicidad:** No se puede crear más de una dieta para el mismo paciente en la misma semana
3. **Cascada:** Al eliminar una dieta semanal, se eliminan automáticamente todas sus comidas
4. **Estado de comidas:** El campo `completed` se inicializa en `false` por defecto
5. **Validaciones:** Tanto la dieta como el alimento deben existir antes de agregar una comida
