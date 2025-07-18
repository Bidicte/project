export interface Tarif {
  tarifid: string
  codetarif: string
  codetva: string
  modelocatlibelle: string
  libelletarif: string
  tvaid: number
  modelocatid: number
  ttcactive: number
}

export interface RoomType {
  typepieceid: string
  libellepiece: string
  tarifid: string
}

export interface Room {
  pieceid: string
  piecelibelle: string
  piececode: string
  typepieceid: string
  fonctionnel: boolean
}

export interface RoomState{
  etatpieceid: string,
  etatpiece: boolean,
  dateetat: Date,
  motifetat: string,
  pieceid: string
}
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Types pour les formulaires (avec les données enrichies)
export interface RoomTypeWithTarif extends RoomType {
  tarif?: Tarif // Tarif associé pour l'affichage
}
