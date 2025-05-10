import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { LoginCredentials } from '../../types/auth';

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<LoginCredentials>({
        username: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const response = await authService.login(formData);
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('role', response.role);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password');
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
                        Sign In
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
                            id="username"
                            label="Email Address"
                            name="username"
                            autoComplete="email"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/register')}
                        >
                            Don't have an account? Sign Up
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginForm; 