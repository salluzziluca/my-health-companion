import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User, Role, Specialization } from '../types/auth';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8000';

interface JwtPayload {
    sub: string;
    user_type?: string;
    type?: string;
    role?: string;
    exp: number;
    [key: string]: any; // Para permitir cualquier otro campo que pueda contener el token
}

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

// Función para decodificar el token JWT y obtener el tipo de usuario
const getUserTypeFromToken = (): string | null => {
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

    unassignPatient: async (patientId: string) => {
        const response = await api.delete(`/professionals/unassign-patient/${patientId}`);
        return response.data;
    }
};

export default api; 