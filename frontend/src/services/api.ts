import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';
import { WeightLog, WeeklySummary, WeeklyNote } from '../types/health';

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
    async getWeeklySummary(weekStartDate?: string): Promise<WeeklySummary> {
        const url = weekStartDate
            ? `/patients/weekly-summary?week_start_date=${weekStartDate}`
            : '/patients/weekly-summary';
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
};

export default api; 