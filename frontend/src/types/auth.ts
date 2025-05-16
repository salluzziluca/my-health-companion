export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'user' | 'nutritionist';
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
    role: 'user' | 'nutritionist';
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    role: string;
} 