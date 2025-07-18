import { Chambre, CalendarReservation, TypeChambre, mockChambres, mockCalendarReservations, mockTypesChambres } from '../data/mockData';

// Configuration de base pour les appels API
const API_BASE_URL = 'http://localhost:3000/api';

// Interface pour les filtres de recherche
interface ChambresFilter {
  type?: string;
  statut?: string;
  etage?: number;
  capaciteMin?: number;
  capaciteMax?: number;
  dateDebut?: string;
  dateFin?: string;
}

interface ReservationsFilter {
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  typeReservation?: string;
  chambreId?: string;
}

// Service pour les chambres
export class ChambresService {
  private static useApi = false; // Flag pour activer/désactiver l'API

  // Récupérer toutes les chambres
  static async getChambres(filters?: ChambresFilter): Promise<Chambre[]> {
    if (this.useApi) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.type) queryParams.append('type', filters.type);
        if (filters?.statut) queryParams.append('statut', filters.statut);
        if (filters?.etage) queryParams.append('etage', filters.etage.toString());
        if (filters?.capaciteMin) queryParams.append('capaciteMin', filters.capaciteMin.toString());
        if (filters?.capaciteMax) queryParams.append('capaciteMax', filters.capaciteMax.toString());
        if (filters?.dateDebut) queryParams.append('dateDebut', filters.dateDebut);
        if (filters?.dateFin) queryParams.append('dateFin', filters.dateFin);

