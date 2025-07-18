import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        setIsLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        clearAuth();
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setUser(JSON.parse(savedUser));
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
        throw new Error(errorData.message || 'Connexion échouée');
      }

      const result = await response.json();
      if (!result.accessToken || !result.user) {
        throw new Error('Réponse API invalide');
      }

      localStorage.setItem('auth_token', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      setUser(result.user);

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion inconnue';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {}); // Ignore les erreurs
      }
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
