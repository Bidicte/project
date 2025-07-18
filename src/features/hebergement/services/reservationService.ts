import axios, { type AxiosResponse } from "axios";
import type {
  Reservation,
  ReservationFormData,
  TypePieceDisponible,
  TarifOption,
  PieceDisponible,
  SimulationReservation,
  GrilleTarifaire,
  BonReduction,
  ApiResponse,
  PaginatedResponse,
  ReservationFilter,
  DisponibiliteFilter,
  StatistiquesReservation,
} from "../types/reservation";
import { authService } from "./authService";
const API_BASE_URL =
  import.meta.env.VITE_API_HEBERGEMENT || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
class ReservationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/reservation"; // Utilisation d'un chemin relatif car la base URL est déjà définie dans apiClient
  }

  // =============================================
  // GESTION DES RÉSERVATIONS
  // =============================================

  async getReservations(
    filter?: ReservationFilter
  ): Promise<PaginatedResponse<Reservation>> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get<PaginatedResponse<Reservation>>(
        `${this.baseUrl}/all`
      );
      if (!response || typeof response !== "object" || !("data" in response)) {
        throw new Error("Réponse API invalide ou vide");
      }
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
      throw error;
    }
  }

  async getReservationById(id: string): Promise<ApiResponse<Reservation>> {
    try {
      const response = await apiClient.get<ApiResponse<Reservation>>(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la réservation ${id}:`,
        error
      );
      throw error;
    }
  }

  async createReservation(
    data: ReservationFormData
  ): Promise<ApiResponse<Reservation>> {
    try {
      const response = await apiClient.post<ApiResponse<Reservation>>(
        `${this.baseUrl}/add-with-sejour`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      throw error;
    }
  }

  async updateReservation(
    id: string,
    data: Partial<ReservationFormData>
  ): Promise<ApiResponse<Reservation>> {
    try {
      const response = await apiClient.put<ApiResponse<Reservation>>(
        `${this.baseUrl}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de la réservation ${id}:`,
        error
      );
      throw error;
    }
  }

  async deleteReservation(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `${this.baseUrl}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de la réservation ${id}:`,
        error
      );
      throw error;
    }
  }

  async confirmReservation(id: string): Promise<ApiResponse<Reservation>> {
    try {
      const response = await apiClient.post<ApiResponse<Reservation>>(
        `${this.baseUrl}/${id}/confirm`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la confirmation de la réservation ${id}:`,
        error
      );
      throw error;
    }
  }

  async cancelReservation(
    id: string,
    motif?: string
  ): Promise<ApiResponse<Reservation>> {
    try {
      const response = await apiClient.post<ApiResponse<Reservation>>(
        `${this.baseUrl}/${id}/cancel`,
        { motif }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de l'annulation de la réservation ${id}:`,
        error
      );
      throw error;
    }
  }

  // =============================================
  // GESTION DES DISPONIBILITÉS
  // =============================================

  async getTypePiecesDisponibles(
    dateDebut: string,
    dateFin: string
  ): Promise<ApiResponse<TypePieceDisponible[]>> {
    try {
      const params = new URLSearchParams({
        start: dateDebut,
        end: dateFin,
      });

      const response = await apiClient.get<ApiResponse<TypePieceDisponible[]>>(
        `/types-pieces/disponibles?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des types de pièces disponibles:",
        error
      );
      throw error;
    }
  }

  async getPiecesDisponibles(
    filter: DisponibiliteFilter
  ): Promise<ApiResponse<PieceDisponible[]>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get<ApiResponse<PieceDisponible[]>>(
        `/pieces/disponibles?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des pièces disponibles:",
        error
      );
      throw error;
    }
  }

  async getAvailableRooms(
    typePieceId: string,
    startDate: string,
    endDate: string
  ): Promise<
    ApiResponse<
      Array<{
        pieceid: string;
        piecelibelle: string;
        piececode: string;
        typepieceid: string;
        fonctionnel: boolean;
        libellepiecetype: string;
        tarifid: string;
      }>
    >
  > {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await apiClient.get<
        ApiResponse<
          Array<{
            pieceid: string;
            piecelibelle: string;
            piececode: string;
            typepieceid: string;
            fonctionnel: boolean;
            libellepiecetype: string;
            tarifid: string;
          }>
        >
      >(`/piece/getpiecesdisponibles/${typePieceId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des pièces disponibles:",
        error
      );
      throw error;
    }
  }

  async getAllAvailableRooms(
    startDate: string,
    endDate: string
  ): Promise<
    ApiResponse<
      Array<{
        pieceid: string;
        piecelibelle: string;
        piececode: string;
        typepieceid: string;
        fonctionnel: boolean;
        libellepiecetype: string;
        tarifid: string;
      }>
    >
  > {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await apiClient.get<
        ApiResponse<
          Array<{
            pieceid: string;
            piecelibelle: string;
            piececode: string;
            typepieceid: string;
            fonctionnel: boolean;
            libellepiecetype: string;
            tarifid: string;
          }>
        >
      >(`/piece/getpiecesdisponibles?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de toutes les pièces disponibles:",
        error
      );
      throw error;
    }
  }

  async verifierDisponibilite(
    pieceIds: string[],
    dateDebut: string,
    dateFin: string
  ): Promise<
    ApiResponse<{
      disponible: boolean;
      conflits: Array<{
        pieceId: string;
        dateDebut: string;
        dateFin: string;
        motif: string;
      }>;
    }>
  > {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          disponible: boolean;
          conflits: Array<{
            pieceId: string;
            dateDebut: string;
            dateFin: string;
            motif: string;
          }>;
        }>
      >(`/pieces/verifier-disponibilite`, {
        pieceIds,
        dateDebut,
        dateFin,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification de disponibilité:", error);
      throw error;
    }
  }

  // =============================================
  // GESTION DES GRILLES TARIFAIRES
  // =============================================

  async getGrillesTarifaires(
    typePieceId: string,
    dateDebut: string,
    dateFin: string
  ): Promise<ApiResponse<GrilleTarifaire[]>> {
    try {
      const params = new URLSearchParams({
        start: dateDebut,
        end: dateFin,
      });

      const response = await apiClient.get<ApiResponse<GrilleTarifaire[]>>(
        `/grilles-tarifaires/${typePieceId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des grilles tarifaires:",
        error
      );
      throw error;
    }
  }

  async getAllTarifs(): Promise<ApiResponse<TarifOption[]>> {
    try {
      const response = await apiClient.get<TarifOption[]>(
        "/grilletarifaire/all"
      );
      return {
        success: true,
        data: response.data,
        message: "",
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de tous les tarifs:",
        error
      );
      return {
        success: false,
        data: [],
        message: "Erreur lors de la récupération des tarifs",
      };
    }
  }

  // =============================================
  // SIMULATION DE TARIFS
  // =============================================

  async simulerTarif(data: {
    sejours: Array<{
      dateArrivee: string;
      dateDepart: string;
      typePieceId: string;
      piecesIds: string[];
      grilleTarifaireId?: string;
    }>;
    bonReductionId?: string;
    typeClient?: string;
  }): Promise<ApiResponse<SimulationReservation>> {
    try {
      const response = await apiClient.post<ApiResponse<SimulationReservation>>(
        `${this.baseUrl}/simulate`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la simulation de tarif:", error);
      throw error;
    }
  }

  // =============================================
  // GESTION DES BONS DE RÉDUCTION
  // =============================================

  async getBonsReduction(
    actif: boolean = true
  ): Promise<ApiResponse<BonReduction[]>> {
    try {
      const params = new URLSearchParams({
        actif: actif.toString(),
      });

      const response = await apiClient.get<ApiResponse<BonReduction[]>>(
        `/bons-reduction?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des bons de réduction:",
        error
      );
      throw error;
    }
  }

  async verifierBonReduction(
    code: string,
    montantTotal: number
  ): Promise<
    ApiResponse<{
      valide: boolean;
      bonReduction?: BonReduction;
      montantReduction?: number;
      erreur?: string;
    }>
  > {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          valide: boolean;
          bonReduction?: BonReduction;
          montantReduction?: number;
          erreur?: string;
        }>
      >(`/bons-reduction/verifier`, {
        code,
        montantTotal,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du bon de réduction:",
        error
      );
      throw error;
    }
  }

  // =============================================
  // STATISTIQUES
  // =============================================

  async getStatistiques(
    dateDebut?: string,
    dateFin?: string
  ): Promise<ApiResponse<StatistiquesReservation>> {
    try {
      const params = new URLSearchParams();
      if (dateDebut) params.append("dateDebut", dateDebut);
      if (dateFin) params.append("dateFin", dateFin);

      const response = await apiClient.get<
        ApiResponse<StatistiquesReservation>
      >(`${this.baseUrl}/statistiques?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  // =============================================
  // EXPORT ET RAPPORTS
  // =============================================

  async exportReservations(
    filter?: ReservationFilter,
    format: "excel" | "pdf" = "excel"
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append("format", format);

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((v) => params.append(key, v));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get(
        `${this.baseUrl}/export?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'export des réservations:", error);
      throw error;
    }
  }

  async genererFacture(reservationId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${this.baseUrl}/${reservationId}/facture`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      throw error;
    }
  }

  // =============================================
  // NOTIFICATIONS
  // =============================================

  async getNotifications(reservationId?: string): Promise<ApiResponse<any[]>> {
    try {
      const params = reservationId ? `?reservationId=${reservationId}` : "";
      const response = await apiClient.get<ApiResponse<any[]>>(
        `${this.baseUrl}/notifications${params}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  }

  async marquerNotificationLue(
    notificationId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        `${this.baseUrl}/notifications/${notificationId}/lue`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors du marquage de la notification comme lue:",
        error
      );
      throw error;
    }
  }

  // =============================================
  // UTILITAIRES
  // =============================================

  async calculerNuitees(
    dateArrivee: string,
    dateDepart: string
  ): Promise<number> {
    const debut = new Date(dateArrivee);
    const fin = new Date(dateDepart);
    const diffTime = Math.abs(fin.getTime() - debut.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  async formaterNumeroReservation(id: string): Promise<string> {
    const date = new Date();
    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, "0");
    const jour = String(date.getDate()).padStart(2, "0");
    const numeroId = id.slice(-4).toUpperCase();

    return `RES-${annee}${mois}${jour}-${numeroId}`;
  }

  async validerDatesSuccessives(
    sejours: Array<{ dateArrivee: string; dateDepart: string }>
  ): Promise<{
    valide: boolean;
    erreurs: string[];
  }> {
    const erreurs: string[] = [];

    for (let i = 0; i < sejours.length; i++) {
      const sejour = sejours[i];
      const dateArrivee = new Date(sejour.dateArrivee);
      const dateDepart = new Date(sejour.dateDepart);

      // Vérifier que la date d'arrivée est antérieure à la date de départ
      if (dateArrivee >= dateDepart) {
        erreurs.push(
          `Séjour ${
            i + 1
          }: La date d'arrivée doit être antérieure à la date de départ`
        );
      }

      // Vérifier les dates avec le séjour suivant
      if (i < sejours.length - 1) {
        const sejourSuivant = sejours[i + 1];
        const dateArriveeSuivante = new Date(sejourSuivant.dateArrivee);

        if (dateDepart > dateArriveeSuivante) {
          erreurs.push(
            `Séjour ${
              i + 1
            }: La date de départ ne peut pas être postérieure à la date d'arrivée du séjour suivant`
          );
        }
      }
    }

    return {
      valide: erreurs.length === 0,
      erreurs,
    };
  }
}

// Export d'une instance singleton
export const reservationService = new ReservationService();
export default reservationService;
