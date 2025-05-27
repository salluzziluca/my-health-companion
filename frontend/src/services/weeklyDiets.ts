import api from './api';

export interface WeeklyDiet {
    id: number;
    week_start_date: string;
    patient_id: number;
    professional_id: number;
    created_at: string;
    updated_at: string;
}

export interface WeeklyDietMeal {
    id: number;
    meal_name: string;
    day_of_week: string;
    meal_of_the_day: string;
    completed: boolean;
    food_id: number;
    weekly_diet_id: number;
}

export interface Ingredient {
    id: number;
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
}

export interface FoodIngredient {
    id: number;
    ingredient_id: number;
    grams: number;
}

export interface FoodWithIngredients {
    id: number;
    food_name: string;
    patient_id: number | null;
    ingredients: FoodIngredient[];
}

export const getCurrentWeeklyDiet = async (): Promise<WeeklyDiet> => {
    // Primero obtenemos el ID del paciente actual
    const patientResponse = await api.get('/patients/me');
    const patientId = patientResponse.data.id;

    // Luego obtenemos la dieta semanal del paciente
    const response = await api.get(`/weekly-diets/patient/${patientId}`);

    // La respuesta es un array, tomamos la primera dieta
    if (!Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No se encontró una dieta semanal');
    }

    return response.data[0];
};

export const getWeeklyDietMeals = async (weeklyDietId: number): Promise<WeeklyDietMeal[]> => {
    const response = await api.get(`/weekly-diets/${weeklyDietId}/meals`);
    return response.data;
};

export const markMealAsCompleted = async (mealId: number, completed: boolean, weeklyDietId: number, grams: number = 100): Promise<WeeklyDietMeal> => {
    if (completed) {
        // Para completar, necesitamos enviar el parámetro grams
        const response = await api.patch(`/weekly-diets/${weeklyDietId}/meals/${mealId}/complete?grams=${grams}`);
        // El endpoint complete devuelve {message, meal, weekly_meal}
        return response.data.weekly_meal;
    } else {
        // Para descompletar, no necesitamos parámetros adicionales
        const response = await api.patch(`/weekly-diets/${weeklyDietId}/meals/${mealId}/uncomplete`);
        // El endpoint uncomplete devuelve {message, weekly_meal, deleted_meal_id}
        return response.data.weekly_meal;
    }
};

export const getIngredientDetails = async (ingredientId: number): Promise<Ingredient> => {
    const response = await api.get(`/ingredients/${ingredientId}`);
    return response.data;
};

export const getFoodIngredients = async (foodId: number): Promise<FoodWithIngredients> => {
    const response = await api.get(`/foods/${foodId}/ingredients`);
    return response.data;
}; 