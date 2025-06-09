import api from './api';

export interface Goal {
    id: number;
    goal_type: 'weight' | 'calories' | 'water';
    target_weight?: number;
    target_calories?: number;
    target_milliliters?: number;
    start_date: string;
    target_date: string;
    status: 'active' | 'completed' | 'cancelled';
    patient_id: number;
    professional_id: number;
    achieved_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface GoalProgress {
    goal: Goal;
    current_weight?: number | null;
    current_daily_calories?: number | null;
    current_daily_water_ml?: number | null;
    weight_progress_difference?: number | null;
    calories_progress_difference?: number | null;
    water_progress_difference?: number | null;
    is_weight_achieved?: boolean | null;
    is_calories_achieved?: boolean | null;
    is_water_achieved?: boolean | null;
    is_fully_achieved: boolean;
    days_remaining?: number | null;
}

export const goalsService = {
    // Crear un nuevo objetivo (solo profesionales)
    createGoal: async (goalData: Partial<Goal>): Promise<Goal> => {
        const response = await api.post('/goals/', goalData);
        return response.data;
    },

    // Obtener todos los objetivos de un paciente (solo profesionales)
    getPatientGoals: async (patientId: number, status?: string): Promise<Goal[]> => {
        const params = status ? { status } : {};
        const response = await api.get(`/goals/patient/${patientId}`, { params });
        return response.data;
    },

    // Obtener progreso de objetivos de un paciente (solo profesionales)
    getPatientGoalsProgress: async (patientId: number): Promise<GoalProgress[]> => {
        const response = await api.get(`/goals/patient/${patientId}/progress`);
        return response.data;
    },

    // Obtener todos mis objetivos (pacientes)
    getMyGoals: async (status?: string): Promise<Goal[]> => {
        const params = status ? { status } : {};
        const response = await api.get('/goals/my-goals', { params });
        return response.data;
    },

    // Obtener solo mis objetivos activos (pacientes)
    getMyActiveGoals: async (): Promise<Goal[]> => {
        const response = await api.get('/goals/my-goals/active');
        return response.data;
    },

    // Obtener progreso de mis objetivos activos (pacientes)
    getMyGoalsProgress: async (): Promise<GoalProgress[]> => {
        const response = await api.get('/goals/my-goals/progress');
        return response.data;
    },

    // Actualizar un objetivo (solo profesionales)
    updateGoal: async (goalId: number, goalData: Partial<Goal>): Promise<Goal> => {
        const response = await api.put(`/goals/${goalId}`, goalData);
        return response.data;
    },

    // Eliminar un objetivo (solo profesionales)
    deleteGoal: async (goalId: number): Promise<void> => {
        await api.delete(`/goals/${goalId}`);
    },

    // Marcar objetivo como completado (solo profesionales)
    completeGoal: async (goalId: number): Promise<Goal> => {
        const response = await api.post(`/goals/${goalId}/complete`);
        return response.data;
    }
}; 