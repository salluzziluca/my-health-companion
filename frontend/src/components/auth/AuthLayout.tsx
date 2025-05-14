import React, { ReactNode } from 'react';
import { Box, Stack, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

const AuthContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    [theme.breakpoints.down('md')]: {
        background: 'none',
    },
}));

const ContentSection = styled(Stack)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    gap: theme.spacing(4),
    maxWidth: 450,
    [theme.breakpoints.down('md')]: {
        display: 'none',
    },
}));

const FormSection = styled(Box)(({ theme }) => ({
    width: '100%',
    maxWidth: 450,
    padding: theme.spacing(4),
}));

const items = [
    {
        icon: <SettingsSuggestRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Personalized Health Tracking',
        description: 'Track your health metrics, nutrition, and fitness goals with our intuitive interface.',
    },
    {
        icon: <ConstructionRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Connect with your personal health coach',
        description: 'Connect with your personal health coach to get personalized advice and support.',
    },
    {
        icon: <ThumbUpAltRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'User-Friendly Experience',
        description: 'Enjoy a seamless experience with our easy-to-use platform designed for your convenience.',
    },
    {
        icon: <AutoFixHighRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Smart Health Insights',
        description: 'Get personalized insights and recommendations based on your health data and goals.',
    },
];

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    return (
        <AuthContainer>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                sx={{
                    justifyContent: 'center',
                    gap: { xs: 6, sm: 12 },
                    p: 2,
                    mx: 'auto',
                    maxWidth: 1200,
                }}
            >
                <ContentSection>
                    {items.map((item, index) => (
                        <Stack key={index} direction="row" sx={{ gap: 2 }}>
                            {item.icon}
                            <div>
                                <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {item.description}
                                </Typography>
                            </div>
                        </Stack>
                    ))}
                </ContentSection>
                <FormSection>
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <Typography component="h1" variant="h5" align="center" gutterBottom>
                            {title}
                        </Typography>
                        {children}
                    </Paper>
                </FormSection>
            </Stack>
        </AuthContainer>
    );
};

export default AuthLayout; 