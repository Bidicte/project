import { useState, useEffect, useCallback } from 'react';
import { reservationService } from '../../services/reservationService';
import { mockReservations } from '../../data/mockData';
import type {
  Reservation,
  ReservationFormData,
  ReservationFilter,
  PaginatedResponse,
  ApiResponse,
  StatistiquesReservation,
  TypePieceDisponible,
  PieceDisponible,
  SimulationReservation,
  BonReduction,
  GrilleTarifaire,
  DisponibiliteFilter
} from '../../types/reservation';

interface UseReservationsResult {
  // Données
  reservations: Reservation[];
  currentReservation: Reservation | null;
  statistiques: StatistiquesReservation | null;
  
  // États de chargement
  loading: boolean;
  loadingReservation: boolean;
  loadingStatistiques: boolean;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Erreurs
  error: string | null;
  
  // Actions CRUD
  fetchReservations: (filter?: ReservationFilter) => Promise<void>;
  fetchReservationById: (id: string) => Promise<void>;
  createReservation: (data: ReservationFormData) => Promise<Reservation>;
  updateReservation: (id: string, data: Partial<ReservationFormData>) => Promise<Reservation>;
  deleteReservation: (id: string) => Promise<void>;
  confirmReservation: (id: string) => Promise<Reservation>;
  cancelReservation: (id: string, motif?: string) => Promise<Reservation>;
  
  // Actions statistiques
  fetchStatistiques: (dateDebut?: string, dateFin?: string) => Promise<void>;
  
  // Actions de recherche et filtres
  searchReservations: (searchTerm: string) => void;
  filterReservations: (filter: ReservationFilter) => void;
  
  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Utilitaires
  refreshReservations: () => Promise<void>;
  clearError: () => void;
  clearCurrentReservation: () => void;
}

