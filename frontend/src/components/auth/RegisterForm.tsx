import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { RegisterData } from '../../types/auth';
import axios from 'axios';

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'user'
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
            await authService.register(formData);
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
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom>
                        Sign Up
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            error={error.includes('email')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="first_name"
                            label="First Name"
                            id="first_name"
                            autoComplete="given-name"
                            value={formData.first_name}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="last_name"
                            label="Last Name"
                            id="last_name"
                            autoComplete="family-name"
                            value={formData.last_name}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                id="role"
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="nutritionist">Nutritionist</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                        >
                            Already have an account? Sign In
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterForm; 