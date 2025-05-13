import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, MyHealtCompanionIcon } from '../CustomIcons';
import { authService } from '../../services/api';
import { LoginCredentials } from '../../types/auth';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    ...(theme.palette.mode === 'dark' && {
        backgroundColor: 'rgba(18, 18, 18, 0.6)',
        backdropFilter: 'blur(8px)',
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const StyledLink = styled(MuiLink)(({ theme }) => ({
    color: theme.palette.primary.main,
    '&:hover': {
        color: theme.palette.primary.dark,
    },
    ...(theme.palette.mode === 'dark' && {
        color: '#90caf9',
        fontWeight: 500,
        '&:hover': {
            color: '#fff',
        },
    }),
}));

const StyledOutlinedButton = styled(Button)(({ theme }) => ({
    ...(theme.palette.mode === 'dark' && {
        color: theme.palette.common.white,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        '&:hover': {
            borderColor: theme.palette.common.white,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
    }),
}));

export default function SignInCard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState<LoginCredentials>({
        username: '',
        password: ''
    });

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateInputs = () => {
        const email = document.getElementById('username') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;

        let isValid = true;

        if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 6 characters long.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.login(formData);
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('role', response.role);
            navigate('/dashboard');
        } catch (err) {
            setEmailError(true);
            setEmailErrorMessage('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card variant="outlined">
            <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <MyHealtCompanionIcon />
            </Box>
            <Typography
                component="h1"
                variant="h4"
                sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Sign in
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                <FormControl>
                    <FormLabel htmlFor="username">Email</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="username"
                        type="email"
                        name="username"
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        value={formData.username}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <StyledLink
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: 'baseline', cursor: 'pointer' }}
                        >
                            Forgot your password?
                        </StyledLink>
                    </Box>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? 'error' : 'primary'}
                        value={formData.password}
                        onChange={handleChange}
                    />
                </FormControl>
                <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                />
                <ForgotPassword open={open} handleClose={handleClose} />
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
                    <StyledLink
                        onClick={() => navigate('/register')}
                        variant="body2"
                        sx={{ alignSelf: 'center', cursor: 'pointer' }}
                    >
                        Sign up
                    </StyledLink>
                </Typography>
            </Box>
            <Divider sx={{
                '&::before, &::after': {
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.12)',
                },
                color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            }}>
                or
            </Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <StyledOutlinedButton
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Google')}
                    startIcon={<GoogleIcon />}
                >
                    Sign in with Google
                </StyledOutlinedButton>
                <StyledOutlinedButton
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign in with Facebook')}
                    startIcon={<FacebookIcon />}
                >
                    Sign in with Facebook
                </StyledOutlinedButton>
            </Box>
        </Card>
    );
} 