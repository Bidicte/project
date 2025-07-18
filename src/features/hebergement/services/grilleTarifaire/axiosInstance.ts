import axios from "axios"
import { authService } from "../authService" // adapte le chemin si besoin

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GRILLE_TARIFAIRE,
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour ajouter le token dans chaque requête
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Intercepteur pour gérer les erreurs globales (ex: 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
