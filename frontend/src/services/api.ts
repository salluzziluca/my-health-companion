import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User, Role, Specialization } from '../types/auth';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
        const role = localStorage.getItem('role');
        let endpoint = '';

        if (role === 'patient') {
            endpoint = '/patients/me';
        } else if (role === 'professional') {
            endpoint = '/professionals/me';
        } else {
            throw new Error('Unknown role');
        }

        const response = await api.get<User>(endpoint);
        return response.data;
    },

    updateCurrentUser: async (data: any) => {
        const role = localStorage.getItem('role');
        let endpoint = '';

        if (role === 'patient') {
            endpoint = '/patients/me';
        } else if (role === 'professional') {
            endpoint = '/professionals/me';
        } else {
            throw new Error('Unknown role');
        }

        const response = await api.patch<User>(endpoint, data);
        return response.data;
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

    unassignPatient: async (patientId: string) => {
        const response = await api.delete(`/professionals/unassign-patient/${patientId}`);
        return response.data;
    }
};

export default api; 