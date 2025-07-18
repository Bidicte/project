/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TypeDePiece, Piece, Sejour, ReservationDto } from "../types/calendar"
import { authService } from "./authService"

const API_BASE_URL = import.meta.env.VITE_API_CLIENT_URL

function getAuthHeaders() {
  const token = authService.getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

class CalendarApiService {
  private async fetchWithHandling<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    })

    if (response.status === 401) {
      throw new Error("Session expirée. Veuillez vous reconnecter.")
    }

    if (response.status === 403) {
      throw new Error("Accès refusé. Vous n'avez pas les permissions nécessaires.")
    }

    let data: any = null
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text()
      if (text.trim()) {
        data = JSON.parse(text)
      }
    }

    if (!response.ok) {
      const errorMessage = data?.message || `Erreur HTTP ${response.status}`
      throw new Error(errorMessage)
    }

    return data
  }

  // ================================
  // TYPES DE PIÈCES
  // ================================
  async getTypesDePieces(): Promise<TypeDePiece[]> {
    return this.fetchWithHandling<TypeDePiece[]>("/typepiece/all", { method: "GET" })
  }

  // ================================
  // PIÈCES
  // ================================
  async getAllPieces(): Promise<Piece[]> {
    return this.fetchWithHandling<Piece[]>("/piece/all", { method: "GET" })
  }

  async getPiecesByType(typepieceid: string): Promise<Piece[]> {
    return this.fetchWithHandling<Piece[]>(`/piece/all-by-type/${typepieceid}`, { method: "GET" })
  }

  // ================================
  // SÉJOURS
  // ================================
  async getAllSejours(): Promise<Sejour[]> {
    return this.fetchWithHandling<Sejour[]>("/sejour/all", { method: "GET" })
  }

   async getAllReservations(): Promise<ReservationDto[]> {
    return this.fetchWithHandling<ReservationDto[]>("/reservation/all", { method: "GET" })
  }

  async getSejoursByPiece(pieceId: string): Promise<Sejour[]> {
    return this.fetchWithHandling<Sejour[]>(`/sejour/by-piece/${pieceId}`, { method: "GET" })
  }

  async getSejoursByDateRange(dateDebut: string, dateFin: string): Promise<Sejour[]> {
    return this.fetchWithHandling<Sejour[]>(`/sejour/between-dates?startDate=${dateDebut}&endDate=${dateFin}`, { method: "GET" })
  }
}

export const calendarApiService = new CalendarApiService()
