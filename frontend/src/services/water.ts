import api from './api';
import { authService } from './api';

export interface WaterIntake {
    id: number;
    amount_ml: number;
    amount_glasses?: number;
    intake_time: string;
    notes?: string;
    patient_id: number;
    created_at: string;
    updated_at?: string;
}

export interface WaterIntakeSummary {
    id: number;
    amount_ml: number;
    amount_glasses: number;
    time: string; // Solo la hora en formato HH:MM
    notes?: string;
}

export interface DailyWaterSummary {
    date: string;
    total_consumed_ml: number;
    total_consumed_glasses: number;
    goal_ml: number;
    goal_glasses: number;
    progress_percentage: number;
    remaining_ml: number;
    remaining_glasses: number;
    is_goal_achieved: boolean;
    intakes_count: number;
    intakes: WaterIntakeSummary[];
}

export interface WeeklyWaterSummary {
    week_start_date: string;
    week_end_date: string;
    total_consumed_ml: number;
    average_daily_ml: number;
    days_with_intake: number;
    daily_breakdown: Array<{
        date: string;
        total_ml: number;
        total_glasses: number;
    }>;
}

export interface WaterReminderConfig {
    id?: number;
    is_enabled: boolean;
    start_time: string;
    end_time: string;
    interval_minutes: number;
    patient_id?: number;
    created_at?: string;
    updated_at?: string;
}

export const waterService = {
    // Registrar una nueva ingesta de agua (solo pacientes)
    addWaterIntake: async (intakeData: { amount_ml: number; intake_time?: string; notes?: string }): Promise<WaterIntake> => {
        console.log('Enviando datos de agua:', intakeData);
        console.log('URL completa:', `${api.defaults.baseURL}/water/`);
        console.log('Headers de la request:', api.defaults.headers);
        try {
            // Obtener el usuario actual para incluir el patient_id
            const currentUser = await authService.getCurrentUser();
            const completeIntakeData = {
                ...intakeData,
                patient_id: currentUser.id
            };
            console.log('Datos completos con patient_id:', completeIntakeData);

            const response = await api.post('/water/', completeIntakeData);
            return response.data;
        } catch (error: any) {
            console.error('Error detallado en addWaterIntake:', error);
            console.error('Request data que falló:', intakeData);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    },

    // Función rápida para agregar 250ml
    addQuickWaterIntake: async (): Promise<WaterIntake> => {
        const now = new Date().toISOString();
        const intakeData = {
            amount_ml: 250,
            intake_time: now,
            notes: ""
        };
        console.log('Datos para addQuickWaterIntake:', intakeData);
        return waterService.addWaterIntake(intakeData);
    },

    // Obtener mis ingestas de agua (solo pacientes)
    getMyWaterIntakes: async (): Promise<WaterIntake[]> => {
        const response = await api.get('/water/');
        return response.data;
    },

    // Obtener resumen diario de consumo de agua
    getDailyWaterSummary: async (date?: string): Promise<DailyWaterSummary> => {
        const params = date ? { date } : {};
        const response = await api.get('/water/daily-summary', { params });
        return response.data;
    },

    // Obtener resumen semanal de consumo de agua
    getWeeklyWaterSummary: async (weekStart?: string): Promise<WeeklyWaterSummary> => {
        const params = weekStart ? { week_start: weekStart } : {};
        const response = await api.get('/water/weekly-summary', { params });
        return response.data;
    },

    // Actualizar una ingesta de agua (solo pacientes)
    updateWaterIntake: async (intakeId: number, intakeData: { amount_ml?: number; notes?: string }): Promise<WaterIntake> => {
        const response = await api.put(`/water/${intakeId}`, intakeData);
        return response.data;
    },

    // Eliminar una ingesta de agua (solo pacientes)
    deleteWaterIntake: async (intakeId: number): Promise<void> => {
        await api.delete(`/water/${intakeId}`);
    },

    // Obtener ingestas de agua de un paciente (solo profesionales asignados)
    getPatientWaterIntakes: async (patientId: number): Promise<WaterIntake[]> => {
        const response = await api.get(`/water/patient/${patientId}`);
        return response.data;
    },

    // Obtener resumen diario de agua de un paciente (solo profesionales asignados)
    getPatientDailyWaterSummary: async (patientId: number, date?: string): Promise<DailyWaterSummary> => {
        const params = date ? { date } : {};
        const response = await api.get(`/water/patient/${patientId}/daily-summary`, { params });
        return response.data;
    },

    // === WATER REMINDERS ===

    // Crear o actualizar configuración de recordatorios de agua
    createWaterReminder: async (reminderData: Omit<WaterReminderConfig, 'id' | 'patient_id' | 'created_at' | 'updated_at'>): Promise<WaterReminderConfig> => {
        const response = await api.post('/water/reminders/', reminderData);
        return response.data;
    },

    // Obtener mi configuración de recordatorios de agua
    getWaterReminder: async (): Promise<WaterReminderConfig | null> => {
        try {
            const response = await api.get('/water/reminders/');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    // Actualizar configuración de recordatorios de agua
    updateWaterReminder: async (reminderData: Omit<WaterReminderConfig, 'id' | 'patient_id' | 'created_at' | 'updated_at'>): Promise<WaterReminderConfig> => {
        const response = await api.put('/water/reminders/', reminderData);
        return response.data;
    },

    // Eliminar configuración de recordatorios de agua
    deleteWaterReminder: async (): Promise<void> => {
        await api.delete('/water/reminders/');
    },

    // Enviar un recordatorio de agua inmediatamente (para pruebas)
    sendWaterReminderNow: async (): Promise<{ message: string }> => {
        const response = await api.post('/water/reminders/send-now');
        return response.data;
    },
};
