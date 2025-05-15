import * as React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Content from './Content';
import SignInCard from './SignInCard';
import ColorModeToggle from './ColorModeToggle';
import { appColors } from '../../App';
import { keyframes } from '@mui/system';

// Create animation keyframes for the gradient movement
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export default function SignInSide() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                position: 'relative',
                overflow: 'auto',
            }}
        >
            <ColorModeToggle />
            <Box
                sx={[
                    {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1,
                        transition: 'background-image 1.2s ease-in-out',
                    },
                    (theme) => ({
                        backgroundSize: '300% 300%',
                        animation: `${gradientAnimation} 15s ease infinite`,
                        backgroundImage: theme.palette.mode === 'light'
                            ? `linear-gradient(135deg, 
                                ${appColors.lightGradientStart} 0%, 
                                ${appColors.lightGradientMiddle} 35%, 
                                ${appColors.lightGradientEnd} 65%, 
                                ${appColors.lightGradientStart} 100%)`
                            : `linear-gradient(135deg, 
                                ${appColors.darkGradientStart} 0%, 
                                ${appColors.darkGradientMiddle} 35%, 
                                ${appColors.darkGradientEnd} 65%, 
                                ${appColors.darkGradientStart} 100%)`,
                        backgroundRepeat: 'no-repeat',
                    }),
                ]}
            />
            <Stack
                direction="column"
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: { xs: 4, sm: 6 },
                    px: 2,
                    position: 'relative',
                    zIndex: 2,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '1200px',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 4, sm: 8 },
                    }}
                >
                    <Box
                        sx={{
                            flex: '1 1 auto',
                            maxWidth: { xs: '100%', md: '450px' },
                            display: { xs: 'none', sm: 'block' },
                        }}
                    >
                        <Content />
                    </Box>
                    <Box
                        sx={{
                            flex: '1 1 auto',
                            maxWidth: { xs: '100%', sm: '450px' },
                        }}
                    >
                        <SignInCard />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
} 