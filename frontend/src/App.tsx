import React, { createContext, useMemo, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/system';
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

  // Gradient colors for light mode
  lightGradientStart: 'hsl(210, 50%, 95%)', // Softer blue tone
  lightGradientMiddle: 'hsl(230, 40%, 96%)', // Slight purple tint
  lightGradientEnd: 'hsl(0, 0%, 98%)', // Very light gray

  // Gradient colors for dark mode
  darkGradientStart: '#023047', // Deep blue
  darkGradientMiddle: '#052A40', // Slightly lighter blue
  darkGradientEnd: '#000', // Pure black
};

// Animation for the background transition
const fadeInOut = keyframes`
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

// Define interface for component props
interface BackgroundTransitionProps {
  mode: 'light' | 'dark';
  isChanging: boolean;
}

// Component that shows a transition effect when theme changes - only for background
const BackgroundTransition = ({ mode, isChanging }: BackgroundTransitionProps) => {
  const darkToLight = mode === 'light' && isChanging;
  const lightToDark = mode === 'dark' && isChanging;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Set to 0 to be behind all content
        pointerEvents: 'none',
        opacity: 0,
        animation: isChanging ? `${fadeInOut} 1.5s ease-in-out forwards` : 'none',
        backgroundImage: darkToLight
          ? `linear-gradient(135deg, 
                ${appColors.lightGradientStart} 0%, 
                ${appColors.lightGradientMiddle} 35%, 
                ${appColors.lightGradientEnd} 65%, 
                ${appColors.lightGradientStart} 100%)`
          : lightToDark
            ? `linear-gradient(135deg, 
                ${appColors.darkGradientStart} 0%, 
                ${appColors.darkGradientMiddle} 35%, 
                ${appColors.darkGradientEnd} 65%, 
                ${appColors.darkGradientStart} 100%)`
            : 'none',
        backgroundSize: '300% 300%',
        transition: 'background-image 0.5s ease',
      }}
    />
  );
};

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // Handle theme mode change
  useEffect(() => {
    if (isTransitioning) {
      // Show the background transition effect
      setShowTransition(true);

      // Change the mode immediately
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));

      // Hide the transition effect after the animation completes
      const hideTransitionTimer = setTimeout(() => {
        setShowTransition(false);
        setIsTransitioning(false);
      }, 1500);

      return () => clearTimeout(hideTransitionTimer);
    }
  }, [isTransitioning]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        if (!isTransitioning) {
          setIsTransitioning(true);
        }
      },
    }),
    [isTransitioning],
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
        {/* Add the background transition effect */}
        <BackgroundTransition mode={mode} isChanging={showTransition} />
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
