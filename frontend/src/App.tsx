import React, { createContext, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SignInSide from './components/auth/SignInSide';
import SignUpSide from './components/auth/SignUpSide';

// Create a theme context
export const ColorModeContext = createContext({
  toggleColorMode: () => { }
});

// Centralized color configuration
export const appColors = {
  // Primary brand colors
  primary: '#023047',
  primaryDark: '#3700b3',
  primaryLight: '#b388ff',

  // Secondary colors
  secondary: '#00bcd4', // Teal
  secondaryDark: '#008ba3',
  secondaryLight: '#62efff',

  // Background colors
  lightBackground: '#f5f5f5',
  darkBackground: '#121212',
  lightPaper: '#ffffff',
  darkPaper: 'rgba(18, 18, 18, 0.8)',

  // Link colors
  lightLink: '#023047',
  darkLink: '#90caf9',

  // Social media colors
  googleBlue: '#4285F4',
  facebookBlue: '#3b5998',

  // Gradient colors
  lightGradientStart: 'hsl(260, 100%, 97%)',
  lightGradientEnd: 'hsl(0, 0%, 100%)',
  darkGradientStart: '#023047',
  darkGradientEnd: '#000',
};

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
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
            default: mode === 'light' ? appColors.lightBackground : appColors.darkBackground,
            paper: mode === 'light' ? appColors.lightPaper : appColors.darkPaper,
          },
          action: {
            hover: mode === 'light' ? `rgba(98, 0, 234, 0.08)` : 'rgba(255, 255, 255, 0.08)',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
              outlined: {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                color: mode === 'light' ? appColors.lightLink : appColors.darkLink,
                fontWeight: mode === 'dark' ? 500 : 400,
                '&:hover': {
                  color: mode === 'light' ? appColors.primaryDark : '#fff',
                },
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                '&::before, &::after': {
                  borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.3)',
                },
                color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<SignInSide />} />
            <Route path="/register" element={<SignUpSide />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
