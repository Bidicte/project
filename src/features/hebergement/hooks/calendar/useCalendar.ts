import { useState, useEffect, useCallback } from 'react';
import { CalendarService, ChambresService, ReservationsService } from '../../services/calendarService';
import { Chambre, CalendarReservation, TypeChambre } from '../../data/mockData';

// Interface pour l'état du calendrier
interface CalendarState {
  chambres: Chambre[];
  reservations: CalendarReservation[];
  typesChambres: TypeChambre[];
  loading: boolean;
  error: string | null;
}

// Interface pour les filtres du calendrier
interface CalendarFilters {
  dateDebut: string;
  dateFin: string;
  typeChambres?: string;
  statutReservation?: string;
  searchTerm?: string;
  apiEnabled?: boolean;
}

// Hook principal pour le calendrier
export const useCalendar = (initialFilters?: Partial<CalendarFilters>) => {
  const [state, setState] = useState<CalendarState>({
    chambres: [],
    reservations: [],
    typesChambres: [],
    loading: false,
    error: null,
  });

  const [filters, setFilters] = useState<CalendarFilters>({
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    apiEnabled: false,
    ...initialFilters,
  });

  // Charger les données du calendrier
  const loadCalendarData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await CalendarService.getCalendarData(filters.dateDebut, filters.dateFin);
      setState(prev => ({
        ...prev,
        ...data,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des données',
      }));
    }
  }, [filters.dateDebut, filters.dateFin]);

  // Recharger les données quand les filtres changent
  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Filtrer les chambres selon les critères
  const filteredChambres = state.chambres.filter(chambre => {
    const matchesType = !filters.typeChambres || filters.typeChambres === 'Tous' || chambre.type === filters.typeChambres;
    const matchesSearch = !filters.searchTerm || 
      chambre.numero.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      chambre.type.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Filtrer les réservations selon les critères
  const filteredReservations = state.reservations.filter(reservation => {
    const matchesStatut = !filters.statutReservation || filters.statutReservation === 'Tous' || reservation.statut === filters.statutReservation;
    return matchesStatut;
  });

  // Grouper les chambres par type
  const groupedChambres = filteredChambres.reduce<Record<string, Chambre[]>>((acc, chambre) => {
    acc[chambre.type] = acc[chambre.type] || [];
    acc[chambre.type].push(chambre);
    return acc;
  }, {});

  // Obtenir les types de chambres uniques
  const uniqueTypes = Array.from(new Set(state.chambres.map(c => c.type)));

  // Rafraîchir les données
  const refresh = useCallback(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Activer/désactiver l'API
  const setApiEnabled = useCallback((enabled: boolean) => {
    CalendarService.setApiEnabled(enabled);
    loadCalendarData();
  }, [loadCalendarData]);

  return {
    // État
    ...state,
    filteredChambres,
    filteredReservations,
    groupedChambres,
    uniqueTypes,
    filters,
    
    // Actions
    updateFilters,
    refresh,
    setApiEnabled,
  };
};

// Hook pour gérer les chambres
export const useChambres = () => {
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChambres = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ChambresService.getChambres(filters);
      setChambres(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des chambres');
    } finally {
      setLoading(false);
    }
  }, []);

  const getChambreById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const chambre = await ChambresService.getChambreById(id);
      return chambre;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement de la chambre');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkDisponibilite = useCallback(async (dateDebut: string, dateFin: string, typeChambre?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const chambresDisponibles = await ChambresService.checkDisponibilite(dateDebut, dateFin, typeChambre);
      return chambresDisponibles;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la vérification de disponibilité');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChambres();
  }, [loadChambres]);

  return {
    chambres,
    loading,
    error,
    loadChambres,
    getChambreById,
    checkDisponibilite,
  };
};

// Hook pour gérer les réservations
export const useReservationsCalendar = () => {
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ReservationsService.getReservations(filters);
      setReservations(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservationById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const reservation = await ReservationsService.getReservationById(id);
      return reservation;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement de la réservation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (reservation: Omit<CalendarReservation, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newReservation = await ReservationsService.createReservation(reservation);
      setReservations(prev => [...prev, newReservation]);
      return newReservation;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la création de la réservation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateReservation = useCallback(async (id: string, reservation: Partial<CalendarReservation>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedReservation = await ReservationsService.updateReservation(id, reservation);
      setReservations(prev => prev.map(r => r.id === id ? updatedReservation : r));
      return updatedReservation;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la réservation');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReservation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await ReservationsService.deleteReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression de la réservation');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getReservationsPourPeriode = useCallback(async (dateDebut: string, dateFin: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const reservationsPeriode = await ReservationsService.getReservationsPourPeriode(dateDebut, dateFin);
      return reservationsPeriode;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des réservations pour la période');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  return {
    reservations,
    loading,
    error,
    loadReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getReservationsPourPeriode,
  };
};

// Hook pour les utilitaires du calendrier
export const useCalendarUtils = () => {
  // Fonction pour obtenir le début de la semaine
  const getStartOfWeek = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, []);

  // Fonction pour ajouter des jours à une date
  const addDays = useCallback((date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }, []);

  // Fonction pour vérifier si deux dates sont le même jour
  const isSameDay = useCallback((date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  }, []);

  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  }, [isSameDay]);

  // Fonction pour formater une date
  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions) => {
    return date.toLocaleDateString('fr-FR', options);
  }, []);

  // Fonction pour obtenir les réservations d'un jour donné pour une chambre
  const getReservationsForDay = useCallback((reservations: CalendarReservation[], chambreId: string, day: Date) => {
    return reservations
      .filter(reservation => {
        const dateArrivee = new Date(reservation.dateArrivee);
        const dateDepart = new Date(reservation.dateDepart);

        if (reservation.typeReservation === 'Passage') {
          return isSameDay(dateArrivee, day);
        } else {
          return dateArrivee <= day && day < dateDepart;
        }
      })
      .filter(r => r.chambreId === chambreId);
  }, [isSameDay]);

  // Fonction pour obtenir la couleur selon le statut
  const getStatusColor = useCallback((statut: string) => {
    switch (statut) {
      case 'Confirmée':
        return 'bg-blue-500 text-white border-blue-600';
      case 'Check-in':
        return 'bg-green-500 text-white border-green-600';
      case 'Check-out':
        return 'bg-purple-500 text-white border-purple-600';
      case 'Brouillon':
        return 'bg-yellow-400 text-gray-800 border-yellow-500';
      case 'Annulée':
        return 'bg-red-400 text-white border-red-500';
      default:
        return 'bg-gray-300 text-gray-700 border-gray-400';
    }
  }, []);

  return {
    getStartOfWeek,
    addDays,
    isSameDay,
    isToday,
    formatDate,
    getReservationsForDay,
    getStatusColor,
  };
};