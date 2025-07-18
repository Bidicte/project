/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react"
import { apiService } from "../../services/apiClient"
import type { RegularClient } from "../../types/client"

export function useRegularClients() {
  const [clients, setClients] = useState<RegularClient[]>([])
  const [filteredClients, setFilteredClients] = useState<RegularClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getRegularClients()
      setClients(data)
      setFilteredClients(data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erreur lors du chargement des clients")
    } finally {
      setLoading(false)
    }
  }, [])

  const createClient = useCallback(async (client: Omit<RegularClient, "idcltreg">) => {
    try {
      const newClient = await apiService.createRegularClient(client)
      setClients((prev) => [...prev, newClient])
      setFilteredClients((prev) => [...prev, newClient])
      return newClient
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Erreur lors de la création")
    }
  }, [])

  const updateClient = useCallback(async (id: string, client: Partial<RegularClient>) => {
    try {
      const updatedClient = await apiService.updateRegularClient(id, client)
      setClients((prev) => prev.map((c) => (c.idcltreg === id ? updatedClient : c)))
      setFilteredClients((prev) => prev.map((c) => (c.idcltreg === id ? updatedClient : c)))
      return updatedClient
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Erreur lors de la modification")
    }
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    try {
      await apiService.deleteRegularClient(id)
      setClients((prev) => prev.filter((c) => c.idcltreg !== id))
      setFilteredClients((prev) => prev.filter((c) => c.idcltreg !== id))
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Erreur lors de la suppression")
    }
  }, [])

  const searchClients = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setFilteredClients(clients)
        return
      }

      try {
        // Recherche locale d'abord
        const localResults = clients.filter(
          (client) =>
            client.nomcltreg.toLowerCase().includes(query.toLowerCase()) ||
            client.prenomcltreg.toLowerCase().includes(query.toLowerCase()) ||
            client.emailcltreg.toLowerCase().includes(query.toLowerCase()) ||
            client.telcltreg.includes(query) ||
            client.villecltreg.toLowerCase().includes(query.toLowerCase()) ||
            client.payscltreg.toLowerCase().includes(query.toLowerCase()),
        )
        setFilteredClients(localResults)
      } catch (err: any) {
        console.error("Erreur lors de la recherche:", err)
        // En cas d'erreur, utiliser la recherche locale
        const localResults = clients.filter(
          (client) =>
            client.nomcltreg.toLowerCase().includes(query.toLowerCase()) ||
            client.prenomcltreg.toLowerCase().includes(query.toLowerCase()) ||
            client.emailcltreg.toLowerCase().includes(query.toLowerCase()),
        )
        setFilteredClients(localResults)
      }
    },
    [clients],
  )

  useEffect(() => {
    loadClients()
  }, [loadClients])

  return {
    clients: filteredClients,
    loading,
    error,
    total: filteredClients.length,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    refresh: loadClients,
  }
}
