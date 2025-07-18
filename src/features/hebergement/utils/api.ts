/* eslint-disable @typescript-eslint/no-explicit-any */
// ===== src/utils/api.ts (Version sécurisée) =====
interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const { skipAuth = false, ...fetchOptions } = options;
  const token = localStorage.getItem('token');
  
  // Configuration des headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...fetchOptions.headers,
  };

  // Ajouter le token d'autorisation si nécessaire
  if (!skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Gestion des erreurs d'authentification
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Vérifier si la réponse contient du JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return null;
  } catch (error: any) {
    console.error('API call failed:', { endpoint, error: error.message });
    throw error;
  }
};