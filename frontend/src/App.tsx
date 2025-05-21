import React, { useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SignInSide from './components/auth/SignInSide';
import SignUpSide from './components/auth/SignUpSide';
import Dashboard from './components/pages/Dashboard';
import MyProfile from './components/pages/MyProfile';
import MyAccount from './components/pages/MyAccount';
import Layout from './components/pages/Layout';
import MealDashboard from './components/MealDashboard';
import { useThemeContext } from './theme/ThemeContext';

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
  lightBackground: '#f0f2f5', // Softer blue-gray
  darkBackground: '#121212',
  lightPaper: 'rgba(255, 255, 255, 0.9)', // Changed from pure white to slightly transparent white
  darkPaper: 'rgba(18, 18, 18, 0.8)',

  // Link colors
  lightLink: '#023047',
  darkLink: '#90caf9',

  // Social media colors
  googleBlue: '#4285F4',
  facebookBlue: '#3b5998',

  // Gradient colors
  lightGradientStart: 'hsl(210, 50%, 95%)', // Softer blue tone
  lightGradientEnd: 'hsl(0, 0%, 98%)', // Very light gray
  darkGradientStart: '#023047',
  darkGradientEnd: '#000',
};

// Transition duration for theme changes
const themeTransitionDuration = 800; // milliseconds

function App() {
  const { darkMode } = useThemeContext();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply global transition styles when theme is changing
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, themeTransitionDuration + 100);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

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
          action: {
            hover: darkMode ? `rgba(98, 0, 234, 0.08)` : 'rgba(255, 255, 255, 0.08)',
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: isTransitioning
                  ? `background-color ${themeTransitionDuration}ms ease-out, color ${themeTransitionDuration}ms ease-out`
                  : 'none',
              },
              '*, *::before, *::after': {
                transition: isTransitioning
                  ? `background-color ${themeTransitionDuration}ms ease-out, color ${themeTransitionDuration}ms ease-out, border-color ${themeTransitionDuration}ms ease-out, box-shadow ${themeTransitionDuration}ms ease-out`
                  : undefined,
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
                  color: darkMode ? appColors.primaryDark : appColors.primary,
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
    [darkMode, isTransitioning]
  );

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<SignInSide />} />
          <Route path="/register" element={<SignUpSide />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="myprofile" element={<MyProfile />} />
            <Route path="myaccount" element={<MyAccount />} />
            <Route path="meals" element={<MealDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </MUIThemeProvider>
  );
}

export default App;
