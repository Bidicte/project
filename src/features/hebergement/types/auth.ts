// types/auth.ts
export interface User {
idUtilisateur: string;
  nomUtilisateur: string;
  motDePasse: string | null;
  couleurArrierePlan: string;
  photoProfil: string;
  email: string;
  prenom: string;
  nom: string;
  numeroTelephone: string;
  adresse: string;
  dateCreation: string | null ;// ou Date | null selon ton usage
  dateModification: string | null; // ou Date | null
  idClient: string;
  statut: "Actif" | "Inactif" | string; // adapte selon tes statuts possibles
  role:string;
}

export interface Client {
  clientId: string
  clientSecret: string | null
  clientName: string
  clientUrl: string
  logoUrl: string
  description: string | null
  adresse: string | null
  telephone: string | null
  email: string | null
  dateCreation: string | null // ou Date | null
  dateModification: string | null // ou Date | null
  statut: "Actif" | "Inactif" | string
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Interface pour les données envoyées à l'API
export interface LoginRequest {
  client: string;      // "chkci" en dur
  username: string;
  Password: string;    // Avec majuscule selon votre API
}

export interface AuthContextType {
  user: User | null;
  client: Client | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}