import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import SignInSide from './components/auth/SignInSide';
import SignUpSide from './components/auth/SignUpSide';
import Dashboard from './components/pages/Dashboard';
import MyProfile from './components/pages/MyProfile';
import MyAccount from './components/pages/MyAccount';
import Layout from './components/pages/Layout';
import MealDashboard from './components/MealDashboard';

// Centralized color configuration
export const appColors = {
  // Primary brand colors
  primary: '#023047',
  primaryDark: '#3700b3',
  primaryLight: '#b388ff',

  // Secondary colors
  secondary: '#00bcd4', // Teal
  secondaryDark: 'rgba(0, 188, 212, 0.9)',
  secondaryLight: '#62efff',

  // Background colors
  lightBackground: '#f0f2f5', // Softer blue-gray
  darkBackground: '#023047', // Changed to match primary color for dark theme
  lightPaper: 'rgba(255, 255, 255, 0.9)',
  darkPaper: 'rgba(18, 19, 20, 0.7)', // Changed to match primary color with transparency

  // Link colors
  lightLink: '#023047',
  darkLink: '#90caf9',

  // Social media colors
  googleBlue: '#4285F4',
  facebookBlue: '#3b5998',

  // Gradient colors
  lightGradientStart: 'hsl(210, 50%, 95%)',
  lightGradientEnd: 'hsl(0, 0%, 98%)',
  darkGradientStart: '#023047',
  darkGradientEnd: '#000',
};

function App() {
  return (
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
  );
}

export default App;
