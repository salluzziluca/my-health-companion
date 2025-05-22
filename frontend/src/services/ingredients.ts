import api from './api';

export const getIngredients = async () => {
  const response = await api.get('/ingredients');
  return response.data;
};

export const getIngredientById = async (ingredientId: number) => {
  const response = await api.get(`/ingredients/${ingredientId}`);
  return response.data;
};