export const useReservations = (initialFilter?: ReservationFilter): UseReservationsResult => {
  // États pour les données
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null);
  const [statistiques, setStatistiques] = useState<StatistiquesReservation | null>(null);
  
  // États de chargement
  const [loading, setLoading] = useState(false);
  const [loadingReservation, setLoadingReservation] = useState(false);
  const [loadingStatistiques, setLoadingStatistiques] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // Filtre et recherche
  const [currentFilter, setCurrentFilter] = useState<ReservationFilter>(initialFilter || {});
  
  // Erreurs
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour récupérer les réservations
  const fetchReservations = useCallback(async (filter?: ReservationFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterToUse = filter || currentFilter;
      const response = await reservationService.getReservations(filterToUse);
      
      setReservations(response.data);
      setPagination(response.pagination);
      
      if (filter) {
        setCurrentFilter(filter);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réservations';
      setError(errorMessage);
      console.error('Erreur lors du chargement des réservations:', err);
      // Fallback mock
      setReservations(mockReservations);
      setPagination({ page: 1, limit: mockReservations.length, total: mockReservations.length, pages: 1 });
    } finally {
      setLoading(false);
    }
  }, [currentFilter]);
  
  // Fonction pour récupérer une réservation par ID
  const fetchReservationById = useCallback(async (id: string) => {
    try {
      setLoadingReservation(true);
      setError(null);
      
      const response = await reservationService.getReservationById(id);
      setCurrentReservation(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la réservation';
      setError(errorMessage);
      console.error('Erreur lors du chargement de la réservation:', err);
      // Fallback mock
      const found = mockReservations.find(r => r.id === id);
      if (found) setCurrentReservation(found);
    } finally {
      setLoadingReservation(false);
    }
  }, []);
  
  // Fonction pour créer une réservation
  const createReservation = useCallback(async (data: ReservationFormData): Promise<Reservation> => {
    try {
      setError(null);
      const response = await reservationService.createReservation(data);
      
      // Actualiser la liste des réservations
      await fetchReservations();
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la réservation';
      setError(errorMessage);
      console.error('Erreur lors de la création de la réservation:', err);
      throw err;
    }
  }, [fetchReservations]);
  
  // Fonction pour mettre à jour une réservation
  const updateReservation = useCallback(async (id: string, data: Partial<ReservationFormData>): Promise<Reservation> => {
    try {
      setError(null);
      const response = await reservationService.updateReservation(id, data);
      
      // Mettre à jour la réservation dans la liste
      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? response.data : reservation
      ));
      
      // Mettre à jour la réservation courante si c'est la même
      if (currentReservation?.id === id) {
        setCurrentReservation(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la réservation';
      setError(errorMessage);
      console.error('Erreur lors de la mise à jour de la réservation:', err);
      throw err;
    }
  }, [currentReservation, fetchReservations]);
  
  // Fonction pour supprimer une réservation
  const deleteReservation = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await reservationService.deleteReservation(id);
      
      // Retirer la réservation de la liste
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      
      // Effacer la réservation courante si c'est la même
      if (currentReservation?.id === id) {
        setCurrentReservation(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la réservation';
      setError(errorMessage);
      console.error('Erreur lors de la suppression de la réservation:', err);
      throw err;
    }
  }, [currentReservation]);
  
  // Fonction pour confirmer une réservation
  const confirmReservation = useCallback(async (id: string): Promise<Reservation> => {
    try {
      setError(null);
      const response = await reservationService.confirmReservation(id);
      
      // Mettre à jour la réservation dans la liste
      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? response.data : reservation
      ));
      
      // Mettre à jour la réservation courante si c'est la même
      if (currentReservation?.id === id) {
        setCurrentReservation(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la confirmation de la réservation';
      setError(errorMessage);
      console.error('Erreur lors de la confirmation de la réservation:', err);
      throw err;
    }
  }, [currentReservation]);
  
  // Fonction pour annuler une réservation
  const cancelReservation = useCallback(async (id: string, motif?: string): Promise<Reservation> => {
    try {
      setError(null);
      const response = await reservationService.cancelReservation(id, motif);
      
      // Mettre à jour la réservation dans la liste
      setReservations(prev => prev.map(reservation => 
        reservation.id === id ? response.data : reservation
      ));
      
      // Mettre à jour la réservation courante si c'est la même
      if (currentReservation?.id === id) {
        setCurrentReservation(response.data);
      }
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'annulation de la réservation';
      setError(errorMessage);
      console.error('Erreur lors de l\'annulation de la réservation:', err);
      throw err;
    }
  }, [currentReservation]);
  
  // Fonction pour récupérer les statistiques
  const fetchStatistiques = useCallback(async (dateDebut?: string, dateFin?: string) => {
    try {
      setLoadingStatistiques(true);
      setError(null);
      
      const response = await reservationService.getStatistiques(dateDebut, dateFin);
      setStatistiques(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      console.error('Erreur lors du chargement des statistiques:', err);
      // Fallback mock (statistiques simples)
      setStatistiques({
        totalReservations: mockReservations.length,
        reservationsConfirmees: mockReservations.filter(r => r.statut === 'Confirmée').length,
        reservationsAnnulees: mockReservations.filter(r => r.statut === 'Annulée').length,
        tauxOccupation: 50,
        chiffreAffaires: mockReservations.reduce((sum, r) => sum + (r.montantTotal || 0), 0),
        sejoursMoyens: 1,
        clientsReguliers: 1,
        clientsBusiness: 0,
        clientsOccasionnels: 0
      });
    } finally {
      setLoadingStatistiques(false);
    }
  }, []);
  
  // Fonction de recherche
  const searchReservations = useCallback((searchTerm: string) => {
    const newFilter = { ...currentFilter, searchTerm };
    fetchReservations(newFilter);
  }, [currentFilter, fetchReservations]);
  
  // Fonction de filtrage
  const filterReservations = useCallback((filter: ReservationFilter) => {
    fetchReservations(filter);
  }, [fetchReservations]);
  
  // Fonction pour changer de page
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchReservations({ ...currentFilter, page });
  }, [currentFilter, fetchReservations]);
  
  // Fonction pour changer la limite
  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    fetchReservations({ ...currentFilter, limit, page: 1 });
  }, [currentFilter, fetchReservations]);
  
  // Fonction pour actualiser les réservations
  const refreshReservations = useCallback(async () => {
    await fetchReservations();
  }, [fetchReservations]);
  
  // Fonction pour effacer l'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Fonction pour effacer la réservation courante
  const clearCurrentReservation = useCallback(() => {
    setCurrentReservation(null);
  }, []);
  
  // Chargement initial
  useEffect(() => {
    fetchReservations();
  }, []);
  
  return {
    // Données
    reservations,
    currentReservation,
    statistiques,
    
    // États de chargement
    loading,
    loadingReservation,
    loadingStatistiques,
    
    // Pagination
    pagination,
    
    // Erreurs
    error,
    
    // Actions CRUD
    fetchReservations,
    fetchReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    confirmReservation,
    cancelReservation,
    
    // Actions statistiques
    fetchStatistiques,
    
    // Actions de recherche et filtres
    searchReservations,
    filterReservations,
    
    // Pagination
    setPage,
    setLimit,
    
    // Utilitaires
    refreshReservations,
    clearError,
    clearCurrentReservation
  };
};

