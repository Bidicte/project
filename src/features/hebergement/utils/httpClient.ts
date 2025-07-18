/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/httpClient.ts
import { authService } from "../services/authService";

class HttpClient {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = authService.getToken();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    let response = await fetch(`${this.baseURL}${url}`, config);

    // Tentative de refresh token si 401
    if (response.status === 401 && token) {
      try {
        const newToken = await authService.refreshToken();
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(`${this.baseURL}${url}`, config);
      } catch (refreshError) {
        // Rediriger vers login si refresh échoue
        authService.logout();
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
    }

    return response;
  }

  async get(url: string): Promise<any> {
    const response = await this.request(url);
    return response.json();
  }

  async post(url: string, data: any): Promise<any> {
    const response = await this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async put(url: string, data: any): Promise<any> {
    const response = await this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(url: string): Promise<any> {
    const response = await this.request(url, {
      method: "DELETE",
    });
    return response.json();
  }
}

// Utiliser la variable d'environnement
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("🚨 VITE_API_URL non défini dans .env");
}

export const httpClient = new HttpClient(
  API_URL || "https://authpms.cloudpaietest.net/v1/api"
);
