/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User, LoginCredentials, LoginRequest, Client } from '../types/auth';
// Configuration depuis .env
const API_BASE_URL = import.meta.env.VITE_API_URL;

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly CLIENT_KEY = 'client_data';

  private readonly CLIENT = this.getSubdomain() || 'chkci'; // "chkci" par défaut si pas de sous-domaine
  getSubdomain(): string | null {
    const hostname = window.location.hostname; // ex: sousdomaine.mondomaine.com

    const parts = hostname.split('.');

    // Si ton domaine est de type "sousdomaine.domaine.com"
    if (parts.length >= 3) {
      return parts[0]; // retourne le sous-domaine
    }

    // Aucun sous-domaine détecté (ex: localhost ou domaine principal)
    return null; // retourne "chkci" par défaut
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken?: string }> {
    if (!API_BASE_URL) {
      throw new Error('Configuration API manquante');
    }

    const loginUrl = `${API_BASE_URL}/auth/login`;
    
    // Format exact attendu par votre API
    const loginData: LoginRequest = {
      client: this.CLIENT,                    // "chkci" en dur
      username: credentials.username,
      Password: credentials.password     // "Password" avec majuscule
    };
    

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      // Gérer les erreurs HTTP
      if (!response.ok) {
        let errorMessage = 'Erreur de connexion';
        
        try {
          const errorData = await response.json();
          
          
          // Utiliser le message d'erreur de l'API si disponible
          if (errorData.errorMessage) {
            errorMessage = errorData.errorMessage;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // Si pas de JSON, essayer en text
          try {
            const errorText = await response.text();
            
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (e2) {
            //console.error('❌ Impossible de lire les détails de l\'erreur');
          }
        }
        
        // Messages d'erreur selon le code de statut
        switch (response.status) {
          case 400:
            throw new Error('Données de connexion invalides. Vérifiez vos identifiants.');
          case 401:
            throw new Error('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
          case 403:
            throw new Error('Accès refusé. Votre compte pourrait être désactivé.');
          case 404:
            throw new Error('Service d\'authentification non disponible.');
          case 429:
            throw new Error('Trop de tentatives de connexion. Veuillez attendre quelques minutes.');
          case 500:
          case 502:
          case 503:
            throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
          default:
            throw new Error(errorMessage || `Erreur de connexion (${response.status})`);
        }
      }

      const data = await response.json();
      
      // Vérifier le format de votre API
      if (!data.isSuccess) {
        const errorMsg = data.errorMessage || 'Échec de la connexion';
        
        // Messages d'erreur spécifiques selon le contenu
        if (errorMsg.toLowerCase().includes('invalid') || 
            errorMsg.toLowerCase().includes('incorrect') ||
            errorMsg.toLowerCase().includes('wrong')) {
          throw new Error('Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.');
        } else if (errorMsg.toLowerCase().includes('disabled') ||
                   errorMsg.toLowerCase().includes('blocked') ||
                   errorMsg.toLowerCase().includes('suspended')) {
          throw new Error('Votre compte est désactivé. Contactez l\'administrateur.');
        } else {
          throw new Error(errorMsg);
        }
      }

      if (!data.accessToken) {
        throw new Error('Token d\'authentification manquant dans la réponse.');
      }
    //faire appel a l'api /users/userinfo pour récupérer les données utilisateur    
      const userResponse = await fetch(`${API_BASE_URL}/users/userinfo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.accessToken}` // Utiliser le token d'accès
        },
      });
      if (!userResponse.ok) {
        throw new Error('Impossible de récupérer les informations utilisateur.');
      }
      const userData: User = await userResponse.json();

          //faire appel a l'api /users/clientinfo pour récupérer les données du client 
      const clientResponse = await fetch(`${API_BASE_URL}/users/clientinfo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.accessToken}` // Utiliser le token d'accès
        },
      });
      if (!clientResponse.ok) {
        throw new Error('Impossible de récupérer les informations du client.');
      }
      const clientData: Client = await clientResponse.json();    

      // Stockage selon "Se souvenir de moi"
      // const storage = credentials.rememberMe ? localStorage : sessionStorage;
      
      sessionStorage.setItem(this.TOKEN_KEY, data.accessToken);
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      sessionStorage.setItem(this.CLIENT_KEY, JSON.stringify(clientData));
      //alert(data.accessToken);
      
      // Pas de refresh token dans votre API apparemment
      if (data.refreshToken) {
        sessionStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
      }

      return {
        user: userData,
        token: data.accessToken,
        refreshToken: data.refreshToken
      };

    } catch (error) {
      
      // Gestion spécifique des erreurs réseau
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      // Si c'est déjà une erreur avec un message personnalisé, la garder
      if (error instanceof Error) {
        throw error;
      }
      
      // Erreur générique en dernier recours
      throw new Error('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    if (!API_BASE_URL) {
      throw new Error('Configuration API manquante');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          client: this.CLIENT,
          email: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        switch (response.status) {
          case 404:
            throw new Error('Aucun compte associé à cette adresse email.');
          case 429:
            throw new Error('Trop de demandes. Veuillez attendre avant de réessayer.');
          case 500:
          case 502:
          case 503:
            throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
          default:
            throw new Error(errorData?.errorMessage || 'Erreur lors de l\'envoi de l\'email.');
        }
      }

      const data = await response.json();
      if (!data.isSuccess) {
        throw new Error(data.errorMessage || 'Erreur lors de l\'envoi de l\'email.');
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion réseau');
    }
  }

  async refreshToken(): Promise<string> {
    if (!API_BASE_URL) {
      throw new Error('Configuration API manquante');
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Token de rafraîchissement non disponible');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          client: this.CLIENT,
          refreshToken: refreshToken
        }),
      });

      if (!response.ok) {
        this.logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const data = await response.json();
      
      if (!data.isSuccess || !data.accessToken) {
        this.logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      // Mettre à jour le token dans le même storage
      const storage = localStorage.getItem(this.TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(this.TOKEN_KEY, data.accessToken);
      
      return data.accessToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  logout(): void {
    // Nettoyer tous les storages
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        this.logout();
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }
}

export const authService = new AuthService();