        const response = await fetch(`${API_BASE_URL}/chambres?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return this.getMockChambres(filters);
      }
    } else {
      return this.getMockChambres(filters);
    }
  }

  // Récupérer une chambre par ID
  static async getChambreById(id: string): Promise<Chambre | null> {
    if (this.useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/chambres/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return mockChambres.find(c => c.id === id) || null;
      }
    } else {
      return mockChambres.find(c => c.id === id) || null;
    }
  }

  // Récupérer les types de chambres
  static async getTypesChambres(): Promise<TypeChambre[]> {
    if (this.useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/types-chambres`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return mockTypesChambres;
      }
    } else {
      return mockTypesChambres;
    }
  }

  // Vérifier la disponibilité des chambres
  static async checkDisponibilite(dateDebut: string, dateFin: string, typeChambre?: string): Promise<Chambre[]> {
    if (this.useApi) {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('dateDebut', dateDebut);
        queryParams.append('dateFin', dateFin);
        if (typeChambre) queryParams.append('typeChambre', typeChambre);

        const response = await fetch(`${API_BASE_URL}/chambres/disponibilite?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return this.getMockChambresDisponibles(dateDebut, dateFin, typeChambre);
      }
    } else {
      return this.getMockChambresDisponibles(dateDebut, dateFin, typeChambre);
    }
  }

  // Méthodes privées pour les données mock
  private static getMockChambres(filters?: ChambresFilter): Chambre[] {
    let result = [...mockChambres];

    if (filters?.type) {
      result = result.filter(c => c.type === filters.type);
    }
    if (filters?.statut) {
      result = result.filter(c => c.statut === filters.statut);
    }
    if (filters?.etage) {
      result = result.filter(c => c.etage === filters.etage);
    }
    if (filters?.capaciteMin) {
      result = result.filter(c => c.capacite >= filters.capaciteMin!);
    }
    if (filters?.capaciteMax) {
      result = result.filter(c => c.capacite <= filters.capaciteMax!);
    }

    return result;
  }

  private static getMockChambresDisponibles(dateDebut: string, dateFin: string, typeChambre?: string): Chambre[] {
    const chambresOccupees = mockCalendarReservations
      .filter(r => r.statut !== 'Annulée' && r.statut !== 'Check-out')
      .filter(r => {
        const resDebut = new Date(r.dateArrivee);
        const resFin = new Date(r.dateDepart);
        const checkDebut = new Date(dateDebut);
        const checkFin = new Date(dateFin);

        return (resDebut < checkFin && resFin > checkDebut);
      })
      .map(r => r.chambreId);

    let chambresDisponibles = mockChambres.filter(c => 
      !chambresOccupees.includes(c.id) && c.statut === 'Disponible'
    );

    if (typeChambre) {
      chambresDisponibles = chambresDisponibles.filter(c => c.type === typeChambre);
    }

    return chambresDisponibles;
  }

  // Méthode pour activer/désactiver l'API
  static setApiEnabled(enabled: boolean) {
    this.useApi = enabled;
  }
}

// Service pour les réservations
export class ReservationsService {
  private static useApi = false; // Flag pour activer/désactiver l'API

  // Récupérer toutes les réservations
  static async getReservations(filters?: ReservationsFilter): Promise<CalendarReservation[]> {
    if (this.useApi) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.dateDebut) queryParams.append('dateDebut', filters.dateDebut);
        if (filters?.dateFin) queryParams.append('dateFin', filters.dateFin);
        if (filters?.statut) queryParams.append('statut', filters.statut);
        if (filters?.typeReservation) queryParams.append('typeReservation', filters.typeReservation);
        if (filters?.chambreId) queryParams.append('chambreId', filters.chambreId);

        const response = await fetch(`${API_BASE_URL}/reservations?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return this.getMockReservations(filters);
      }
    } else {
      return this.getMockReservations(filters);
    }
  }

  // Récupérer une réservation par ID
  static async getReservationById(id: string): Promise<CalendarReservation | null> {
    if (this.useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return mockCalendarReservations.find(r => r.id === id) || null;
      }
    } else {
      return mockCalendarReservations.find(r => r.id === id) || null;
    }
  }

  // Récupérer les réservations pour une période donnée
  static async getReservationsPourPeriode(dateDebut: string, dateFin: string): Promise<CalendarReservation[]> {
    if (this.useApi) {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('dateDebut', dateDebut);
        queryParams.append('dateFin', dateFin);

        const response = await fetch(`${API_BASE_URL}/reservations/periode?${queryParams}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, utilisation des données mock:', error);
        return this.getMockReservationsPourPeriode(dateDebut, dateFin);
      }
    } else {
      return this.getMockReservationsPourPeriode(dateDebut, dateFin);
    }
  }

  // Créer une nouvelle réservation
  static async createReservation(reservation: Omit<CalendarReservation, 'id'>): Promise<CalendarReservation> {
    if (this.useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservation),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, simulation de création:', error);
        const newReservation = {
          ...reservation,
          id: `mock_${Date.now()}`,
        };
        return newReservation;
      }
    } else {
      const newReservation = {
        ...reservation,
        id: `mock_${Date.now()}`,
      };
      return newReservation;
    }
  }

  // Mettre à jour une réservation
  static async updateReservation(id: string, reservation: Partial<CalendarReservation>): Promise<CalendarReservation> {
    if (this.useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservation),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.warn('API non disponible, simulation de mise à jour:', error);
        const existingReservation = mockCalendarReservations.find(r => r.id === id);
        if (!existingReservation) {
          throw new Error('Réservation non trouvée');
        }
        return { ...existingReservation, ...reservation };
      }
    } else {
      const existingReservation = mockCalendarReservations.find(r => r.id === id);
      if (!existingReservation) {
        throw new Error('Réservation non trouvée');
      }
      return { ...existingReservation, ...reservation };
    }
  }

  // Supprimer une réservation
  static async deleteReservation(id: string): Promise<void> {
    if (this.useApi) {
      try {
        const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.warn('API non disponible, simulation de suppression:', error);
      }
    } else {
      console.log(`Simulation: Suppression de la réservation ${id}`);
    }
  }

  // Méthodes privées pour les données mock
  private static getMockReservations(filters?: ReservationsFilter): CalendarReservation[] {
    let result = [...mockCalendarReservations];

    if (filters?.dateDebut && filters?.dateFin) {
      const debut = new Date(filters.dateDebut);
      const fin = new Date(filters.dateFin);
      result = result.filter(r => {
        const resDebut = new Date(r.dateArrivee);
        const resFin = new Date(r.dateDepart);
        return (resDebut < fin && resFin > debut);
      });
    }

    if (filters?.statut) {
      result = result.filter(r => r.statut === filters.statut);
    }
    if (filters?.typeReservation) {
      result = result.filter(r => r.typeReservation === filters.typeReservation);
    }
    if (filters?.chambreId) {
      result = result.filter(r => r.chambreId === filters.chambreId);
    }

    return result;
  }

  private static getMockReservationsPourPeriode(dateDebut: string, dateFin: string): CalendarReservation[] {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    
    return mockCalendarReservations.filter(r => {
      const resDebut = new Date(r.dateArrivee);
      const resFin = new Date(r.dateDepart);
      return (resDebut < fin && resFin > debut);
    });
  }

  // Méthode pour activer/désactiver l'API
  static setApiEnabled(enabled: boolean) {
    this.useApi = enabled;
  }
}

// Service combiné pour le calendrier
export class CalendarService {
  // Récupérer toutes les données nécessaires pour le calendrier
  static async getCalendarData(dateDebut: string, dateFin: string) {
    const [chambres, reservations, typesChambres] = await Promise.all([
      ChambresService.getChambres(),
      ReservationsService.getReservationsPourPeriode(dateDebut, dateFin),
      ChambresService.getTypesChambres(),
    ]);

    return {
      chambres,
      reservations,
      typesChambres,
    };
  }

  // Activer/désactiver l'API pour tous les services
  static setApiEnabled(enabled: boolean) {
    ChambresService.setApiEnabled(enabled);
    ReservationsService.setApiEnabled(enabled);
  }
}