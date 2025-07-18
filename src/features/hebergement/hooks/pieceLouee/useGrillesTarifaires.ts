import { useState, useEffect } from "react"
import type { GrilleTarifaire } from "../../types/pieceLouee/room"
import { apiService } from "../../services/pieceLouee/apiPieceLouee"


export function useGrillesTarifaires() {
  const [grillesTarifaires, setGrillesTarifaires] = useState<GrilleTarifaire[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGrillesTarifaires = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getGrillesTarifaires()
      if (response.success) {
        setGrillesTarifaires(response.data)
      } else {
        setError(response.message || "Erreur lors du chargement des grilles tarifaires")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion au serveur"
      setError(errorMessage)
      console.error("Error fetching grilles tarifaires:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrillesTarifaires()
  }, [])

  return {
    grillesTarifaires,
    loading,
    error,
    refetch: fetchGrillesTarifaires,
  }
}
