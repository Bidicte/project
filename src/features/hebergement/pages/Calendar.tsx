import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Users,
  MapPin,
  Search,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { useCalendarData } from "../hooks/useCalendarData"
import type { Chambre, ReservationData } from "../types/calendar"
import useReservations from "../hooks/reservations/use-reservations"
import ReservationFormModal from "../components/reservations/reservation-form-modal"
import type { ReservationFormData,Reservation } from "../types/reservation"
import Notification from "../components/clients/notification"
// Fonctions utilitaires (identiques à votre code original)
function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDayShort(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

function isToday(date: Date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isSameDay(date1: Date, date2: Date) {
  return date1.toDateString() === date2.toDateString()
}

export default function Calendar() {
  const {
      createReservation
    } = useReservations();
  const { chambres, reservations, loading, error, refreshData } = useCalendarData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filtreType, setFiltreType] = useState<string>("Tous")
  const [filtreStatut, setFiltreStatut] = useState<string>("Tous")
  const [searchTerm, setSearchTerm] = useState("")
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [selectedDayReservations, setSelectedDayReservations] = useState<{
    chambre: Chambre
    date: Date
    reservations: ReservationData[]
  } | null>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  // Calcul de la semaine
  const startOfWeek = getStartOfWeek(currentDate)
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i))

  // Filtrage des chambres
  const filteredChambres = chambres.filter((chambre) => {
    const matchesType = filtreType === "Tous" || chambre.type === filtreType
    const matchesSearch =
      chambre.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chambre.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Groupement par type
  const groupedChambres = filteredChambres.reduce<Record<string, Chambre[]>>((acc, chambre) => {
    acc[chambre.type] = acc[chambre.type] || []
    acc[chambre.type].push(chambre)
    return acc
  }, {})
const handleCreateReservation = async (data: ReservationFormData) => {
    try {
      await createReservation(data);
      refreshData();
      setShowReservationModal(false);
       setNotification({ type: "success", message: "Réservation créée avec succès !" })
    } catch (error:any) {
      console.error("Erreur lors de la création:", error);
      setNotification({ type: "error", message: error || "Erreur lors de la création de la réservation." })
    }
  };

  // Trouver les réservations pour une chambre et un jour
  function getReservationsForDay(chambreId: string, day: Date) {
    return reservations
      .filter((reservation) => {
        const dateArrivee = new Date(reservation.dateArrivee)
        const dateDepart = new Date(reservation.dateDepart)
        if (reservation.typeReservation === "Passage") {
          return isSameDay(dateArrivee, day)
        } else {
          if (isSameDay(dateArrivee, dateDepart)) {
            return isSameDay(dateArrivee, day)
          }
          return dateArrivee <= day && day < dateDepart
        }
      })
      .filter((r) => r.chambreId === chambreId)
  }
function fusionnerSejoursSimilaires(reservations: ReservationData[]): ReservationData[] {
  if (reservations.length === 0) return []

  const sorted = [...reservations].sort((a, b) =>
    new Date(a.dateArrivee).getTime() - new Date(b.dateArrivee).getTime()
  )

  const fusionnés: ReservationData[] = []
  let current = { ...sorted[0] }

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]

    const estPareil =
      current.id === next.id &&
      current.client.email === next.client.email &&
      current.statut === next.statut &&
      new Date(current.dateDepart).toISOString() === new Date(next.dateArrivee).toISOString()

    if (estPareil) {
      current = {
        ...current,
        dateDepart: next.dateDepart,
        nbrNuitee: current.nbrNuitee + next.nbrNuitee,
        montantTotal: current.montantTotal + next.montantTotal,
      }
    } else {
      fusionnés.push(current)
      current = { ...next }
    }
  }

  fusionnés.push(current)
  return fusionnés
}

  // Vérifier si deux réservations se chevauchent dans le temps
  function reservationsOverlap(res1: ReservationData, res2: ReservationData, day: Date) {
    const date1Arrivee = new Date(res1.dateArrivee)
    const date1Depart = new Date(res1.dateDepart)
    const date2Arrivee = new Date(res2.dateArrivee)
    const date2Depart = new Date(res2.dateDepart)

    const res1OnThisDay =
      isSameDay(date1Arrivee, day) || (res1.typeReservation === "Nuitée" && date1Arrivee <= day && day < date1Depart)
    const res2OnThisDay =
      isSameDay(date2Arrivee, day) || (res2.typeReservation === "Nuitée" && date2Arrivee <= day && day < date2Depart)

    if (!res1OnThisDay || !res2OnThisDay) return false

    const parseTime = (timeStr?: string) => {
      if (!timeStr) return null
      const [hours, minutes] = timeStr.split(":").map(Number)
      return hours * 60 + minutes
    }

    const res1Start = parseTime(res1.heureArrivee)
    const res1End = parseTime(res1.heureDepart)
    const res2Start = parseTime(res2.heureArrivee)
    const res2End = parseTime(res2.heureDepart)

    if (!res1Start || !res1End || !res2Start || !res2End) return true

    let res1EndAdjusted = res1End
    let res2EndAdjusted = res2End

    if (res1.typeReservation === "Nuitée" && !isSameDay(date1Depart, day)) {
      res1EndAdjusted = 24 * 60
    }
    if (res2.typeReservation === "Nuitée" && !isSameDay(date2Depart, day)) {
      res2EndAdjusted = 24 * 60
    }

    return !(res1EndAdjusted <= res2Start || res2EndAdjusted <= res1Start)
  }

  // Obtenir la couleur selon le statut
  function getStatusColor(statut: string) {
    switch (statut) {
      case "Confirmée":
        return "bg-blue-500 text-white border-blue-600"
      case "Check-in":
        return "bg-green-500 text-white border-green-600"
      case "Check-out":
        return "bg-purple-500 text-white border-purple-600"
      case "Brouillon":
        return "bg-yellow-400 text-gray-800 border-yellow-500"
      case "Annulée":
        return "bg-red-400 text-white border-red-500"
      default:
        return "bg-gray-300 text-gray-700 border-gray-400"
    }
  }

  function prevWeek() {
    setCurrentDate(addDays(currentDate, -7))
  }

  function nextWeek() {
    setCurrentDate(addDays(currentDate, 7))
  }

  const typesChambres = Array.from(new Set(chambres.map((c) => c.type)))

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen bg-gray-50">
      {/* <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Planning des Chambres</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshData}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Réservation
              </button>
            </div>
          </div>
        </div>
      </div> */}
