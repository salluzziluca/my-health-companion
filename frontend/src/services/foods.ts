import api from './api';

export const getAllFoods = async () => {
  try {
    console.log('🔍 getAllFoods: Iniciando obtención de alimentos...');
    
    // Obtener tanto las comidas precargadas como las personalizadas del usuario
    const [preloadedResponse, customResponse] = await Promise.all([
      api.get('/foods'),
      api.get('/foods/custom')
    ]);
    
    console.log('📋 getAllFoods: Comidas precargadas recibidas:', preloadedResponse.data?.length || 0);
    console.log('📋 getAllFoods: Comidas personalizadas recibidas:', customResponse.data?.length || 0);
    console.log('📋 getAllFoods: Datos precargados:', preloadedResponse.data);
    console.log('📋 getAllFoods: Datos personalizados:', customResponse.data);
    
    // Combinar ambas listas
    const allFoods = [...preloadedResponse.data, ...customResponse.data];
    console.log('✅ getAllFoods: Total de alimentos combinados:', allFoods.length);
    console.log('✅ getAllFoods: Primeros 3 alimentos:', allFoods.slice(0, 3));
    
    return allFoods;
  } catch (error) {
    console.error('❌ getAllFoods: Error al obtener los alimentos:', error);
    // Si falla alguna de las llamadas, intentar obtener solo las precargadas
    try {
      console.log('🔄 getAllFoods: Intentando fallback a solo comidas precargadas...');
      const response = await api.get('/foods');
      console.log('✅ getAllFoods: Fallback exitoso, comidas obtenidas:', response.data?.length || 0);
      return response.data;
    } catch (fallbackError) {
      console.error('❌ getAllFoods: Error en fallback:', fallbackError);
      throw fallbackError;
    }
  }
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
