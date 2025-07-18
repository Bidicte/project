// Types pour les données de l'API
export interface TypeDePiece {
  typepieceid: string
  libellepiece: string
  tarifid: string
}

export interface Piece {
  pieceid: string
  piecelibelle: string
  piececode: string
  typepieceid: string
  fonctionnel: boolean
}

export interface Sejour {
  idSejour: string
  dateArrivee: string
  dateDepart: string
  nbrNuitee: number
  noteSejour: string
  pieceId: string
  idReservation: string
  numSejour: number
  tarifId: string
  idSejourPrec: string
  pieceIdPrec: string
  motifDelogement: string
  dateDelogement: string
  motifDelogId: string
  statutSejour: string
}

export interface ReservationDto {
  idReservation: string
  numReservation: string
  reservAvance: boolean
  dateReserv: string // ou Date si tu la convertis après réception
  nomPrenomReservant: string
  telReservant: string
  emailReservant: string
  nomCltSej: string
  prenomCltSej: string
  adresseCltSej: string
  emailCltSej: string
  telCltSej: string
  paysCltSej: string
  villeCltSej: string
  raisonSocial: string
  idBon: string
  typeClient: string
}


// Types adaptés pour l'interface
export interface Chambre {
  id: string
  numero: string
  type: string
  typepieceid: string
  capacite: number
  statut: "Disponible" | "Occupée" | "Maintenance" | "Nettoyage"
  equipements: string[]
  prix: number
  fonctionnel: boolean
}

export interface ReservationData {
  id: string
  chambreId: string
  client: {
    nom: string
    prenom: string
    telephone: string
    email: string
  }
  statut: string
  dateArrivee: string
  dateDepart: string
  heureArrivee?: string
  heureDepart?: string
  typeReservation: "Nuitée" | "Passage"
  montantTotal: number
  nombrePersonnes: number
  note?: string
  nbrNuitee: number
  numSejour: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}