<div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Planning hebergement</h1>
          <p className="text-gray-600">Suivez les occupations des chambres</p>
        </div>
        <div className="flex gap-2">
           <button
                onClick={refreshData}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </button>
          <button  
          onClick={() => setShowReservationModal(true)}     
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
           <Plus className="w-4 h-4 mr-2" />
                Nouvelle Réservation
          </button>
        </div>
      </div>
      <div className="mx-auto min-h-screen">
        {/* Contrôles de navigation et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Navigation semaine */}
            <div className="flex items-center space-x-4">
              <button onClick={prevWeek} className="p-2 rounded-md hover:bg-gray-100 border border-gray-200">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-lg font-semibold text-gray-900">{formatDate(startOfWeek)}</div>
              <button onClick={nextWeek} className="p-2 rounded-md hover:bg-gray-100 border border-gray-200">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher une chambre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Tous">Tous les types</option>
                {typesChambres.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
     
        {/* Légende */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Légende des statuts</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { statut: "Confirmée", label: "Confirmée" },
              { statut: "Check-in", label: "Check-in" },
              { statut: "Check-out", label: "Check-out" },
              { statut: "Brouillon", label: "Brouillon" },
              { statut: "Annulée", label: "Annulée" },
              { statut: "Réservé", label: "Réservé" },
            ].map(({ statut, label }) => (
              <div key={statut} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${getStatusColor(statut)}`}></div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Planning par type de chambre */}
        {Object.entries(groupedChambres).map(([type, chambresType]) => (
          <div key={type} className="mb-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  {type} ({chambresType.length} chambres)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Chambre
                      </th>
                      {daysOfWeek.map((day) => (
                        <th
                          key={day.toISOString()}
                          className={`px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 ${
                            isToday(day) ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>{formatDayShort(day)}</span>
                            {isToday(day) && <span className="text-blue-600 font-bold">Aujourd'hui</span>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chambresType.map((chambre) => (
                      <tr key={chambre.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">{chambre.numero}</div>
                            <div className="text-xs text-gray-500">
                              <Users className="w-3 h-3 inline mr-1" />
                              {chambre.capacite} pers.
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                chambre.fonctionnel ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {chambre.fonctionnel ? "Fonctionnel" : "Hors service"}
                            </div>
                          </div>
                        </td>
                        {daysOfWeek.map((day) => {
                          const reservationsDay = fusionnerSejoursSimilaires(
  getReservationsForDay(chambre.id, day).filter((r) => r.statut !== "Annulée")
)

                          const nonOverlappingGroups: ReservationData[][] = []
                          reservationsDay.forEach((reservation) => {
                            let addedToGroup = false
                            for (const group of nonOverlappingGroups) {
                              const overlapsWithGroup = group.some((res) => reservationsOverlap(reservation, res, day))
                              if (!overlapsWithGroup) {
                                group.push(reservation)
                                addedToGroup = true
                                break
                              }
                            }
                            if (!addedToGroup) {
                              nonOverlappingGroups.push([reservation])
                            }
                          })

                          return (
                            <td
                              key={day.toISOString()}
                              className={`relative w-32 p-1 ${isToday(day) ? "bg-blue-50" : ""}`}
                              style={{
                                height: Math.max(80, nonOverlappingGroups.length * 40 + 20) + "px",
                              }}
                            >
                              {nonOverlappingGroups.length > 0 ? (
                                nonOverlappingGroups.map((group, groupIndex) => {
                                  const mainReservation = group[0]
                                  const hasMultiple = group.length > 1
                                  return (
                                    <div
                                      key={groupIndex}
                                      className={`absolute left-1 right-1 rounded-md border-2 flex flex-col justify-center p-1 cursor-pointer transition-all hover:shadow-md ${getStatusColor(
                                        mainReservation.statut,
                                      )}`}
                                      style={{
                                        top: `${4 + groupIndex * 40}px`,
                                        height: "60px",
                                      }}
                                      onClick={() => {
                                        const allReservationsForDay = fusionnerSejoursSimilaires(
                                            getReservationsForDay(chambre.id, day).filter((r) => r.statut !== "Annulée")
                                          )
                                        setSelectedDayReservations({
                                          chambre,
                                          date: day,
                                          reservations: allReservationsForDay,
                                        })
                                      }}
                                      title={
                                        hasMultiple
                                          ? `${group.length} réservations`
                                          : `Séjour ${mainReservation.numSejour}\n${mainReservation.statut}\n${mainReservation.typeReservation}`
                                      }
                                    >
                                      <div className="text-xs font-medium truncate">
                                        {hasMultiple
                                          ? `${group.length} séjours`
                                          : `Séjour ${mainReservation.numSejour}`}
                                      </div>
                                      <div className="text-xs opacity-90 flex items-center justify-between">
                                        <div className="flex items-center">
                                          <Users className="w-3 h-3 mr-1" />
                                          {hasMultiple
                                            ? group.reduce((sum, r) => sum + r.nombrePersonnes, 0)
                                            : mainReservation.nombrePersonnes}
                                        </div>
                                        {mainReservation.nbrNuitee > 0 && (
                                          <div className="flex items-center">
                                            <span className="text-xs">{mainReservation.nbrNuitee}n</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="absolute inset-1 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:bg-gray-50 cursor-pointer">
                                  <Plus className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détail des séjours du jour */}
      {selectedDayReservations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Séjours du {selectedDayReservations.date.toLocaleDateString("fr-FR")}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chambre {selectedDayReservations.chambre.numero} - {selectedDayReservations.reservations.length}{" "}
                    séjour(s)
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDayReservations(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {selectedDayReservations.reservations.length > 0 ? (
                  <div className="space-y-4">
                    {selectedDayReservations.reservations.map((reservation, index) => (
                      <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-900">Séjour #{reservation.numSejour}</span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(reservation.statut)}`}>
                              {reservation.statut}
                            </span>
                          </div>
                          {/* <div className="flex space-x-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div> */}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">                        
                          <div>
                            <span className="text-gray-600">Client:</span>
                            <p className="font-medium">
                              {reservation.client.prenom} {reservation.client.nom}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Adresse et contact :</span>
                            <p className="font-medium">
                              {reservation.client.telephone}
                            </p>
                             <p className="font-medium">
                              {reservation.client.email}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <p className="font-medium">{reservation.typeReservation}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Période:</span>
                            <p className="font-medium">
                              {new Date(reservation.dateArrivee).toLocaleDateString("fr-FR")} -
                              {new Date(reservation.dateDepart).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Nuitées:</span>
                            <p className="font-medium">{reservation.nbrNuitee}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Personnes:</span>
                            <p className="font-medium flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {reservation.nombrePersonnes}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Montant:</span>
                            <p className="font-medium">{reservation.montantTotal.toLocaleString()} FCFA</p>
                          </div>
                        </div>

                        {reservation.heureArrivee && reservation.heureDepart && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-600">Horaires:</span>
                            <p className="font-medium">
                              {reservation.heureArrivee} - {reservation.heureDepart}
                            </p>
                          </div>
                        )}

                        {reservation.note && (
                          <div className="mt-3">
                            <span className="text-sm text-gray-600">Note:</span>
                            <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-2 rounded">{reservation.note}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun séjour pour cette date</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedDayReservations(null)}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Fermer
                </button>
                {/* <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau séjour
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}
{/* Notifications */}
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}
      {/* Modal de réservation */}
            <ReservationFormModal
              isOpen={showReservationModal}
              onClose={() => {
                setShowReservationModal(false);
                setEditingReservation(null);
              }}
              onSubmit={ handleCreateReservation}
              initialData={
                editingReservation
                  ? {
                      reservant: editingReservation.reservant,
                      clientHeberge: editingReservation.clientHeberge,
                      bonReductionId: editingReservation.bonReduction?.id,
                      sejours: editingReservation.sejours.map((sejour) => ({
                        dateArrivee: sejour.dateArrivee,
                        dateDepart: sejour.dateDepart,
                        typePieceId: sejour.typePieceId,
                        piecesIds: sejour.piecesSelectionnees.map((p) => p.pieceId),
                        note: sejour.note,
                      })),
                    }
                  : undefined
              }
              isEditing={!!editingReservation}
            />
    </div>
  )
}
