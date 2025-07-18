// Mock data pour les types de base
import type { SalesData, DashboardStats, MenuItem } from "../types";
import {
  Grid3X3,
  UsersRound,
  CheckSquare,
  Settings,
} from "lucide-react";

// Mock data pour les reservations existantes
import type { Reservation } from "../types/reservation";

// Mock data pour le calendrier
export interface Chambre {
  id: string;
  numero: string;
  type: string;
  etage: number;
  capacite: number;
  statut: "Disponible" | "Occupée" | "Maintenance" | "Nettoyage";
  equipements: string[];
  prix: number;
}

export interface CalendarReservation {
  id: string;
  chambreId: string;
  client: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
  };
  statut: "Confirmée" | "Brouillon" | "Annulée" | "Check-in" | "Check-out";
  dateArrivee: string;
  dateDepart: string;
  heureArrivee?: string;
  heureDepart?: string;
  typeReservation: "Nuitée" | "Passage";
  montantTotal: number;
  nombrePersonnes: number;
  note?: string;
}

export interface TypeChambre {
  id: string;
  nom: string;
  description: string;
  capacite: number;
  equipements: string[];
  prix: number;
}

// Mock data pour les chambres
export const mockChambres: Chambre[] = [
  {
    id: "101",
    numero: "101",
    type: "Standard",
    etage: 1,
    capacite: 2,
    statut: "Disponible",
    equipements: ["TV", "WiFi", "Climatisation"],
    prix: 50000,
  },
  {
    id: "102",
    numero: "102",
    type: "Standard",
    etage: 1,
    capacite: 2,
    statut: "Disponible",
    equipements: ["TV", "WiFi", "Climatisation"],
    prix: 50000,
  },
  {
    id: "103",
    numero: "103",
    type: "Standard",
    etage: 1,
    capacite: 2,
    statut: "Maintenance",
    equipements: ["TV", "WiFi", "Climatisation"],
    prix: 50000,
  },
  {
    id: "201",
    numero: "201",
    type: "Suite Executive",
    etage: 2,
    capacite: 4,
    statut: "Disponible",
    equipements: ["TV", "WiFi", "Climatisation", "Minibar", "Salon"],
    prix: 80000,
  },
  {
    id: "202",
    numero: "202",
    type: "Suite Executive",
    etage: 2,
    capacite: 4,
    statut: "Disponible",
    equipements: ["TV", "WiFi", "Climatisation", "Minibar", "Salon"],
    prix: 80000,
  },
  {
    id: "301",
    numero: "301",
    type: "Familiale",
    etage: 3,
    capacite: 6,
    statut: "Disponible",
    equipements: ["TV", "WiFi", "Climatisation", "Lits superposés"],
    prix: 70000,
  },
  {
    id: "302",
    numero: "302",
    type: "Familiale",
    etage: 3,
    capacite: 6,
    statut: "Disponible",
    equipements: ["TV", "WiFi", "Climatisation", "Lits superposés"],
    prix: 70000,
  },
];

// Mock data pour les types de chambres
export const mockTypesChambres: TypeChambre[] = [
  {
    id: "std",
    nom: "Standard",
    description: "Chambre confortable avec lit double",
    capacite: 2,
    equipements: ["TV", "WiFi", "Climatisation"],
    prix: 50000,
  },
  {
    id: "suite",
    nom: "Suite Executive",
    description: "Suite spacieuse avec salon",
    capacite: 4,
    equipements: ["TV", "WiFi", "Climatisation", "Minibar", "Salon"],
    prix: 80000,
  },
  {
    id: "familiale",
    nom: "Familiale",
    description: "Chambre avec lits superposés",
    capacite: 6,
    equipements: ["TV", "WiFi", "Climatisation", "Lits superposés"],
    prix: 70000,
  },
];

