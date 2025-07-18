import { useState } from "react"
import type { Room } from "../../types/pieceLouee/room"
import { apiService } from "../../services/pieceLouee/apiPieceLouee"


export function useRooms() {
  const [roomsByType, setRoomsByType] = useState<Record<string, Room[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoomsForType = async (typepieceid: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getRooms(typepieceid)
      if (response.success) {
        setRoomsByType(prev => ({
          ...prev,
          [typepieceid]: response.data || []
        }))
        return response.data || []
      } else {
        setError(response.message || "Erreur lors du chargement des pièces")
        return []
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion au serveur"
      setError(errorMessage)
      console.error("Error fetching rooms:", err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchAllRoomsForTypes = async (typeIds: string[]) => {
    try {
      setLoading(true)
      setError(null)
      
      // Utiliser le nouveau endpoint pour récupérer toutes les pièces
      const response = await apiService.getAllRooms()
      
      if (response.success) {
        const allRooms = response.data || []
        
        // Distribuer les pièces par type
        const newRoomsByType: Record<string, Room[]> = {}
        
        // Initialiser avec des tableaux vides pour tous les types
        typeIds.forEach(typeId => {
          newRoomsByType[typeId] = []
        })
        
        // Distribuer les pièces par type
        allRooms.forEach(room => {
          if (room.typepieceid && newRoomsByType[room.typepieceid]) {
            newRoomsByType[room.typepieceid].push(room)
          }
        })
        
        setRoomsByType(newRoomsByType)
        
        // console.log('=== DEBUG NOUVEAU ENDPOINT ===')
        // console.log('Total pièces récupérées:', allRooms.length)
        // console.log('Distribution par type:')
        // Object.entries(newRoomsByType).forEach(([typeId, rooms]) => {
        //   console.log(`- Type ${typeId}: ${rooms.length} pièces`)
        // })
        // console.log('============================')
        
      } else {
        throw new Error(response.message || "Erreur lors du chargement des pièces")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion au serveur"
      setError(errorMessage)
      console.error("Error fetching all rooms:", err)
    } finally {
      setLoading(false)
    }
  }

  const createRoom = async (room: Omit<Room, "pieceid">) => {
    try {
      const response = await apiService.createRoom(room)
      if (response.success) {
        // Mettre à jour les pièces du type concerné
        setRoomsByType(prev => ({
          ...prev,
          [room.typepieceid]: [...(prev[room.typepieceid] || []), response.data]
        }))
        return response.data
      } else {
        throw new Error(response.message || "Erreur lors de la création")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création"
      console.error("Error creating room:", err)
      throw new Error(errorMessage)
    }
  }

  const updateRoom = async (pieceid: string, room: Partial<Room>) => {
    try {
      const response = await apiService.updateRoom(pieceid, room)
      if (response.success) {
        // Mettre à jour les pièces du type concerné
        const typeId = response.data.typepieceid
        setRoomsByType(prev => ({
          ...prev,
          [typeId]: (prev[typeId] || []).map((r) => (r.pieceid === pieceid ? response.data : r))
        }))
        return response.data
      } else {
        throw new Error(response.message || "Erreur lors de la modification")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification"
      console.error("Error updating room:", err)
      throw new Error(errorMessage)
    }
  }

  const deleteRoom = async (pieceid: string) => {
    try {
      const response = await apiService.deleteRoom(pieceid)
      if (response.success) {
        // Supprimer la pièce de tous les types
        setRoomsByType(prev => {
          const newRoomsByType = { ...prev }
          Object.keys(newRoomsByType).forEach(typeId => {
            newRoomsByType[typeId] = newRoomsByType[typeId].filter(r => r.pieceid !== pieceid)
          })
          return newRoomsByType
        })
      } else {
        throw new Error(response.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression"
      console.error("Error deleting room:", err)
      throw new Error(errorMessage)
    }
  }
  
  const getRoomsForType = (typepieceid: string) => {
    return roomsByType[typepieceid] || []
  }

  // Calculer toutes les pièces pour les statistiques
  const allRooms = Object.values(roomsByType).flat()

  return {
    rooms: allRooms,
    roomsByType,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchRoomsForType,
    fetchAllRoomsForTypes,
    getRoomsForType,
  }
}
