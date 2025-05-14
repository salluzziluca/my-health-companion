import React, { createContext, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SignInSide from './components/auth/SignInSide';
import SignUpSide from './components/auth/SignUpSide';
import Dashboard from './components/pages/Dashboard';
import MyProfile from './components/pages/MyProfile';
import MyAccount from './components/pages/MyAccount';
import Layout from './components/pages/Layout';


// Create a theme context
export const ColorModeContext = createContext({
  toggleColorMode: () => { }
});

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
            main: '#023047',
          },
          secondary: {
            main: '#342E37',
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
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="myprofile" element={<MyProfile />} />
              <Route path="myaccount" element={<MyAccount />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} /> {/* Esta línea */}
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
