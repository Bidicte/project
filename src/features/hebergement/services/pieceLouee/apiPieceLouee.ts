/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse, RoomType, Room, Tarif, RoomState } from "../../types/pieceLouee/room"
import { authService } from "../authService"

class ApiService {
  private baseUrl = import.meta.env.VITE_API_PIECE_LOUEE

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const token = authService.getToken()

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (response.status === 401) {
        console.warn("Token expiré ou invalide, déconnexion.")
        authService.logout()
        throw new Error("Session expirée. Veuillez vous reconnecter.")
      }

      if (response.status === 403) {
        throw new Error("Accès refusé. Vous n'avez pas les permissions nécessaires.")
      }

      // Vérifier si la réponse contient du JSON
      let responseData = null
      const contentType = response.headers.get("content-type")
      
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text()
        if (text.trim()) {
          responseData = JSON.parse(text)
        }
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || `Erreur HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      return {
        success: true,
        data: responseData,
        message: "Succès",
      }
    } catch (err) {
      console.error("❌ Requête API échouée :", err)

      if (err instanceof TypeError && err.message.includes("fetch") && token) {
        try {
          await authService.refreshToken()
          return this.request<T>(endpoint, options)
        } catch (refreshError) {
          console.error("Échec du rafraîchissement du token :", refreshError)
        }
      }

      throw err
    }
  }

  // ==========================================
  // TARIFS
  // ==========================================
  async getTarifs(): Promise<ApiResponse<Tarif[]>> {
    return this.request<Tarif[]>("/grilletarifaire/all", { method: "GET" })
  }

  // ==========================================
  // TYPES DE PIÈCES
  // ==========================================
  async getRoomTypes(): Promise<ApiResponse<RoomType[]>> {
    return this.request<RoomType[]>("/typepiece/all", { method: "GET" })
  }

  async createRoomType(roomType: Omit<RoomType, "typepieceid">): Promise<ApiResponse<RoomType>> {
    return this.request<RoomType>("/typepiece/add", {
      method: "POST",
      body: JSON.stringify(roomType),
    })
  }

  async updateRoomType(
    typepieceid: string,
    roomType: Partial<Omit<RoomType, "typepieceid">>,
  ): Promise<ApiResponse<RoomType>> {
    return this.request<RoomType>(`/typepiece/update/${typepieceid}`, {
      method: "PUT",
      body: JSON.stringify(roomType),
    })
  }

  async deleteRoomType(typepieceid: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/typepiece/delete/${typepieceid}`, {
      method: "DELETE",
    })
  }
  // ==========================================
  // PIÈCES
  // ==========================================
  async getRooms(typepieceid: string): Promise<ApiResponse<Room[]>> {
    const endpoint = `/piece/all-by-type/${typepieceid}`
    return this.request<Room[]>(endpoint, {
      method: "GET",
    })
  }

  async getAllRooms(): Promise<ApiResponse<Room[]>> {
    return this.request<Room[]>("/piece/all", {
      method: "GET",
    })
  }

  async createRoom(room: Omit<Room, "pieceid">): Promise<ApiResponse<Room>> {
    
      console.log(JSON.stringify(room))
    return this.request<Room>("/piece/add", {
      method: "POST",
      body: JSON.stringify(room),
    })
  }

  async updateRoom(pieceid: string, room: Partial<Room>): Promise<ApiResponse<Room>> {
    return this.request<Room>(`/piece/update/${pieceid}`, {
      method: "PUT",
      body: JSON.stringify(room),
    })
  }

  async deleteRoom(pieceid: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/piece/delete/${pieceid}`, {
      method: "DELETE",
    })
  }
  // ==========================================
  // PIÈCES
  // ==========================================
  async getAllRoomState(pieceid: string): Promise<ApiResponse<RoomState[]>> {
    const endpoint = `/etatpiece/allbypiece/${pieceid}`
    return this.request<RoomState[]>(endpoint, {
      method: "GET",
    })
  }

  async getRoomStates(pieceid: string): Promise<ApiResponse<RoomState[]>> {
  const endpoint = `/etatpiece/allbypiece?id=${pieceid}`
  return this.request<RoomState[]>(endpoint, { method: "GET" })
}

}

export const apiService = new ApiService()
