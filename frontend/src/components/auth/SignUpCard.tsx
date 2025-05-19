import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { GoogleIcon, FacebookIcon, MyHealtCompanionIcon } from '../CustomIcons';
import { authService } from '../../services/api';
import { RegisterData, Role } from '../../types/auth';
import axios from 'axios';
import { appColors } from '../../App';

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    backdropFilter: 'blur(4px)',
    backgroundColor: appColors.lightPaper,
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
    transition: 'background-color 0.8s ease, box-shadow 0.8s ease, backdrop-filter 0.8s ease',
    ...(theme.palette.mode === 'dark' && {
        backgroundColor: appColors.darkPaper,
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
    transition: 'color 0.4s ease, font-weight 0.4s ease',
    ...(theme.palette.mode === 'dark' && {
        color: appColors.darkLink,
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
    '&.google-button': {
        ...(theme.palette.mode === 'light' && {
            color: appColors.googleBlue,
            borderColor: appColors.googleBlue,
            '&:hover': {
                backgroundColor: `rgba(66, 133, 244, 0.08)`,
                borderColor: appColors.googleBlue,
            },
        }),
        ...(theme.palette.mode === 'dark' && {
            color: appColors.googleBlue,
            borderColor: appColors.googleBlue,
            '&:hover': {
                backgroundColor: `rgba(66, 133, 244, 0.16)`,
                borderColor: appColors.googleBlue,
            },
        }),
    },
    '&.facebook-button': {
        ...(theme.palette.mode === 'light' && {
            color: appColors.facebookBlue,
            borderColor: appColors.facebookBlue,
            '&:hover': {
                backgroundColor: `rgba(59, 89, 152, 0.08)`,
                borderColor: appColors.facebookBlue,
            },
        }),
        ...(theme.palette.mode === 'dark' && {
            color: appColors.facebookBlue,
            borderColor: appColors.facebookBlue,
            '&:hover': {
                backgroundColor: `rgba(59, 89, 152, 0.16)`,
                borderColor: appColors.facebookBlue,
            },
        }),
    },
}));

export default function SignUpCard() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [emailError, setEmailError] = React.useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [firstNameError, setFirstNameError] = React.useState(false);
    const [firstNameErrorMessage, setFirstNameErrorMessage] = React.useState('');
    const [lastNameError, setLastNameError] = React.useState(false);
    const [lastNameErrorMessage, setLastNameErrorMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState<RegisterData & { specialization?: string }>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'patient',
        specialization: 'nutritionist'
    });

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name as string]: value
        }));
    };

    const validateInputs = () => {
        const email = document.getElementById('email') as HTMLInputElement;
        const password = document.getElementById('password') as HTMLInputElement;
        const firstName = document.getElementById('first_name') as HTMLInputElement;
        const lastName = document.getElementById('last_name') as HTMLInputElement;

        let isValid = true;

        // Email validation - strict pattern that rejects special characters
        // Allow only: letters, numbers, dots, underscores, hyphens, and @ symbol
        const validEmailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email.value) {
            setEmailError(true);
            setEmailErrorMessage('Please enter an email address.');
            isValid = false;
        } else if (!validEmailPattern.test(email.value)) {
            setEmailError(true);
            setEmailErrorMessage('Please enter a valid email address without special characters.');
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }

        if (!password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Please enter a password.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        if (!firstName.value) {
            setFirstNameError(true);
            setFirstNameErrorMessage('Please enter a first name.');
            isValid = false;
        } else if (firstName.value.length > 40) {
            setFirstNameError(true);
            setFirstNameErrorMessage('First name cannot exceed 40 characters.');
            isValid = false;
        } else if (!/^[a-zA-Z]+$/.test(firstName.value)) {
            setFirstNameError(true);
            setFirstNameErrorMessage('First name must contain only letters.');
            isValid = false;
        } else {
            setFirstNameError(false);
            setFirstNameErrorMessage('');
        }

        if (!lastName.value) {
            setLastNameError(true);
            setLastNameErrorMessage('Please enter a last name.');
            isValid = false;
        } else if (lastName.value.length > 40) {
            setLastNameError(true);
            setLastNameErrorMessage('Last name cannot exceed 40 characters.');
            isValid = false;
        } else if (!/^[a-zA-Z]+$/.test(lastName.value)) {
            setLastNameError(true);
            setLastNameErrorMessage('Last name must contain only letters.');
            isValid = false;
        } else {
            setLastNameError(false);
            setLastNameErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        // Reset all error states
        setEmailError(false);
        setEmailErrorMessage('');
        setPasswordError(false);
        setPasswordErrorMessage('');
        setFirstNameError(false);
        setFirstNameErrorMessage('');
        setLastNameError(false);
        setLastNameErrorMessage('');

        try {
            if (formData.role === 'patient') {
                await authService.registerPatient(formData);
            } else {
                await authService.registerProfessional({
                    ...formData,
                    specialization: formData.specialization || 'nutritionist'
                });
            }
            navigate('/login');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 400) {
                    setEmailError(true);
                    setEmailErrorMessage('This email is already registered. Please use a different email or try logging in.');
                } else if (err.response?.status === 422 && err.response?.data?.detail) {
                    // Handle validation errors from the backend
                    const validationErrors = err.response.data.detail;

                    if (Array.isArray(validationErrors)) {
                        validationErrors.forEach((error: any) => {
                            const field = error.loc[1]; // Get the field name from the error location
                            const errorMessage = error.msg;

                            if (field === 'email') {
                                setEmailError(true);
                                setEmailErrorMessage(errorMessage);
                            } else if (field === 'password') {
                                setPasswordError(true);
                                setPasswordErrorMessage(errorMessage);
                            } else if (field === 'first_name') {
                                setFirstNameError(true);
                                setFirstNameErrorMessage(errorMessage);
                            } else if (field === 'last_name') {
                                setLastNameError(true);
                                setLastNameErrorMessage(errorMessage);
                            }
                        });
                    } else if (typeof validationErrors === 'string') {
                        setEmailError(true);
                        setEmailErrorMessage(validationErrors);
                    }
                } else if (err.response?.data?.detail) {
                    setEmailError(true);
                    setEmailErrorMessage(err.response.data.detail);
                } else {
                    setEmailError(true);
                    setEmailErrorMessage('Registration failed. Please check your information and try again.');
                }
            } else {
                setEmailError(true);
                setEmailErrorMessage('An unexpected error occurred. Please try again later.');
            }
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
                Sign up
            </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}
            >
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        value={formData.email}
                        onChange={handleTextFieldChange}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? 'error' : 'primary'}
                        value={formData.password}
                        onChange={handleTextFieldChange}
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
                        onChange={handleTextFieldChange}
                        error={firstNameError}
                        helperText={firstNameErrorMessage}
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
                        onChange={handleTextFieldChange}
                        error={lastNameError}
                        helperText={lastNameErrorMessage}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel htmlFor="role">Role</FormLabel>
                    <Select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleSelectChange}
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
                            onChange={handleSelectChange}
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
                    <StyledLink
                        onClick={() => navigate('/login')}
                        variant="body2"
                        sx={{ alignSelf: 'center', cursor: 'pointer' }}
                    >
                        Sign in
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
                    onClick={() => alert('Sign up with Google')}
                    startIcon={<GoogleIcon />}
                    className="google-button"
                >
                    Sign up with Google
                </StyledOutlinedButton>
                <StyledOutlinedButton
                    fullWidth
                    variant="outlined"
                    onClick={() => alert('Sign up with Facebook')}
                    startIcon={<FacebookIcon />}
                    className="facebook-button"
                >
                    Sign up with Facebook
                </StyledOutlinedButton>
            </Box>
        </Card>
    );
} 