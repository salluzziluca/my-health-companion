import * as React from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Content from './Content';
import SignUpCard from './SignUpCard';
import ColorModeToggle from './ColorModeToggle';
import { appColors } from '../../App';

export default function SignUpSide() {
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
                        zIndex: -1,
                    },
                    (theme) => ({
                        backgroundImage:
                            `radial-gradient(ellipse at 50% 50%, ${appColors.lightGradientStart}, ${appColors.lightGradientEnd})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        ...(theme.palette.mode === 'dark' && {
                            backgroundImage:
                                `radial-gradient(at 50% 50%, ${appColors.darkGradientStart}, ${appColors.darkGradientEnd})`,
                        }),
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
                        <SignUpCard />
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
} 