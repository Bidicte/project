import { useState, useEffect } from "react"
import type { Tarif } from "../../types/pieceLouee/room"
import { apiService } from "../../services/pieceLouee/apiPieceLouee"

export function useTarifs() {
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTarifs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getTarifs()
      if (response.success) {
        setTarifs(response.data)
      } else {
        setError(response.message || "Erreur lors du chargement des tarifs")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion au serveur"
      setError(errorMessage)
      console.error("Error fetching tarifs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTarifs()
  }, [])

  return {
    tarifs,
    loading,
    error,
    refetch: fetchTarifs,
  }
}
