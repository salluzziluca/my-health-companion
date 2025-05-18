export type Role = 'patient' | 'professional';
export type Specialization = 'nutritionist' | 'personal trainer';

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    weight?: number;
    height?: number;
    birth_date?: string;
    gender?: string;
    specialization?: Specialization;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: Role;
    specialization?: Specialization;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    role: Role;
} 