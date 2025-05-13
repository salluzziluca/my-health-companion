import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

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

    async register(data: RegisterData): Promise<User> {
        const response = await api.post<User>('/register', data);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/me');
        return response.data;
    },
};

export default api; 