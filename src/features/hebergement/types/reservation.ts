// Types pour le module de réservation
export interface Reservant {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  dateReservation: string;
  reservationAvance: boolean;
}

export interface ClientHeberge {
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  telephone: string;
  pays: string;
  ville: string;
  raisonSociale?: string;
  typeClient: "Régulier" | "Business" | "Occasionnel";
  bonReductionId?: string;
}

export interface TypePiece {
  id: string;
  nom: string;
  description: string;
  capacite: number;
  equipements: string[];
  prixBase: number;
  disponible: boolean;
}

export interface Piece {
  id: string;
  numero: string;
  nom: string;
  typePieceId: string;
  typePiece: TypePiece;
  etage: number;
  superficie: number;
  description?: string;
  equipements: string[];
  statut: "Disponible" | "Occupée" | "Maintenance" | "Hors-service";
  prixActuel: number;
  images?: string[];
  caracteristiques: Record<string, any>;
}

export interface GrilleTarifaire {
  id: string;
  nom: string;
  description: string;
  typePieceId: string;
  tarifsParJour: {
    [jour: string]: {
      prixHT: number;
      prixTTC: number;
      tva: number;
      reductions?: {
        type: string;
        valeur: number;
        description: string;
      }[];
    };
  };
  saisonHaute?: {
    debut: string;
    fin: string;
    multiplicateur: number;
  };
  saisonBasse?: {
    debut: string;
    fin: string;
    multiplicateur: number;
  };
  validiteDebut: string;
  validiteFin: string;
  active: boolean;
}

export interface BonReduction {
  id: string;
  code: string;
  nom: string;
  description: string;
  typeReduction: "Pourcentage" | "Montant";
  valeur: number;
  montantMinimum?: number;
  utilisationMax?: number;
  utilisationActuelle: number;
  dateDebut: string;
  dateFin: string;
  active: boolean;
  conditions?: string[];
}

export interface Sejour {
  id: string;
  dateArrivee: string;
  dateDepart: string;
  nuitees: number;
  typePieceId: string;
  typePiece?: TypePiece;
  grilleTarifaireId: string;
  grilleTarifaire?: GrilleTarifaire;
  piecesSelectionnees: {
    pieceId: string;
    piece: Piece;
    prixTotal: number;
    detailTarif: {
      date: string;
      prixHT: number;
      prixTTC: number;
      tva: number;
    }[];
  }[];
  montantTotal: number;
  montantHT: number;
  montantTTC: number;
  montantTVA: number;
  reductionsAppliquees: {
    type: string;
    description: string;
    montant: number;
  }[];
  note?: string;
}

export interface Reservation {
  id: string;
  numero: string;
  dateCreation: string;
  dateModification: string;
  statut: "Brouillon" | "Confirmée" | "Annulée" | "Terminée";

  // Informations du réservant
  reservant: Reservant;

  // Informations du client hébergé
  clientHeberge: ClientHeberge;

  // Bon de réduction global
  bonReduction?: BonReduction;

  // Séjours
  sejours: Sejour[];

  // Totaux généraux
  montantTotal: number;
  montantHT: number;
  montantTTC: number;
  montantTVA: number;
  montantReductions: number;

  // Métadonnées
  creePar: string;
  modifiePar: string;
  notes?: string;
}

// Types pour les API
export interface TypePieceDisponible {
  id: string;
  nom: string;
  description: string;
  capacite: number;
  prixBase: number;
  nombreDisponible: number;
  pieces: Piece[];
}

export interface PieceDisponible {
  id: string;
  numero: string;
  nom: string;
  typePieceId: string;
  disponible: boolean;
  prixActuel: number;
  conflits?: {
    dateDebut: string;
    dateFin: string;
    motif: string;
  }[];
}

export interface SimulationTarif {
  sejour: {
    id: string;
    dateArrivee: string;
    dateDepart: string;
    nuitees: number;
    typePieceId: string;
    piecesIds: string[];
  };
  montantHT: number;
  montantTTC: number;
  montantTVA: number;
  detailParJour: {
    date: string;
    prixHT: number;
    prixTTC: number;
    tva: number;
    saisonMultiplicateur?: number;
  }[];
  reductionsAppliquees: {
    type: string;
    description: string;
    montant: number;
  }[];
}

export interface SimulationReservation {
  sejours: SimulationTarif[];
  montantTotal: number;
  montantHT: number;
  montantTTC: number;
  montantTVA: number;
  montantReductions: number;
  bonReductionApplique?: {
    code: string;
    description: string;
    montant: number;
  };
}

// Types pour les formulaires
export interface ReservationFormData {
  reservant: Reservant;
  clientHeberge: ClientHeberge;
  bonReductionId?: string;
  sejours: {
    dateArrivee: string;
    dateDepart: string;
    typePieceId: string;
    piecesIds: string[];
    note?: string;
  }[];
}

export interface ReservationFormErrors {
  reservant?: Partial<Record<keyof Reservant, string>>;
  clientHeberge?: Partial<Record<keyof ClientHeberge, string>>;
  sejours?: {
    [index: number]: {
      dateArrivee?: string;
      dateDepart?: string;
      typePieceId?: string;
      piecesIds?: string;
      general?: string;
    };
  };
  general?: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
  success: boolean;
}

// Types pour les filtres et recherche
export interface ReservationFilter {
  dateDebut?: string;
  dateFin?: string;
  statut?: string[];
  typeClient?: string[];
  typePiece?: string[];
  montantMin?: number;
  montantMax?: number;
  searchTerm?: string;
}

export interface DisponibiliteFilter {
  dateDebut: string;
  dateFin: string;
  typePieceId?: string;
  capaciteMin?: number;
  equipements?: string[];
}

// Types pour les statistiques
export interface StatistiquesReservation {
  totalReservations: number;
  reservationsConfirmees: number;
  reservationsAnnulees: number;
  tauxOccupation: number;
  chiffreAffaires: number;
  sejoursMoyens: number;
  clientsReguliers: number;
  clientsBusiness: number;
  clientsOccasionnels: number;
}

// Types pour les notifications
export interface NotificationReservation {
  id: string;
  type: "Création" | "Modification" | "Annulation" | "Rappel";
  reservationId: string;
  message: string;
  dateCreation: string;
  lu: boolean;
  urgence: "Basse" | "Moyenne" | "Haute";
}
export interface TarifOption {
  tarifid: string;
  codetarif: string;
  libelletarif: string;
  codetva: string;
  modelocatlibelle: string;
  tvaid: number;
  modelocatid: number;
  ttcactive: boolean;
}
// No default export of types/interfaces, as they are not available at runtime.
