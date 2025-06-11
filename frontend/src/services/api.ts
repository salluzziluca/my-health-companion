import axios from 'axios';
import { WeightLog, WeeklySummary, WeeklyNote } from '../types/health';
import { LoginCredentials, RegisterData, AuthResponse, User, Role, Specialization } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    user_type?: string;
    type?: string;
    role?: string;
    exp?: number;
    iat?: number;
    sub?: string;
}

interface NutrientInfo {
    name: string;
    amount: number;
    unit: string;
    status: 'deficit' | 'within_range' | 'excess';
}

interface MealNutrition {
    macronutrients: NutrientInfo[];
    micronutrients: NutrientInfo[];
}

const api = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getUserTypeFromToken = (): string | null => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const decoded = jwtDecode<JwtPayload>(token);
        console.log('Token decodificado:', decoded);

        // Intentamos diferentes campos que podrían contener el tipo de usuario
        const userType = decoded.user_type || decoded.type || decoded.role;

        if (userType) {
            return userType;
        }

        // Si no encontramos ningún campo reconocible, devolvemos null
        console.warn('No se pudo determinar el tipo de usuario desde el token');
        return null;
    } catch (error) {
        console.error('Error decodificando el token:', error);
        return null;
    }
};

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);

        const response = await api.post<AuthResponse>('/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    },

    async registerPatient(data: RegisterData): Promise<User> {
        const patientData = {
            ...data
        };
        const { role, ...dataWithoutRole } = patientData;

        const response = await api.post<User>('/register/patient', dataWithoutRole);
        return response.data;
    },

    async registerProfessional(data: RegisterData): Promise<User> {
        const professionalData = {
            ...data,
            specialization: data.specialization || "nutritionist" as Specialization
        };
        const { role, ...dataWithoutRole } = professionalData;

        const response = await api.post<User>('/register/professional', dataWithoutRole);
        return response.data;
    },

    getCurrentUser: async () => {
        const userType = getUserTypeFromToken();
        console.log('Tipo de usuario obtenido del token:', userType);

        let endpoint = '';

        // El backend podría estar usando diferentes valores en el token
        if (userType === 'patient') {
            endpoint = '/patients/me';
        } else if (userType === 'professional') {
            endpoint = '/professionals/me';
        } else {
            // Si no reconocemos el tipo o hay un problema, usamos un endpoint de fallback
            console.warn('Tipo de usuario no reconocido, intentando con /users/me');
            endpoint = '/users/me';
        }

        console.log('Haciendo petición a endpoint:', endpoint);
        try {
            const response = await api.get<User>(endpoint);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo usuario desde endpoint:', endpoint, error);

            // Si falla, intentamos con un endpoint alternativo
            if (endpoint !== '/users/me') {
                console.warn('Intentando con endpoint alternativo: /users/me');
                const fallbackResponse = await api.get<User>('/users/me');
                return fallbackResponse.data;
            }

            throw error;
        }
    },

    updateCurrentUser: async (data: any) => {
        const userType = getUserTypeFromToken();
        console.log('Tipo de usuario obtenido del token para actualización:', userType);

        let endpoint = '';

        // El backend podría estar usando diferentes valores en el token
        if (userType === 'patient') {
            endpoint = '/patients/me';
        } else if (userType === 'professional') {
            endpoint = '/professionals/me';
        } else {
            // Si no reconocemos el tipo o hay un problema, usamos un endpoint de fallback
            console.warn('Tipo de usuario no reconocido para actualización, intentando con /users/me');
            endpoint = '/users/me';
        }

        console.log('Haciendo petición de actualización a endpoint:', endpoint);
        try {
            const response = await api.patch<User>(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('Error actualizando usuario en endpoint:', endpoint, error);

            // Si falla, intentamos con un endpoint alternativo
            if (endpoint !== '/users/me') {
                console.warn('Intentando actualización con endpoint alternativo: /users/me');
                const fallbackResponse = await api.patch<User>('/users/me', data);
                return fallbackResponse.data;
            }

            throw error;
        }
    },
};

export const patientService = {
    getMyProfessional: async () => {
        const response = await api.get('/patients/my-professional');
        return response.data;
    }
};

export const professionalService = {
    getMyPatients: async () => {
        const response = await api.get('/professionals/my-patients');
        return response.data;
    },

    getPatientDetails: async (patientId: string) => {
        const response = await api.get(`/professionals/patient/${patientId}`);
        return response.data;
    },

    assignPatient: async (patientId: string) => {
        const response = await api.post(`/professionals/assign-patient/${patientId}`);
        return response.data;
    },

    unassignPatient: async (patientId: number) => {
        const response = await api.delete(`/professionals/unassign-patient/${patientId}`);
        return response.data;
    }
};

export const healthService = {
    // Weight Logs
    async logWeight(weight: number): Promise<WeightLog> {
        const response = await api.post<WeightLog>('/patients/weight', { weight });
        return response.data;
    },

    async getWeightHistory(): Promise<WeightLog[]> {
        const response = await api.get<WeightLog[]>('/patients/weight-history');
        return response.data;
    },

    // Weekly Summaries
    async getWeeklySummary(startDate?: string, endDate?: string): Promise<WeeklySummary> {
        let url = '/patients/weekly-summary';
        const params = new URLSearchParams();
        
        if (startDate) {
            params.append('start_date', startDate);
        }
        if (endDate) {
            params.append('end_date', endDate);
        }
        
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        
        const response = await api.get<WeeklySummary>(url);
        return response.data;
    },

    async getWeeklySummaryHistory(): Promise<WeeklySummary[]> {
        const response = await api.get<WeeklySummary[]>('/patients/weekly-summary/history');
        return response.data;
    },

    // Weekly Notes
    async createOrUpdateWeeklyNote(note: WeeklyNote): Promise<WeeklyNote> {
        const response = await api.post<WeeklyNote>('/patients/weekly-notes', note);
        return response.data;
    },

    async getWeeklyNote(weekStartDate: string): Promise<WeeklyNote> {
        const response = await api.get<WeeklyNote>(`/patients/weekly-notes/${weekStartDate}`);
        return response.data;
    },

    async deleteWeeklyNote(weekStartDate: string): Promise<void> {
        await api.delete(`/patients/weekly-notes/${weekStartDate}`);
    },

    unassignProfessional: async () => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token de autenticación');

        const response = await fetch('http://localhost:8000/patients/unassign-professional', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error al desvincular del profesional');
        }

        return response.json();
    },

    getNutrientSummary: async (): Promise<any> => {
        const response = await api.get('/nutrient-summary/daily');
        return response.data;
    }
};

