// ===== src/utils/auth.ts (Mise à jour) =====
// ===== src/utils/auth.ts (Mise à jour) =====
import type { LoginCredentials, AuthResponse, User } from '../types/auth';

// Simulation d'un appel API - Remplacez par votre vraie API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validation des credentials avec username
    const validUsers = [
      { 
        username: 'admin', 
        password: 'admin123',
        name: 'Administrateur',
        email: 'admin@tailadmin.com',
        role: 'admin'
      },
      { 
        username: 'musharof', 
        password: 'password123',
        name: 'Musharof Chowdhury',
        email: 'musharof@tailadmin.com',
        role: 'manager'
      },
      { 
        username: 'user', 
        password: 'user123',
        name: 'Utilisateur Standard',
        email: 'user@tailadmin.com',
        role: 'user'
      },
      { 
        username: 'demo', 
        password: 'demo123',
        name: 'Compte Démo',
        email: 'demo@tailadmin.com',
        role: 'user'
      }
    ];

    const validUser = validUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!validUser) {
      throw new Error('Nom d\'utilisateur ou mot de passe invalide');
    }

    // Générer des tokens simulés (utilisez JWT en production)
    const token = btoa(JSON.stringify({ 
      username: credentials.username, 
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24h
    }));
    
    const refreshToken = btoa(JSON.stringify({ 
      username: credentials.username, 
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 jours
    }));

    const user: User = {
      id: btoa(credentials.username),
      username: validUser.username,
      name: validUser.name,
      email: validUser.email,
      role: validUser.role,
      permissions: validUser.role === 'admin' 
        ? ['read', 'write', 'delete', 'admin'] 
        : validUser.role === 'manager'
        ? ['read', 'write', 'manage']
        : ['read', 'write']
    };

    return {
      user,
      token,
      refreshToken,
      expiresIn: 24 * 60 * 60 // 24h en secondes
    };
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const decoded = JSON.parse(atob(refreshToken));
      if (decoded.exp < Date.now()) {
        throw new Error('Refresh token expired');
      }
      
      // Ici vous feriez un appel à votre API pour rafraîchir le token
      return authAPI.login({ username: decoded.username, password: 'dummy' });
    } catch {
      throw new Error('Invalid refresh token');
    }
  },

  logout: async (): Promise<void> => {
    // Ici vous pourriez invalider le token côté serveur
    return Promise.resolve();
  }
};

// Utilitaires de token (inchangés)
export const tokenUtils = {
  setTokens: (token: string, refreshToken: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  removeTokens: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },

  isTokenValid: (token: string): boolean => {
    try {
      const decoded = JSON.parse(atob(token));
      return decoded.exp > Date.now();
    } catch {
      return false;
    }
  }
};