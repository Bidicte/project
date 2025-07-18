import { useState, useEffect } from "react"
import type { RoomType, RoomTypeWithTarif } from "../../types/pieceLouee/room"
import { apiService } from "../../services/pieceLouee/apiPieceLouee"
import type { Tarif } from "../../types/grilleTarifaire/tarif"


export function useRoomTypes() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [roomTypesWithTarifs, setRoomTypesWithTarifs] = useState<RoomTypeWithTarif[]>([])
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  try {
    setLoading(true)
    setError(null)

    const [roomTypesResponse, tarifsResponse] = await Promise.all([
      apiService.getRoomTypes(),
      apiService.getTarifs(),
    ])

    if (!roomTypesResponse?.data || !tarifsResponse?.data) {
      throw new Error("Réponse du serveur invalide : données manquantes")
    }

    setRoomTypes(roomTypesResponse.data)
    setTarifs(tarifsResponse.data)

    const enrichedRoomTypes = roomTypesResponse.data.map((roomType) => ({
      ...roomType,
      tarif: tarifsResponse.data.find((tarif) => tarif.tarifid === roomType.tarifid),
    }))
    setRoomTypesWithTarifs(enrichedRoomTypes)

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur de connexion au serveur"
    setError(errorMessage)
    console.error("❌ Erreur lors du chargement des données :", err)
  } finally {
    setLoading(false)
  }
}




  const createRoomType = async (roomType: Omit<RoomType, "typepieceid">) => {
    try {
      const response = await apiService.createRoomType(roomType)
      if (response.success) {
        const newRoomType = response.data
        const tarif = tarifs.find((t) => t.tarifid === newRoomType.tarifid)

        setRoomTypes((prev) => [...prev, newRoomType])
        setRoomTypesWithTarifs((prev) => [...prev, { ...newRoomType, tarif }])
        return newRoomType
      } else {
        throw new Error(response.message || "Erreur lors de la création")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création"
      console.error("Error creating room type:", err)
      throw new Error(errorMessage)
    }
  }

  const updateRoomType = async (typepieceid: string, roomType: Partial<Omit<RoomType, "typepieceid">>) => {
    try {
      const response = await apiService.updateRoomType(typepieceid, roomType)
      if (response.success) {
        const updatedRoomType = response.data
        const tarif = tarifs.find((t) => t.tarifid === updatedRoomType.tarifid)

        setRoomTypes((prev) => prev.map((type) => (type.typepieceid === typepieceid ? updatedRoomType : type)))
        setRoomTypesWithTarifs((prev) =>
          prev.map((type) => (type.typepieceid === typepieceid ? { ...updatedRoomType, tarif } : type)),
        )
        return updatedRoomType
      } else {
        throw new Error(response.message || "Erreur lors de la modification")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la modification"
      console.error("Error updating room type:", err)
      throw new Error(errorMessage)
    }
  }

  const deleteRoomType = async (typepieceid: string) => {
    try {
      const response = await apiService.deleteRoomType(typepieceid)
      if (response.success) {
        setRoomTypes((prev) => prev.filter((type) => type.typepieceid !== typepieceid))
        setRoomTypesWithTarifs((prev) => prev.filter((type) => type.typepieceid !== typepieceid))
      } else {
        throw new Error(response.message || "Erreur lors de la suppression")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression"
      console.error("Error deleting room type:", err)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    roomTypes,
    roomTypesWithTarifs,
    tarifs,
    loading,
    error,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    refetch: fetchData,
  }
}
