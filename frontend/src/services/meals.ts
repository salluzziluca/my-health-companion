import api from './api';
import { NewMeal } from '../types/Meal';

export const getMeals = async () => {
  const response = await api.get('/meals');
  return response.data;
};

export const createMeal = async (mealData: NewMeal) => {
  const res = await api.post('/meals', mealData);
  return res.data;
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
  try {
    const response = await api.delete(`/meals/${mealId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

