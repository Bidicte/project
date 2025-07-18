import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/apiClient';
import type { RegularClient, BusinessClient } from '../../types/client';

interface UseClientsResult {
  regularClients: RegularClient[];
  businessClients: BusinessClient[];
  loading: boolean;
  error: string | null;
  fetchClients: (type: 'Régulier' | 'Business') => Promise<void>;
  searchClients: (searchTerm: string, type: 'Régulier' | 'Business') => void;
}

export const useClients = (): UseClientsResult => {
  const [regularClients, setRegularClients] = useState<RegularClient[]>([]);
  const [businessClients, setBusinessClients] = useState<BusinessClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (type: 'Régulier' | 'Business') => {
    try {
      setLoading(true);
      setError(null);

      if (type === 'Régulier') {
        const response = await apiService.getRegularClients();
        setRegularClients(response);
      } else {
        const response = await apiService.getBusinessClients();
        setBusinessClients(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des clients';
      setError(errorMessage);
      console.error('Erreur lors du chargement des clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchClients = useCallback((searchTerm: string, type: 'Régulier' | 'Business') => {
    if (type === 'Régulier') {
      if (searchTerm.trim() === '') {
        // Si pas de terme de recherche, on recharge tous les clients
        fetchClients('Régulier');
      } else {
        // Filtrage local pour la recherche
        setRegularClients(prev => 
          prev.filter(client => 
            client.nomcltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.prenomcltreg.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.emailcltreg.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    } else {
      if (searchTerm.trim() === '') {
        fetchClients('Business');
      } else {
        setBusinessClients(prev => 
          prev.filter(client => 
            client.raisoncltbusiness.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.emailcltbusiness.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    }
  }, [fetchClients]);

  return {
    regularClients,
    businessClients,
    loading,
    error,
    fetchClients,
    searchClients
  };
};

export default useClients;