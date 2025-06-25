import api from './axiosConfig';

export interface TemplateDiet {
  id: number;
  name: string;
  professional_id: number;
  created_at: string;
  meals?: TemplateDietMeal[];
}

export interface TemplateDietMeal {
  id: number;
  meal_name: string;
  day_of_week: string;
  meal_of_the_day: string;
  food_id: number;
  template_diet_id: number;
  food?: {
    id: number;
    food_name: string;
    calories: number;
  };
}

export interface CreateTemplateDietRequest {
  name: string;
}

export interface AddMealToTemplateRequest {
  meal_name: string;
  day_of_week: string;
  meal_of_the_day: string;
  food_id: number;
}

export interface AssignTemplateToPatientRequest {
  patient_id: number;
  week_start_date: string;
}

export const templateDietsService = {
  // Crear un nuevo template de dieta
  createTemplate: async (data: CreateTemplateDietRequest): Promise<TemplateDiet> => {
    const response = await api.post('/template-diets', data);
    return response.data;
  },

  // Listar todos los templates de dieta del profesional actual
  getTemplates: async (): Promise<TemplateDiet[]> => {
    const response = await api.get('/template-diets');
    return response.data;
  },

  // Obtener información de un template de dieta específico
  getTemplate: async (templateId: number): Promise<TemplateDiet> => {
    const response = await api.get(`/template-diets/${templateId}`);
    return response.data;
  },

  // Obtener todas las comidas de una plantilla de dieta específica
  getTemplateMeals: async (templateId: number): Promise<TemplateDietMeal[]> => {
    const response = await api.get(`/template-diets/${templateId}/meals`);
    return response.data;
  },

  // Agregar una comida a un template de dieta
  addMealToTemplate: async (templateId: number, data: AddMealToTemplateRequest): Promise<TemplateDietMeal> => {
    const response = await api.post(`/template-diets/${templateId}/meals`, data);
    return response.data;
  },

  // Asignar un template de dieta a un paciente
  assignToPatient: async (templateId: number, data: AssignTemplateToPatientRequest): Promise<any> => {
    const response = await api.post(`/template-diets/${templateId}/assign-to-patient`, data);
    return response.data;
  },

  // Crear un template de dieta a partir de una dieta semanal existente
  createFromWeeklyDiet: async (weeklyDietId: number, name: string): Promise<TemplateDiet> => {
    const response = await api.post('/template-diets/from-weekly', {
      weekly_diet_id: weeklyDietId,
      name: name
    });
    return response.data;
  },

  // Eliminar un template de dieta
  deleteTemplate: async (templateId: number): Promise<void> => {
    await api.delete(`/template-diets/${templateId}`);
  },

  // Eliminar una comida de un template
  deleteMealFromTemplate: async (templateId: number, mealId: number): Promise<void> => {
    await api.delete(`/template-diets/${templateId}/meals/${mealId}`);
  }
}; 