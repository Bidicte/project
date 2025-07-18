import axios, { type AxiosResponse } from "axios"
import type { RegularClient, BusinessClient } from "../types/client"
import { authService } from "./authService"

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_CLIENT_URL;

// Configuration d'axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token automatiquement
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

class ApiService {
  // Clients réguliers
  async getRegularClients(): Promise<RegularClient[]> {
    const response: AxiosResponse<RegularClient[]> = await apiClient.get("/clients-reguliers/all")
    return response.data
  }

  async createRegularClient(client: Omit<RegularClient, "idcltreg">): Promise<RegularClient> {
    const response: AxiosResponse<RegularClient> = await apiClient.post("/clients-reguliers/add", client)
    return response.data
  }

  async updateRegularClient(id: string, client: Partial<RegularClient>): Promise<RegularClient> {
    const response: AxiosResponse<RegularClient> = await apiClient.put(`/clients-reguliers/update/${id}`, client)
    return response.data
  }

  async deleteRegularClient(id: string): Promise<void> {
    await apiClient.delete(`/clients-reguliers/delete/${id}`)
  }

  // Clients business
  async getBusinessClients(): Promise<BusinessClient[]> {
    const response: AxiosResponse<BusinessClient[]> = await apiClient.get("/clients-business/all")
    return response.data
  }

  async createBusinessClient(client: Omit<BusinessClient, "idcltbusiness">): Promise<BusinessClient> {
    const response: AxiosResponse<BusinessClient> = await apiClient.post("/clients-business/add", client)
    return response.data
  }

  async updateBusinessClient(id: string, client: Partial<BusinessClient>): Promise<BusinessClient> {
    const response: AxiosResponse<BusinessClient> = await apiClient.put(`/clients-business/update/${id}`, client)
    return response.data
  }

  async deleteBusinessClient(id: string): Promise<void> {
    await apiClient.delete(`/clients-business/delete/${id}`)
  }

  // Recherche
  async searchRegularClients(query: string): Promise<RegularClient[]> {
    const response: AxiosResponse<RegularClient[]> = await apiClient.get(
      `/clients-reguliers/search?q=${encodeURIComponent(query)}`,
    )
    return response.data
  }

  async searchBusinessClients(query: string): Promise<BusinessClient[]> {
    const response: AxiosResponse<BusinessClient[]> = await apiClient.get(
      `/clients-business/search?q=${encodeURIComponent(query)}`,
    )
    return response.data
  }
}

export const apiService = new ApiService()
