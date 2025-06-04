import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  userType: 'patient' | 'professional' | null;
  setUserType: (type: 'patient' | 'professional' | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  userType: null,
  setUserType: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<'patient' | 'professional' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token) as { user_type: 'patient' | 'professional' };
        setUserType(decoded.user_type);
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserType(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userType, setUserType }}>
      {children}
    </AuthContext.Provider>
  );
}; 