import api from './api';

export const getAllFoods = async () => {
  const response = await api.get('/foods');
  return response.data;
};

export const getCustomFoods = async () => {
  const response = await api.get('/foods/custom');
  return response.data;
};

export const createCustomFood = async (food: { name: string }) => {
  const response = await api.post('/foods', food);
  return response.data;
};

export const addIngredientsToFood = async (
  foodId: number,
  ingredients: { ingredient_id: number; grams: number }[]
) => {
  const response = await api.post(`/${foodId}/ingredients`, ingredients);
  return response.data;
};
