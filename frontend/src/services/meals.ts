import api from './api';

export const getMeals = async () => {
  const response = await api.get('/meals');
  return response.data;
};

export const createMeal = async (mealData: {
  food_id: number;
  grams: number;
  meal_type: string; // desayuno | almuerzo | etc.
}) => {
  const response = await api.post('/meals', mealData);
  return response.data;
};

export const getMealById = async (mealId: number) => {
  const response = await api.get(`/meals/${mealId}`);
  return response.data;
};

export const updateMeal = async (mealId: number, updates: any) => {
  const response = await api.patch(`/meals/${mealId}`, updates);
  return response.data;
};

export const deleteMeal = async (mealId: number) => {
  await api.delete(`/meals/${mealId}`);
};
