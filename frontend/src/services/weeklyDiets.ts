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

export const markMealAsCompleted = async (mealId: number, completed: boolean): Promise<WeeklyDietMeal> => {
    const response = await api.patch(`/weekly-diets/meals/${mealId}`, { completed });
    return response.data;
}; 