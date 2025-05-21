import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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