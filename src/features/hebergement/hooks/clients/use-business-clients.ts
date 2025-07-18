/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react"
import { apiService } from "../../services/apiClient"
import type { BusinessClient } from "../../types/client"

export function useBusinessClients() {
  const [clients, setClients] = useState<BusinessClient[]>([])
  const [filteredClients, setFilteredClients] = useState<BusinessClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getBusinessClients()
      setClients(data)
      setFilteredClients(data)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erreur lors du chargement des clients")
    } finally {
      setLoading(false)
    }
  }, [])

  const createClient = useCallback(async (client: Omit<BusinessClient, "idcltbusiness">) => {
    try {
      const newClient = await apiService.createBusinessClient(client)
      setClients((prev) => [...prev, newClient])
      setFilteredClients((prev) => [...prev, newClient])
      return newClient
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Erreur lors de la création")
    }
  }, [])

  const updateClient = useCallback(async (id: string, client: Partial<BusinessClient>) => {
    try {
      const updatedClient = await apiService.updateBusinessClient(id, client)
      setClients((prev) => prev.map((c) => (c.idcltbusiness === id ? updatedClient : c)))
      setFilteredClients((prev) => prev.map((c) => (c.idcltbusiness === id ? updatedClient : c)))
      return updatedClient
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Erreur lors de la modification")
    }
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    try {
      await apiService.deleteBusinessClient(id)
      setClients((prev) => prev.filter((c) => c.idcltbusiness !== id))
      setFilteredClients((prev) => prev.filter((c) => c.idcltbusiness !== id))
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
            client.raisoncltbusiness.toLowerCase().includes(query.toLowerCase()) ||
            client.emailcltbusiness.toLowerCase().includes(query.toLowerCase()) ||
            client.telcltbusiness.includes(query) ||
            client.villecltbusiness.toLowerCase().includes(query.toLowerCase()) ||
            client.payscltbusiness.toLowerCase().includes(query.toLowerCase()) ||
            client.numfisccltbusiness.includes(query),
        )
        setFilteredClients(localResults)
      } catch (err: any) {
        console.error("Erreur lors de la recherche:", err)
        // En cas d'erreur, utiliser la recherche locale
        const localResults = clients.filter(
          (client) =>
            client.raisoncltbusiness.toLowerCase().includes(query.toLowerCase()) ||
            client.emailcltbusiness.toLowerCase().includes(query.toLowerCase()),
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