// Weekly Diet API functions
export const createWeeklyDiet = async (data: {
    week_start_date: string;
    patient_id: number;
    professional_id: number;
}) => {
    const response = await fetch(`/api/weekly-diets/?week_start_date=${data.week_start_date}&patient_id=${data.patient_id}&professional_id=${data.professional_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) throw new Error('Error creating weekly diet');
    return response.json();
};

export const addMealToDiet = async (weeklyDietId: number, data: {
    meal_name: string;
    day_of_week: string;
    meal_of_the_day: string;
    food_id: number;
}) => {
    const response = await fetch(`/api/weekly-diets/${weeklyDietId}/meals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error adding meal to diet');
    return response.json();
};

export const getWeeklyDietMeals = async (weeklyDietId: number, completed?: boolean) => {
    const url = completed !== undefined
        ? `/api/weekly-diets/${weeklyDietId}/meals?completed=${completed}`
        : `/api/weekly-diets/${weeklyDietId}/meals`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Error fetching weekly diet meals');
    return response.json();
};

export const markMealAsCompleted = async (mealId: number, completed: boolean) => {
    const response = await fetch(`/api/weekly-diets/meals/${mealId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
    });
    if (!response.ok) throw new Error('Error updating meal status');
    return response.json();
};

export const deleteWeeklyDiet = async (weeklyDietId: number) => {
    const response = await fetch(`/api/weekly-diets/${weeklyDietId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting weekly diet');
    return response.json();
};

export const getCurrentWeeklyDiet = async () => {
    const response = await api.get('/patients/current-weekly-diet');
    return response.data;
};

export const getMealNutrition = async (mealId: number): Promise<MealNutrition> => {
    const response = await api.get(`/nutrient-summary/${mealId}`);
    return response.data;
};

export default api; 