import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Alert,
    FormControl,
    FormLabel,
    Link,
    Checkbox,
    FormControlLabel,
    Divider,
    Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { LoginCredentials } from '../../types/auth';
import AuthLayout from './AuthLayout';

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
        <AuthLayout title="Sign In">
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
                    <FormLabel htmlFor="username">Email</FormLabel>
                    <TextField
                        id="username"
                        type="email"
                        name="username"
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        value={formData.username}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <Link
                            component="button"
                            type="button"
                            variant="body2"
                            sx={{ alignSelf: 'baseline' }}
                            onClick={() => navigate('/forgot-password')}
                        >
                            Forgot your password?
                        </Link>
                    </Box>
                    <TextField
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        required
                        fullWidth
                        variant="outlined"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign in'}
                </Button>
                <Typography sx={{ textAlign: 'center' }}>
                    Don&apos;t have an account?{' '}
                    <Link
                        component="button"
                        type="button"
                        onClick={() => navigate('/register')}
                        variant="body2"
                        sx={{ alignSelf: 'center' }}
                    >
                        Sign up
                    </Link>
                </Typography>
            </Box>
            <Divider sx={{ my: 2 }}>or</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Google')}
                >
                    Sign in with Google
                </Button>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Facebook')}
                >
                    Sign in with Facebook
                </Button>
            </Box>
        </AuthLayout>
    );
};

export default LoginForm; 