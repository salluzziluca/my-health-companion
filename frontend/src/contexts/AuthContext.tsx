import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  userType: 'patient' | 'professional' | null;
  setUserType: (type: 'patient' | 'professional' | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userType: null,
  setUserType: () => {},
  token: null,
  setToken: () => {},
  isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<'patient' | 'professional' | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token) as { user_type: 'patient' | 'professional' };
        setUserType(decoded.user_type);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserType(null);
        setToken(null);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
      userType, 
      setUserType, 
      token, 
      setToken,
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 