export const mockCalendarReservations: CalendarReservation[] = [
  // Réservations normales
  {
    id: "r1",
    chambreId: "101",
    client: {
      nom: "Kouassi",
      prenom: "Jean",
      telephone: "+225 01 23 45 67",
      email: "jean.kouassi@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-14",
    dateDepart: "2025-07-17",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 150000,
    nombrePersonnes: 2,
    note: "Chambre avec vue sur jardin",
  },
  // Réservation qui commence juste après la précédente (même chambre)
  {
    id: "r2",
    chambreId: "101",
    client: {
      nom: "Diallo",
      prenom: "Marie",
      telephone: "+225 07 89 01 23",
      email: "marie.diallo@email.com",
    },
    statut: "Check-in",
    dateArrivee: "2025-07-17",
    dateDepart: "2025-07-20",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 150000,
    nombrePersonnes: 1,
  },
  // Réservation en suite sur la même chambre
  {
    id: "r3",
    chambreId: "101",
    client: {
      nom: "Yao",
      prenom: "Kofi",
      telephone: "+225 08 12 34 56",
      email: "kofi.yao@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-20",
    dateDepart: "2025-07-22",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 100000,
    nombrePersonnes: 1,
    note: "Voyage d'affaires",
  },
  // Chambre 102 - Réservations avec chevauchement parfait
  {
    id: "r4",
    chambreId: "102",
    client: {
      nom: "Traore",
      prenom: "Paul",
      telephone: "+225 05 67 89 01",
      email: "paul.traore@email.com",
    },
    statut: "Check-out",
    dateArrivee: "2025-07-15",
    dateDepart: "2025-07-18",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 150000,
    nombrePersonnes: 2,
  },
  {
    id: "r5",
    chambreId: "102",
    client: {
      nom: "Assi",
      prenom: "Fatou",
      telephone: "+225 09 87 65 43",
      email: "fatou.assi@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-18",
    dateDepart: "2025-07-21",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 150000,
    nombrePersonnes: 3,
    note: "Famille en vacances",
  },
  // Suite Executive - 201
  {
    id: "r6",
    chambreId: "201",
    client: {
      nom: "Ouattara",
      prenom: "Ibrahim",
      telephone: "+225 04 56 78 90",
      email: "ibrahim.ouattara@email.com",
    },
    statut: "Brouillon",
    dateArrivee: "2025-07-16",
    dateDepart: "2025-07-19",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 240000,
    nombrePersonnes: 4,
  },
  // Chevauchement sur la 201 - même jour fin/début
  {
    id: "r7",
    chambreId: "201",
    client: {
      nom: "Sangare",
      prenom: "Aminata",
      telephone: "+225 03 21 43 65",
      email: "aminata.sangare@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-19",
    dateDepart: "2025-07-22",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 240000,
    nombrePersonnes: 2,
    note: "Lune de miel",
  },
  // Suite Executive - 202
  {
    id: "r8",
    chambreId: "202",
    client: {
      nom: "Dabo",
      prenom: "Moussa",
      telephone: "+225 07 11 22 33",
      email: "moussa.dabo@email.com",
    },
    statut: "Check-in",
    dateArrivee: "2025-07-14",
    dateDepart: "2025-07-16",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 160000,
    nombrePersonnes: 2,
  },
  // Familiale - 301 avec passages
  {
    id: "r9",
    chambreId: "301",
    client: {
      nom: "Kone",
      prenom: "Awa",
      telephone: "+225 02 34 56 78",
      email: "awa.kone@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-15",
    dateDepart: "2025-07-15",
    heureArrivee: "08:00",
    heureDepart: "11:59",
    typeReservation: "Passage",
    montantTotal: 35000,
    nombrePersonnes: 4,
    note: "Réunion famille matinée",
  },
  // Passage après-midi même jour, même chambre
  {
    id: "r10",
    chambreId: "301",
    client: {
      nom: "Gbane",
      prenom: "Roger",
      telephone: "+225 08 99 77 55",
      email: "roger.gbane@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-15",
    dateDepart: "2025-07-15",
    heureArrivee: "12:00",
    heureDepart: "18:00",
    typeReservation: "Passage",
    montantTotal: 40000,
    nombrePersonnes: 6,
    note: "Anniversaire enfant",
  },
  // Nuitée qui commence le soir même
  {
    id: "r11",
    chambreId: "301",
    client: {
      nom: "Silue",
      prenom: "Mariam",
      telephone: "+225 06 44 88 22",
      email: "mariam.silue@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-15",
    dateDepart: "2025-07-18",
    heureArrivee: "19:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 210000,
    nombrePersonnes: 5,
    note: "Séjour famille élargie",
  },
  // Familiale - 302 avec chevauchements
  {
    id: "r12",
    chambreId: "302",
    client: {
      nom: "Toure",
      prenom: "Salif",
      telephone: "+225 05 33 66 99",
      email: "salif.toure@email.com",
    },
    statut: "Check-out",
    dateArrivee: "2025-07-17",
    dateDepart: "2025-07-19",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 140000,
    nombrePersonnes: 4,
  },
  {
    id: "r13",
    chambreId: "302",
    client: {
      nom: "Bamba",
      prenom: "Sekou",
      telephone: "+225 06 78 90 12",
      email: "sekou.bamba@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-19",
    dateDepart: "2025-07-22",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 210000,
    nombrePersonnes: 5,
  },
  // Réservation annulée pour test
  {
    id: "r14",
    chambreId: "103",
    client: {
      nom: "Beugre",
      prenom: "Esther",
      telephone: "+225 07 55 44 33",
      email: "esther.beugre@email.com",
    },
    statut: "Annulée",
    dateArrivee: "2025-07-16",
    dateDepart: "2025-07-18",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 100000,
    nombrePersonnes: 2,
    note: "Annulée pour cause personnelle",
  },
  // Réservations pour cette semaine (15-21 juillet 2025)
  {
    id: "r15",
    chambreId: "103",
    client: {
      nom: "Danho",
      prenom: "Christine",
      telephone: "+225 09 12 34 56",
      email: "christine.danho@email.com",
    },
    statut: "Confirmée",
    dateArrivee: "2025-07-20",
    dateDepart: "2025-07-23",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeReservation: "Nuitée",
    montantTotal: 150000,
    nombrePersonnes: 1,
    note: "Voyage d'affaires prolongé",
  },
];

// Configuration pour les statuts
export const statutsReservation = [
  { value: "Confirmée", label: "Confirmée", color: "bg-blue-500" },
  { value: "Check-in", label: "Check-in", color: "bg-green-500" },
  { value: "Check-out", label: "Check-out", color: "bg-purple-500" },
  { value: "Brouillon", label: "Brouillon", color: "bg-yellow-400" },
  { value: "Annulée", label: "Annulée", color: "bg-red-400" },
];

// Configuration pour les types de réservation
export const typesReservation = [
  { value: "Nuitée", label: "Nuitée" },
  { value: "Passage", label: "Passage" },
];

// Dashboard data
export const salesData: SalesData[] = [
  { month: "Jan", value: 150 },
  { month: "Feb", value: 380 },
  { month: "Mar", value: 200 },
  { month: "Apr", value: 280 },
  { month: "May", value: 180 },
  { month: "Jun", value: 190 },
  { month: "Jul", value: 280 },
  { month: "Aug", value: 200 },
  { month: "Sep", value: 380 },
  { month: "Oct", value: 260 },
];

export const dashboardStats: DashboardStats = {
  customers: 3782,
  customerChange: 11.01,
  orders: 5359,
  orderChange: -9.05,
  monthlyTarget: 75.55,
  targetPercentage: 75.55,
  dailyEarnings: 3287,
};

export const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Grid3X3,
    path: "/",
    hasSubmenu: false,
  },
  {
    id: "exploitations",
    label: "Exploitations",
    icon: CheckSquare,
    path: "",
    hasSubmenu: true,
    submenuItems: [
      {
        id: "planning-hebergement",
        label: "Planning hebergement",
        path: "/calendar",
        hasSubmenu: false,
        // submenuItems: [
        //   { id: "reservations", label: "Réservations", path: "/reservations" },
        //   { id: "calendar", label: "Calendrier", path: "/calendar" },
        // ],
      },
      {
        id: "suivi-hebergement",
        label: "Suivi hebergement",
        path: "/suivi-hebergement",
      },
    ],
  },
  {
    id: "clients",
    label: "Clients",
    icon: UsersRound,
    path: "/dashboard/clients",
    hasSubmenu: false,
  },
  {
    id: "configurations",
    label: "Configurations",
    icon: Settings,
    path: "",
    hasSubmenu: true,
    submenuItems: [
      {
        id: "grilleTarifaire",
        label: "Grille tarifaire",
        path: "/configurations/grilleTarifaire",
      },
      { id: "piece", label: "Pièces louées", path: "/configurations/piece" },
    ],
  },
];

// Réservations pour le système existant
export const mockReservations: Reservation[] = [
  {
    id: "1",
    numero: "RES-2024-001",
    dateCreation: "2024-07-01T10:00:00Z",
    dateModification: "2024-07-01T10:00:00Z",
    statut: "Confirmée",
    reservant: {
      nom: "Kouadio",
      prenom: "Jean",
      telephone: "0102030405",
      email: "jean.kouadio@email.com",
      dateReservation: "2024-07-01",
      reservationAvance: false,
    },
    clientHeberge: {
      nom: "Kouadio",
      prenom: "Jean",
      adresse: "Abidjan, Cocody",
      email: "jean.kouadio@email.com",
      telephone: "0102030405",
      pays: "Côte d'Ivoire",
      ville: "Abidjan",
      typeClient: "Régulier",
    },
    sejours: [
      {
        id: "s1",
        dateArrivee: "2024-07-10",
        dateDepart: "2024-07-12",
        nuitees: 2,
        typePieceId: "1",
        grilleTarifaireId: "gt1",
        piecesSelectionnees: [
          {
            pieceId: "101",
            piece: {
              id: "101",
              numero: "101",
              nom: "Chambre 101",
              typePieceId: "1",
              typePiece: {
                id: "1",
                nom: "Chambre Standard",
                description: "Chambre standard",
                capacite: 2,
                equipements: ["TV", "WiFi"],
                prixBase: 20000,
                disponible: true,
              },
              etage: 1,
              superficie: 20,
              equipements: ["TV", "WiFi"],
              statut: "Disponible",
              prixActuel: 20000,
              caracteristiques: {},
            },
            prixTotal: 40000,
            detailTarif: [
              { date: "2024-07-10", prixHT: 18000, prixTTC: 20000, tva: 2000 },
              { date: "2024-07-11", prixHT: 18000, prixTTC: 20000, tva: 2000 },
            ],
          },
        ],
        montantTotal: 40000,
        montantHT: 36000,
        montantTTC: 40000,
        montantTVA: 4000,
        reductionsAppliquees: [],
      },
    ],
    montantTotal: 40000,
    montantHT: 36000,
    montantTTC: 40000,
    montantTVA: 4000,
    montantReductions: 0,
    creePar: "admin",
    modifiePar: "admin",
    notes: "Séjour test",
  },
];
