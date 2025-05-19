import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Alert,
    FormControl,
    FormLabel,
    Link,
    Select,
    MenuItem,
    SelectChangeEvent,
    Typography,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { RegisterData, Role, Specialization } from '../../types/auth';
import axios from 'axios';
import AuthLayout from './AuthLayout';

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'patient',
        specialization: 'nutritionist'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (formData.role === 'patient') {
                await authService.registerPatient(formData);
            } else {
                await authService.registerProfessional(formData);
            }
            navigate('/login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 400) {
                    setError('This email is already registered. Please use a different email or try logging in.');
                } else if (err.response?.data?.detail) {
                    setError(err.response.data.detail);
                } else {
                    setError('Registration failed. Please check your information and try again.');
                }
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Sign Up">
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        value={formData.email}
                        onChange={handleChange}
                        error={error.includes('email')}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="outlined"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="first_name">First Name</FormLabel>
                    <TextField
                        name="first_name"
                        id="first_name"
                        autoComplete="given-name"
                        required
                        fullWidth
                        variant="outlined"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="last_name">Last Name</FormLabel>
                    <TextField
                        name="last_name"
                        id="last_name"
                        autoComplete="family-name"
                        required
                        fullWidth
                        variant="outlined"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel htmlFor="role">Role</FormLabel>
                    <Select
                        id="role"
                        name="role"
                        value={formData.role}
                        label="Role"
                        onChange={handleChange}
                        variant="outlined"
                    >
                        <MenuItem value="patient">Patient</MenuItem>
                        <MenuItem value="professional">Professional (Nutritionist/Trainer)</MenuItem>
                    </Select>
                </FormControl>

                {formData.role === 'professional' && (
                    <FormControl fullWidth>
                        <FormLabel htmlFor="specialization">Specialization</FormLabel>
                        <Select
                            id="specialization"
                            name="specialization"
                            value={formData.specialization || 'nutritionist'}
                            label="Specialization"
                            onChange={handleChange}
                            variant="outlined"
                        >
                            <MenuItem value="nutritionist">Nutritionist</MenuItem>
                            <MenuItem value="personal trainer">Personal Trainer</MenuItem>
                        </Select>
                    </FormControl>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Signing up...' : 'Sign up'}
                </Button>
                <Typography sx={{ textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Link
                        component="button"
                        type="button"
                        onClick={() => navigate('/login')}
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Sign in
                    </Link>
                </Typography>
            </Box>
            <Divider sx={{ my: 2 }}>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign up with Google')}
                >
                    Sign up with Google
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign up with Facebook')}
                >
                    Sign up with Facebook
                </Button>
            </Box>
        </AuthLayout>
    );
};

export default RegisterForm; 