// Hook spécialisé pour les disponibilités
export const useDisponibilites = () => {
  const [typesPiecesDisponibles, setTypesPiecesDisponibles] = useState<TypePieceDisponible[]>([]);
  const [piecesDisponibles, setPiecesDisponibles] = useState<PieceDisponible[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTypesPiecesDisponibles = useCallback(async (dateDebut: string, dateFin: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationService.getTypePiecesDisponibles(dateDebut, dateFin);
      setTypesPiecesDisponibles(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des types de pièces disponibles';
      setError(errorMessage);
      console.error('Erreur lors du chargement des types de pièces disponibles:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const fetchPiecesDisponibles = useCallback(async (filter: DisponibiliteFilter) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationService.getPiecesDisponibles(filter);
      setPiecesDisponibles(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des pièces disponibles';
      setError(errorMessage);
      console.error('Erreur lors du chargement des pièces disponibles:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const verifierDisponibilite = useCallback(async (pieceIds: string[], dateDebut: string, dateFin: string) => {
    try {
      setError(null);
      const response = await reservationService.verifierDisponibilite(pieceIds, dateDebut, dateFin);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification de disponibilité';
      setError(errorMessage);
      console.error('Erreur lors de la vérification de disponibilité:', err);
      throw err;
    }
  }, []);
  
  return {
    typesPiecesDisponibles,
    piecesDisponibles,
    loading,
    error,
    fetchTypesPiecesDisponibles,
    fetchPiecesDisponibles,
    verifierDisponibilite
  };
};

// Hook spécialisé pour les simulations tarifaires
export const useSimulationTarif = () => {
  const [simulation, setSimulation] = useState<SimulationReservation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const simulerTarif = useCallback(async (data: {
    sejours: Array<{
      dateArrivee: string;
      dateDepart: string;
      typePieceId: string;
      piecesIds: string[];
      grilleTarifaireId?: string;
    }>;
    bonReductionId?: string;
    typeClient?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationService.simulerTarif(data);
      setSimulation(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la simulation de tarif';
      setError(errorMessage);
      console.error('Erreur lors de la simulation de tarif:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clearSimulation = useCallback(() => {
    setSimulation(null);
    setError(null);
  }, []);
  
  return {
    simulation,
    loading,
    error,
    simulerTarif,
    clearSimulation
  };
};

// Hook spécialisé pour les bons de réduction
export const useBonsReduction = () => {
  const [bonsReduction, setBonsReduction] = useState<BonReduction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchBonsReduction = useCallback(async (actif: boolean = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reservationService.getBonsReduction(actif);
      setBonsReduction(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des bons de réduction';
      setError(errorMessage);
      console.error('Erreur lors du chargement des bons de réduction:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const verifierBonReduction = useCallback(async (code: string, montantTotal: number) => {
    try {
      setError(null);
      const response = await reservationService.verifierBonReduction(code, montantTotal);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du bon de réduction';
      setError(errorMessage);
      console.error('Erreur lors de la vérification du bon de réduction:', err);
      throw err;
    }
  }, []);
  
  return {
    bonsReduction,
    loading,
    error,
    fetchBonsReduction,
    verifierBonReduction
  };
};

export default useReservations;