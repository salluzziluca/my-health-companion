export type NewMeal = {
  food_id: number;
  grams: number;
  meal_type: string;
};

export type Meal = NewMeal & {
  id: number;
  name: string;      // nombre de la comida (opcional si el backend lo incluye)
  calories: number;  // total calculado y devuelto por la API
};