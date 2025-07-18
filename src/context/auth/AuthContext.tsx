/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-useless-catch */
/* eslint-disable react-refresh/only-export-components */
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthContextType, Client } from '../../types/auth/auth';
import { authService } from '../../services/auth/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  const initializeAuth = async () => {
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("auth_token");
      if (token) {
        const isValid = await checkTokenValidity();
        if (isValid) {
          const userData = JSON.parse(sessionStorage.getItem("user_data") || '{}');
          const clientData = JSON.parse(sessionStorage.getItem("client_data") || '{}');
          setUser(userData);
          setClient(clientData);
        } else {
          authService.logout();
        }
      }
    } catch (error) {
      authService.logout();
    } finally {
      setIsLoading(false); // ✅ ici maintenant c'est correct, à la fin de la promesse
    }
  };

  initializeAuth();
}, []);


  async function checkTokenValidity(): Promise<boolean> {
  const token = sessionStorage.getItem("auth_token")
  if (!token) return false

  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/validate`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  return res.status === 200
}

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      authService.logout();
      setUser(null);
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    await authService.forgotPassword(email);
  };

  const value: AuthContextType = {
    user,
    client,
    login,
    logout,
    forgotPassword,
    isLoading,
    isAuthenticated: !!user,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};