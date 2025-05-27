import React, { createContext, useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SignInSide from './components/auth/SignInSide';
import SignUpSide from './components/auth/SignUpSide';
import Dashboard from './components/pages/Dashboard';
import MyProfile from './components/pages/MyProfile';
import MyAccount from './components/pages/MyAccount';
import Layout from './components/pages/Layout';
import MealDashboard from './components/MealDashboard';
import PatientDetails from './components/pages/PatientDetails';
import WeeklyDietPage from './components/pages/WeeklyDietPage';


// Create a theme context
export const ColorModeContext = createContext({
  toggleColorMode: () => { }
});

// Centralized color configuration
export const appColors = {
  // Primary brand colors
  primary: '#2A7138',
  primaryDark: '#022b3a',
  primaryLight: '#bfdbf7',

  // Secondary colors
  secondary: '#e1e5f2',

  // Background colors
  lightBackground: '#ffffff',
  darkBackground: 'rgba(0, 0, 0, 0.6)',
  lightPaper: '#ffffff',
  darkPaper: 'rgba(0, 0, 0, 0.6)',

  // Link colors
  lightLink: '#2A7138',
  darkLink: '#bfdbf7',

  // Accent colors (Asparagus)
  accentLight: '#a5ce78',
  accentDark: '#293c16',

  // Social media colors
  googleBlue: '#4285F4',
  facebookBlue: '#3b5998',

  // Gradient colors
  lightGradientStart: '#ffffff', // White
  lightGradientEnd: '#ffffff', // White
  darkGradientStart: '#2A7138',
  darkGradientEnd: 'hsl(0, 3.40%, 5.70%)',
};

// Transition duration for theme changes
const themeTransitionDuration = 800; // milliseconds

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Apply global transition styles when theme is changing
  useEffect(() => {
    if (isTransitioning) {
      // Use an effect cleanup to remove the transitioning class
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, themeTransitionDuration + 100); // add a little buffer
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setIsTransitioning(true);
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
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: appColors.primary + ' !important',
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: appColors.primary + ' !important',
                    },
                  },
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 100px ${mode === 'dark' ? appColors.darkBackground : '#fff'} inset !important`,
                    WebkitTextFillColor: mode === 'dark' ? '#fff' : '#000 !important',
                    transition: 'background-color 5000s ease-in-out 0s !important',
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 100px ${mode === 'dark' ? appColors.darkBackground : '#fff'} inset !important`,
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 100px ${mode === 'dark' ? appColors.darkBackground : '#fff'} inset !important`,
                  },
                  '& input:-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 100px ${mode === 'dark' ? appColors.darkBackground : '#fff'} inset !important`,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: appColors.primary + ' !important',
                  },
                },
                '& .MuiInputBase-input': {
                  color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
                },
              },
            },
          },
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
          MuiAutocomplete: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.5)',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: appColors.primary,
                  },
                },
              },
              paper: {
                backgroundColor: mode === 'dark' ? appColors.darkBackground : appColors.lightPaper,
              },
              option: {
                '&[aria-selected="true"]': {
                  backgroundColor: mode === 'dark' ? appColors.primaryDark : appColors.primary,
                  color: '#fff',
                },
                '&.Mui-focused': {
                  backgroundColor: mode === 'dark' ? appColors.primaryDark : appColors.primaryLight,
                  color: '#fff',
                },
              },
            },
          },
        },
      }),
    [mode, isTransitioning],
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
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="myprofile" element={<MyProfile />} />
              <Route path="myaccount" element={<MyAccount />} />
              <Route path="meals" element={<MealDashboard />} />
              <Route path="patient/:id" element={<PatientDetails />} />
              <Route path="weekly-diet" element={<WeeklyDietPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;

