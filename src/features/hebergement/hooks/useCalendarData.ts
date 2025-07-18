import { useState, useEffect } from "react"
import { calendarApiService } from "../services/calendarApiService"
import type { TypeDePiece, Piece, Sejour, Chambre, ReservationData , ReservationDto} from "../types/calendar"

export function useCalendarData() {
  const [Inforeservations, setInfoReservations] = useState<ReservationDto[]>([])
  const [typesDePieces, setTypesDePieces] = useState<TypeDePiece[]>([])
  const [pieces, setPieces] = useState<Piece[]>([])
  const [sejours, setSejours] = useState<Sejour[]>([])
  const [chambres, setChambres] = useState<Chambre[]>([])
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour convertir les données API en format utilisable par le composant
  const transformPiecesToChambres = (pieces: Piece[], typesDePieces: TypeDePiece[]): Chambre[] => {
    return pieces.map((piece) => {
      const typePiece = typesDePieces.find((type) => type.typepieceid === piece.typepieceid)
      return {
        id: piece.pieceid,
        numero: piece.piececode,
        type: typePiece?.libellepiece || "Type inconnu",
        typepieceid: piece.typepieceid,
        capacite: 2, // Valeur par défaut, à adapter selon vos besoins
        statut: piece.fonctionnel ? "Disponible" : "Maintenance",
        equipements: [], // À adapter selon vos besoins
        prix: 0, // À récupérer depuis les tarifs si nécessaire
        fonctionnel: piece.fonctionnel,
      }
    })
  }

  const transformSejoursToReservations = (sejours: Sejour[], reservations: ReservationDto[]): ReservationData[] => {
  return sejours.map((sejour) => {
     const inforeservation = reservations.find((res) => res.idReservation === sejour.idReservation)
    const dateArrivee = new Date(sejour.dateArrivee)
    const dateDepart = new Date(sejour.dateDepart)

    const heureArrivee = dateArrivee.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const heureDepart = dateDepart.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })

    return {
      id: sejour.idSejour,
      chambreId: sejour.pieceId,
      client: {
        nom: inforeservation?.typeClient == "Business" ?  inforeservation?.raisonSocial : `${inforeservation?.nomCltSej} ${inforeservation?.prenomCltSej}` , // À adapter selon vos données
        prenom: `N° ${sejour.numSejour}`,
        telephone:  ` ${inforeservation?.telCltSej}  ${inforeservation?.adresseCltSej} ` ,
        email: inforeservation?.emailCltSej || ""
      },
      statut: sejour.statutSejour,
      dateArrivee: sejour.dateArrivee,
      dateDepart: sejour.dateDepart,
      heureArrivee,
      heureDepart,
      typeReservation: sejour.nbrNuitee > 0 ? "Nuitée" : "Passage",
      montantTotal: 0,
      nombrePersonnes: 1,
      note: sejour.noteSejour,
      nbrNuitee: sejour.nbrNuitee,
      numSejour: `${inforeservation?.numReservation} - ${sejour.numSejour}`,
    }
  })
}


  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger les données en parallèle
      const [typesResponse, piecesResponse, sejoursResponse, reservationsResponse] = await Promise.all([
        calendarApiService.getTypesDePieces(),
        calendarApiService.getAllPieces(),
        calendarApiService.getAllSejours(),
        calendarApiService.getAllReservations(), // Assurez-vous que cette méthode est définie dans calendarApiService
      ])

      if (typesResponse && piecesResponse && sejoursResponse) {
        const typesData = typesResponse
        const piecesData = piecesResponse
        const sejoursData = sejoursResponse
        const reservationsData = reservationsResponse

        setTypesDePieces(typesData)
        setPieces(piecesData)
        setSejours(sejoursData)
        setInfoReservations(reservationsData)
        // Transformer les données pour l'interface
        const chambresTransformed = transformPiecesToChambres(piecesData, typesData)
        const reservationsTransformed = transformSejoursToReservations(sejoursData, reservationsData)

        setChambres(chambresTransformed)
        setReservations(reservationsTransformed)
      } else {
        throw new Error("Erreur lors du chargement des données")
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err)
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  return {
    typesDePieces,
    pieces,
    sejours,
    chambres,
    reservations,
    loading,
    error,
    refreshData,
  }
}
