import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { appColors } from '../App';

type ThemeContextType = {
    darkMode: boolean;
    toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    darkMode: false,
    toggleDarkMode: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        // Check if user has a saved preference
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: {
                        main: appColors.primary,
                        dark: appColors.primaryDark,
                        light: appColors.primaryLight,
                    },
                    secondary: {
                        main: appColors.secondary,
                        dark: appColors.secondaryDark,
                        light: appColors.secondaryLight,
                    },
                    background: {
                        default: darkMode ? appColors.darkBackground : appColors.lightBackground,
                        paper: darkMode ? appColors.darkPaper : appColors.lightPaper,
                    },
                    text: {
                        primary: darkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                        secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                    },
                    action: {
                        hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        selected: darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
                    },
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                transition: 'background-color 0.3s ease-out, color 0.3s ease-out',
                                backgroundColor: darkMode ? appColors.darkBackground : appColors.lightBackground,
                                color: darkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundColor: darkMode ? appColors.primary : appColors.primary,
                                color: '#ffffff',
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                            },
                            outlined: {
                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.23)',
                            },
                        },
                    },
                    MuiLink: {
                        styleOverrides: {
                            root: {
                                color: darkMode ? appColors.darkLink : appColors.lightLink,
                                fontWeight: darkMode ? 500 : 400,
                                '&:hover': {
                                    color: darkMode ? appColors.primaryLight : appColors.primary,
                                },
                            },
                        },
                    },
                    MuiDivider: {
                        styleOverrides: {
                            root: {
                                '&::before, &::after': {
                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.12)',
                                },
                                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                            },
                        },
                    },
                },
            }),
        [darkMode]
    );

    const toggleDarkMode = () => {
        setDarkMode((prevMode: boolean) => {
            const newMode = !prevMode;
            // Save preference to localStorage
            localStorage.setItem('darkMode', JSON.stringify(newMode));
            return newMode;
        });
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
}; 