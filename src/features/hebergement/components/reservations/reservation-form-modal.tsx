import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
  Users,
  Building,
  Calendar,
  Plus,
  Trash2,
  Save,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Edit,
  Bed,
  DollarSign,
} from "lucide-react";
import ClientSelector from "./client-selector";
import DateRangePicker from "./date-range-picker";
import RoomSelection from "./room-selection";
import InvoicePreview from "./invoice-preview";
import SejourFormModal from "./sejour-form-modal";
import {
  useReservations,
  useDisponibilites,
  useSimulationTarif,
} from "../../hooks/reservations/use-reservations";
import type {
  ReservationFormData,
  ReservationFormErrors,
  Reservant,
  ClientHeberge,
  TypePieceDisponible,
  PieceDisponible,
} from "../../types/reservation";
import { periodesChevauchent } from "../../utils/api.utils";

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReservationFormData) => Promise<void>;
  initialData?: Partial<ReservationFormData>;
  isEditing?: boolean;
}

interface SejourRow {
  id: string;
  dateArrivee: string;
  dateDepart: string;
  heureArrivee?: string;
  heureDepart?: string;
  typeChambreId: string;
  typeChambreNom?: string;
  tarifId: string;
  tarifNom?: string;
  tarifType?: "nuitee" | "passage";
  tarifPrix?: number;
  nombrePersonnes: number;
  nombreUnites: number;
  piecesIds: string[];
  note?: string;
  chambresSelectionnees: string[];
  // Nouvelles propriétés pour l'affichage enrichi
  roomCodes?: string[];
  roomNames?: string[];
  tarifCodes?: string[];
  tarifIds?: string[];
  tarifNames?: string[];
}

export default function ReservationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
}: ReservationFormModalProps) {
  // États pour les données du formulaire
  const [reservant, setReservant] = useState<Reservant>({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    dateReservation: new Date().toISOString().split("T")[0],
    reservationAvance: false,
    ...initialData?.reservant,
  });

  const [clientHeberge, setClientHeberge] = useState<ClientHeberge>({
    nom: "",
    prenom: "",
    adresse: "",
    email: "",
    telephone: "",
    pays: "",
    ville: "",
    raisonSociale: "",
    typeClient: "Occasionnel",
    bonReductionId: "",
    ...initialData?.clientHeberge,
  });

  const [sejours, setSejours] = useState<SejourRow[]>([]);

  const [bonReductionCode, setBonReductionCode] = useState("");
  const [bonReductionApplique, setBonReductionApplique] = useState<{
    id: string;
    code: string;
    nom: string;
    description: string;
    montant: number;
  } | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [showSejourModal, setShowSejourModal] = useState(false);
  const [editingSejourIndex, setEditingSejourIndex] = useState<number | null>(
    null
  );
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationAvanceFields, setReservationAvanceFields] = useState({
    dateEvenement: "",
    typeEvenement: "",
    nombrePersonnes: "",
  });

  // Hooks
  const { typesPiecesDisponibles, fetchTypesPiecesDisponibles } =
    useDisponibilites();
  const {
    simulation,
    simulerTarif,
    loading: simulationLoading,
  } = useSimulationTarif();

  // Effet pour la simulation automatique
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const sejoursValides = sejours.filter(
        (sejour) =>
          sejour.dateArrivee &&
          sejour.dateDepart &&
          sejour.typeChambreId &&
          sejour.tarifId
      );

      if (sejoursValides.length > 0) {
        simulerTarif({
          sejours: sejoursValides.map((sejour) => ({
            dateArrivee: sejour.dateArrivee,
            dateDepart: sejour.dateDepart,
            typePieceId: sejour.typeChambreId,
            tarifId: sejour.tarifId,
            nombrePersonnes: sejour.nombrePersonnes,
            nombreUnites: sejour.nombreUnites,
            piecesIds: sejour.piecesIds,
          })),
          bonReductionId: clientHeberge.bonReductionId,
          typeClient: clientHeberge.typeClient,
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    sejours,
    clientHeberge.bonReductionId,
    clientHeberge.typeClient,
    simulerTarif,
  ]);

  // Utilitaire pour calculer le nombre de nuits
  function calculateNights(startDate: string, endDate: string) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Utilitaire pour calculer le nombre d'heures entières (pour passage)
  function calculateTotalHours(
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string
  ) {
    if (!startDate || !endDate || !startTime || !endTime) return 0;
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);
    const diffMilliseconds = endDateTime.getTime() - startDateTime.getTime();
    const diffHours = diffMilliseconds / (1000 * 60 * 60);
    return Math.ceil(diffHours);
  }

  // Gestionnaires d'événements
  const handleClientSelect = (clientData: Partial<ClientHeberge>) => {
    setClientHeberge((prev) => ({ ...prev, ...clientData }));
  };

  const handleAddSejour = () => {
    setEditingSejourIndex(null);
    setShowSejourModal(true);
  };

  const handleEditSejour = (index: number) => {
    setEditingSejourIndex(index);
    setShowSejourModal(true);
  };

  const handleSejourSubmit = (data: any) => {
    console.log("📝 Données enrichies reçues dans handleSejourSubmit:", data);

    if (editingSejourIndex !== null) {
      // Modification - on met à jour le séjour existant
      const updatedSejour: SejourRow = {
        ...sejours[editingSejourIndex],
        dateArrivee: data.dateArrivee,
        dateDepart: data.dateDepart,
        heureArrivee: data.heureArrivee,
        heureDepart: data.heureDepart,
        typeChambreId: data.typeChambreId,
        typeChambreNom: data.typeChambreNom || "Type inconnu",
        tarifId: data.tarifId,
        tarifNom: data.tarifNom || "Tarif inconnu",
        tarifType: data.tarifType || "nuitee",
        tarifPrix: data.tarifPrix || 0,
        nombrePersonnes: data.nombrePersonnes,
        nombreUnites: data.nombreUnites,
        piecesIds: data.piecesIds,
        note: data.note,
        chambresSelectionnees: data.chambresSelectionnees,
        // Ajouter les données enrichies
        roomCodes: data.roomCodes || [],
        roomNames: data.roomNames || [],
        tarifCodes: data.tarifCodes || [],
        tarifIds: data.tarifIds || [],
        tarifNames: data.tarifNames || [],
      };

      console.log("✏️ Séjour modifié:", updatedSejour);
      setSejours((prev) =>
        prev.map((sejour, index) =>
          index === editingSejourIndex ? updatedSejour : sejour
        )
      );
    } else {
      // Ajout - créer un séjour distinct pour chaque chambre sélectionnée
      const nouveauxSejours: SejourRow[] = data.chambresSelectionnees.map(
        (chambreId: string, index: number) => ({
          id: `${Date.now()}-${index}`,
          dateArrivee: data.dateArrivee,
          dateDepart: data.dateDepart,
          heureArrivee: data.heureArrivee,
          heureDepart: data.heureDepart,
          typeChambreId: data.typeChambreId,
          typeChambreNom: data.typeChambreNom || "Type inconnu",
          tarifId: data.tarifId,
          tarifNom: data.tarifNom || "Tarif inconnu",
          tarifType: data.tarifType || "nuitee",
          tarifPrix: data.tarifPrix || 0,
          nombrePersonnes: data.nombrePersonnes,
          nombreUnites: data.nombreUnites || 1,
          piecesIds: [chambreId],
          note: data.note,
          chambresSelectionnees: [chambreId], // Une seule chambre par séjour
          // Ajouter les données enrichies pour chaque chambre individuelle
          roomCodes: data.roomCodes ? [data.roomCodes[index]] : [],
          roomNames: data.roomNames ? [data.roomNames[index]] : [],
          tarifCodes: data.tarifCodes || [],
          tarifIds: data.tarifIds || [],
          tarifNames: data.tarifNames || [],
        })
      );

      console.log("✅ Nouveaux séjours créés:", nouveauxSejours);
      setSejours((prev) => [...prev, ...nouveauxSejours]);
    }

    setShowSejourModal(false);
    setEditingSejourIndex(null);
  };

  const removeSejourRow = (id: string) => {
    setSejours((prev) => prev.filter((sejour) => sejour.id !== id));
  };

  const updateSejourRow = (id: string, field: keyof SejourRow, value: any) => {
    if (field === "piecesIds" && Array.isArray(value) && value.length > 1) {
      // Si on sélectionne plusieurs pièces, créer un séjour séparé pour chaque pièce
      const sejourOriginal = sejours.find((s) => s.id === id);
      if (sejourOriginal) {
        const nouveauxSejours = value.map((pieceId, index) => ({
          ...sejourOriginal,
          id: index === 0 ? id : `${id}_piece_${index}`,
          piecesIds: [pieceId],
        }));

        setSejours((prev) => [
          ...prev.filter((s) => s.id !== id),
          ...nouveauxSejours,
        ]);
        return;
      }
    }

    setSejours((prev) =>
      prev.map((sejour) =>
        sejour.id === id ? { ...sejour, [field]: value } : sejour
      )
    );
  };

  // Fonction pour créer des séjours séparés pour chaque pièce
  const createIndividualSejours = (sejour: SejourRow): SejourRow[] => {
    if (sejour.piecesIds.length <= 1) {
      return [sejour];
    }

    return sejour.piecesIds.map((pieceId, index) => ({
      ...sejour,
      id: `${sejour.id}_${index}`,
      piecesIds: [pieceId],
    }));
  };

  const handleDateRangeChange = async (
    sejourId: string,
    dateRange: { startDate: string; endDate: string }
  ) => {
    updateSejourRow(sejourId, "dateArrivee", dateRange.startDate);
    updateSejourRow(sejourId, "dateDepart", dateRange.endDate);

    if (dateRange.startDate && dateRange.endDate) {
      await fetchTypesPiecesDisponibles(dateRange.startDate, dateRange.endDate);
    }
  };

  const getPiecesDisponiblesForSejour = async (sejourId: string) => {
    const sejour = sejours.find((s) => s.id === sejourId);
    if (!sejour?.dateArrivee || !sejour?.dateDepart || !sejour?.piecesIds) {
      return;
    }

    try {
      // Récupérer les pièces disponibles pour ce type et cette période
      await fetchTypesPiecesDisponibles(sejour.dateArrivee, sejour.dateDepart);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des pièces disponibles:",
        error
      );
    }
  };

  const handleBonReductionVerification = async () => {
    if (!bonReductionCode.trim()) return;

    try {
      // Simuler la vérification d'un bon de réduction
      // TODO: Remplacer par un vrai appel API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulation d'un bon valide
      setBonReductionApplique({
        id: "bon123",
        code: bonReductionCode,
        nom: "Réduction été",
        description: "10% de réduction sur le séjour",
        montant: 50,
      });

      setClientHeberge((prev) => ({ ...prev, bonReductionId: "bon123" }));
    } catch (error) {
      console.error("Erreur lors de la vérification du bon:", error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ReservationFormErrors = {};

    // Validation du réservant (seulement si réservation en avance)
    if (reservant.reservationAvance) {
      if (!reservant.nom.trim()) {
        newErrors.reservant = {
          ...newErrors.reservant,
          nom: "Le nom est requis",
        };
      }
      if (!reservant.prenom.trim()) {
        newErrors.reservant = {
          ...newErrors.reservant,
          prenom: "Le prénom est requis",
        };
      }
      if (!reservant.telephone.trim()) {
        newErrors.reservant = {
          ...newErrors.reservant,
          telephone: "Le téléphone est requis",
        };
      }
      if (!reservant.email.trim()) {
        newErrors.reservant = {
          ...newErrors.reservant,
          email: "L'email est requis",
        };
      }
    }

    // Validation réservation en avance
    // if (reservant.reservationAvance) {
    //   if (!reservationAvanceFields.dateEvenement) {
    //     newErrors.reservant = {
    //       ...newErrors.reservant,
    //       dateEvenement: "La date d'événement est requise",
    //     };
    //   }
    //   if (!reservationAvanceFields.typeEvenement.trim()) {
    //     newErrors.reservant = {
    //       ...newErrors.reservant,
    //       typeEvenement: "Le type d'événement est requis",
    //     };
    //   }
    //   if (!reservationAvanceFields.nombrePersonnes.trim()) {
    //     newErrors.reservant = {
    //       ...newErrors.reservant,
    //       nombrePersonnes: "Le nombre de personnes est requis",
    //     };
    //   }
    // }

    // Validation du client hébergé
    if (clientHeberge.typeClient !== "Business" && !clientHeberge.nom.trim()) {
      newErrors.clientHeberge = {
        ...newErrors.clientHeberge,
        nom: "Le nom est requis",
      };
    }
    if (
      clientHeberge.typeClient !== "Business" &&
      !clientHeberge.prenom.trim()
    ) {
      newErrors.clientHeberge = {
        ...newErrors.clientHeberge,
        prenom: "Le prénom est requis",
      };
    }
    if (
      clientHeberge.typeClient === "Business" &&
      !clientHeberge.raisonSociale?.trim()
    ) {
      newErrors.clientHeberge = {
        ...newErrors.clientHeberge,
        raisonSociale: "La raison sociale est requise",
      };
    }

    // Validation des séjours
    if (sejours.length === 0) {
      newErrors.general = "Au moins un séjour doit être ajouté";
    }

    sejours.forEach((sejour, index) => {
      if (!sejour.dateArrivee) {
        newErrors.sejours = {
          ...newErrors.sejours,
          [index]: {
            ...newErrors.sejours?.[index],
            dateArrivee: "La date d'arrivée est requise",
          },
        };
      }
      if (!sejour.dateDepart) {
        newErrors.sejours = {
          ...newErrors.sejours,
          [index]: {
            ...newErrors.sejours?.[index],
            dateDepart: "La date de départ est requise",
          },
        };
      }
      if (!sejour.typeChambreId) {
        newErrors.sejours = {
          ...newErrors.sejours,
          [index]: {
            ...newErrors.sejours?.[index],
            typePieceId: "Le type de chambre est requis",
          },
        };
      }
      if (!sejour.tarifId) {
        newErrors.sejours = {
          ...newErrors.sejours,
          [index]: {
            ...newErrors.sejours?.[index],
            tarifId: "Le tarif est requis",
          },
        };
      }
      if (sejour.nombrePersonnes < 1) {
        newErrors.sejours = {
          ...newErrors.sejours,
          [index]: {
            ...newErrors.sejours?.[index],
            nombrePersonnes: "Le nombre de personnes est requis",
          },
        };
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Formater les séjours pour la soumission
      const formattedSejours = sejours.map((sejour) => ({
        dateArrivee: sejour.dateArrivee,
        dateDepart: sejour.dateDepart,
        heureArrivee: sejour.heureArrivee,
        heureDepart: sejour.heureDepart,
        typePieceId: sejour.typeChambreId,
        tarifId: sejour.tarifId,
        nombrePersonnes: sejour.nombrePersonnes,
        nombreUnites: sejour.nombreUnites,
        piecesIds: sejour.piecesIds,
        chambreId: sejour.chambresSelectionnees?.[0] || sejour.piecesIds?.[0],
        note: sejour.note,
      }));

      const formData: ReservationFormData = {
        reservant: {
          ...reservant,
          ...(reservant.reservationAvance ? reservationAvanceFields : {}),
        },
        clientHeberge,
        bonReductionId: clientHeberge.bonReductionId,
        sejours: formattedSejours,
      };

      // Console.log des données qui seront envoyées à l'API
      console.log("=== DONNÉES ENVOYÉES À L'API ===");
      console.log(JSON.stringify(formData, null, 2));

      // Calcul du total avec TVA pour simulation
      // const totalCalculation = calculateGlobalTotal(formData);
      // console.log("=== SIMULATION FACTURE ===");
      // console.log(JSON.stringify(totalCalculation, null, 2));

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // On enrichit la liste avec les périodes pour chaque chambre déjà affectée sur une période qui chevauche
  let chambresDejaAffectees: {
    pieceid: string;
    dateArrivee: string;
    dateDepart: string;
  }[] = [];
  const currentSejour =
    editingSejourIndex !== null ? sejours[editingSejourIndex] : null;
  if (currentSejour) {
    chambresDejaAffectees = sejours
      .filter(
        (s, idx) =>
          idx !== editingSejourIndex &&
          periodesChevauchent(
            s.dateArrivee,
            s.dateDepart,
            currentSejour.dateArrivee,
            currentSejour.dateDepart
          )
      )
      .flatMap((s) =>
        (s.chambresSelectionnees || s.piecesIds || []).map((pieceid) => ({
          pieceid,
          dateArrivee: s.dateArrivee,
          dateDepart: s.dateDepart,
        }))
      );
  }

  // Mapping du nombre de chambres déjà affectées par type (hors séjour en cours d'édition)
  const chambresParTypeAffectees: Record<string, number> = {};
  sejours.forEach((s, idx) => {
    if (idx !== editingSejourIndex) {
      chambresParTypeAffectees[s.typeChambreId] =
        (chambresParTypeAffectees[s.typeChambreId] || 0) +
        (s.chambresSelectionnees?.length || s.piecesIds?.length || 0);
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        {/* En-tête modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Modifier la réservation" : "Nouvelle réservation"}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowInvoicePreview(!showInvoicePreview)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showInvoicePreview ? "Masquer" : "Prévisualiser"} la facture
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Formulaire principal */}
            <div
              className={`${
                showInvoicePreview ? "w-7/12" : "w-full"
              } overflow-y-auto`}
            >
              <form
                id="reservation-form"
                onSubmit={handleSubmit}
                className="p-6 space-y-8"
              >
                {/* Bloc 1: Informations du réservant */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <User className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informations du réservant
                    </h2>
                  </div>

                  {/* Checkbox réservation en avance */}
                  <div className="mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reservationAvance"
                        checked={reservant.reservationAvance}
                        onChange={(e) =>
                          setReservant((prev) => ({
                            ...prev,
                            reservationAvance: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="reservationAvance"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Réservation à l'avance
                      </label>
                    </div>
                  </div>

                  {/* Champs du réservant conditionnels */}
                  {reservant.reservationAvance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          value={reservant.nom}
                          onChange={(e) =>
                            setReservant((prev) => ({
                              ...prev,
                              nom: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.reservant?.nom
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nom du réservant"
                        />
                        {errors.reservant?.nom && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.reservant.nom}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          value={reservant.prenom}
                          onChange={(e) =>
                            setReservant((prev) => ({
                              ...prev,
                              prenom: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.reservant?.prenom
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Prénom du réservant"
                        />
                        {errors.reservant?.prenom && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.reservant.prenom}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          value={reservant.telephone}
                          onChange={(e) =>
                            setReservant((prev) => ({
                              ...prev,
                              telephone: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.reservant?.telephone
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Numéro de téléphone"
                        />
                        {errors.reservant?.telephone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.reservant.telephone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={reservant.email}
                          onChange={(e) =>
                            setReservant((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.reservant?.email
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Adresse email"
                        />
                        {errors.reservant?.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.reservant.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de réservation
                        </label>
                        <input
                          type="date"
                          value={reservant.dateReservation}
                          onChange={(e) =>
                            setReservant((prev) => ({
                              ...prev,
                              dateReservation: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bloc 3: Séjours */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-6 h-6 text-purple-600 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Séjours
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSejour}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un séjour
                    </button>
                  </div>

                  {/* Liste des séjours */}
                  {sejours.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-2">Aucun séjour ajouté</p>
                      <p className="text-sm text-gray-400">
                        Cliquez sur le bouton "Ajouter un séjour" ci-dessus pour
                        commencer
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sejours.map((sejour, index) => (
                        <div
                          key={sejour.id}
                          className={`relative rounded-xl shadow border-l-8 ${
                            sejour.tarifType === "nuitee"
                              ? "border-blue-500"
                              : "border-orange-500"
                          } bg-white p-5 flex flex-col transition-all hover:shadow-lg`}
                        >
                          {/* Actions */}
                          <div className="absolute top-3 right-3 flex space-x-2 z-10">
                            <button
                              type="button"
                              onClick={() => handleEditSejour(index)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSejourRow(sejour.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Dates */}
                          <div className="flex items-center mb-2">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="font-semibold text-sm leading text-gray-900">
                              {sejour.dateArrivee
                                ? new Date(
                                    sejour.dateArrivee
                                  ).toLocaleDateString("fr-FR")
                                : "Date non définie"}
                              {" → "}
                              {sejour.dateDepart
                                ? new Date(
                                    sejour.dateDepart
                                  ).toLocaleDateString("fr-FR")
                                : "Date non définie"}
                            </span>
                            {sejour.heureArrivee && sejour.heureDepart && (
                              <span className="ml-2 text-xs text-orange-600 font-bold">
                                {sejour.heureArrivee} - {sejour.heureDepart}
                              </span>
                            )}
                          </div>

                          {/* Type & tarif */}
                          <div className="mb-2 flex items-center space-x-2">
                            <Bed className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-blue-700">
                              {sejour.typeChambreNom}
                            </span>
                            <span className="text-xs text-gray-500">
                              {sejour.tarifType === "nuitee"
                                ? "Nuitée"
                                : "Passage"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {sejour.tarifCodes?.[0] || sejour.tarifNom}
                            </span>
                          </div>

                          {/* Chambres */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {(
                              sejour.roomCodes ||
                              sejour.chambresSelectionnees ||
                              []
                            ).map((code, i) => (
                              <span
                                key={code + i}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                              >
                                Ch. {code}
                              </span>
                            ))}
                          </div>

                          {/* Résumé */}
                          <div className="flex items-center text-sm text-gray-700 mb-2">
                            {sejour.tarifType === "nuitee"
                              ? `${calculateNights(
                                  sejour.dateArrivee,
                                  sejour.dateDepart
                                )} nuitée(s)`
                              : `${calculateTotalHours(
                                  sejour.dateArrivee,
                                  sejour.heureArrivee || "",
                                  sejour.dateDepart,
                                  sejour.heureDepart || ""
                                )}h`}
                          </div>

                          {/* Note */}
                          {sejour.note && (
                            <div className="mt-2 italic text-xs text-gray-500 border-t pt-2">
                              {sejour.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bloc 2: Informations du client hébergé */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <Building className="w-6 h-6 text-green-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Informations du client hébergé
                    </h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de client *
                    </label>
                    <select
                      value={clientHeberge.typeClient}
                      onChange={(e) =>
                        setClientHeberge((prev) => ({
                          ...prev,
                          typeClient: e.target.value as
                            | "Régulier"
                            | "Business"
                            | "Occasionnel",
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Régulier">Régulier</option>
                      <option value="Business">Business</option>
                      <option value="Occasionnel">Occasionnel</option>
                    </select>
                  </div>

                  {(clientHeberge.typeClient === "Régulier" ||
                    clientHeberge.typeClient === "Business") && (
                    <div className="mb-6">
                      <ClientSelector
                        typeClient={clientHeberge.typeClient}
                        onClientSelect={handleClientSelect}
                      />
                    </div>
                  )}

                  {/* Formulaire client manuel (toujours visible pour permettre les modifications) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {clientHeberge.typeClient === "Business" ? (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Raison sociale *
                        </label>
                        <input
                          type="text"
                          value={clientHeberge.raisonSociale || ""}
                          onChange={(e) =>
                            setClientHeberge((prev) => ({
                              ...prev,
                              raisonSociale: e.target.value,
                            }))
                          }
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.clientHeberge?.raisonSociale
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Nom de l'entreprise"
                        />
                        {errors.clientHeberge?.raisonSociale && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.clientHeberge.raisonSociale}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            value={clientHeberge.nom}
                            onChange={(e) =>
                              setClientHeberge((prev) => ({
                                ...prev,
                                nom: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.clientHeberge?.nom
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Nom du client"
                          />
                          {errors.clientHeberge?.nom && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.clientHeberge.nom}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            value={clientHeberge.prenom}
                            onChange={(e) =>
                              setClientHeberge((prev) => ({
                                ...prev,
                                prenom: e.target.value,
                              }))
                            }
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.clientHeberge?.prenom
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Prénom du client"
                          />
                          {errors.clientHeberge?.prenom && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.clientHeberge.prenom}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={clientHeberge.telephone}
                        onChange={(e) =>
                          setClientHeberge((prev) => ({
                            ...prev,
                            telephone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Numéro de téléphone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={clientHeberge.email}
                        onChange={(e) =>
                          setClientHeberge((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adresse email"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse
                      </label>
                      <textarea
                        value={clientHeberge.adresse}
                        onChange={(e) =>
                          setClientHeberge((prev) => ({
                            ...prev,
                            adresse: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Adresse complète"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={clientHeberge.ville}
                        onChange={(e) =>
                          setClientHeberge((prev) => ({
                            ...prev,
                            ville: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ville"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pays
                      </label>
                      <input
                        type="text"
                        value={clientHeberge.pays}
                        onChange={(e) =>
                          setClientHeberge((prev) => ({
                            ...prev,
                            pays: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pays"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloc bon de réduction */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="w-6 h-6 text-orange-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Bon de réduction
                    </h2>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={bonReductionCode}
                        onChange={(e) => setBonReductionCode(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Code du bon de réduction"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleBonReductionVerification}
                      disabled={!bonReductionCode.trim()}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Vérifier
                    </button>
                  </div>

                  {bonReductionApplique && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                          <p className="font-medium text-green-900">
                            {bonReductionApplique.nom}
                          </p>
                          <p className="text-sm text-green-700">
                            {bonReductionApplique.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Résumé de la simulation */}
                {simulation && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      {simulationLoading && (
                        <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                      )}
                      Simulation tarifaire
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-600 mb-1">Montant HT</p>
                        <p className="text-xl font-bold text-blue-900">
                          {simulation.montantHT}€
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 mb-1">TVA</p>
                        <p className="text-xl font-bold text-green-900">
                          {simulation.montantTVA}€
                        </p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <p className="text-sm text-orange-600 mb-1">
                          Réductions
                        </p>
                        <p className="text-xl font-bold text-orange-900">
                          {simulation.montantReductions}€
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 mb-1">
                          Total TTC
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {simulation.montantTotal}€
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages d'erreur globaux */}
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700">{errors.general}</span>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Prévisualisation de la facture */}
            {showInvoicePreview && (
              <div className="w-5/12 border-l border-gray-200 overflow-y-auto">
                <div className="p-6">
                  <InvoicePreview
                    simulation={simulation}
                    reservant={reservant}
                    clientHeberge={clientHeberge}
                    sejours={sejours.map((sejour) => {
                      // Récupérer le taux de TVA depuis les tarifs
                      const tarifs = [
                        { id: "tarif1", tva: 18 },
                        { id: "tarif2", tva: 18 },
                        { id: "tarif3", tva: 18 },
                      ];
                      const tarifTva =
                        tarifs.find((t) => t.id === sejour.tarifId)?.tva || 18;

                      return {
                        dateArrivee: sejour.dateArrivee,
                        dateDepart: sejour.dateDepart,
                        heureArrivee: sejour.heureArrivee,
                        heureDepart: sejour.heureDepart,
                        typePieceId: sejour.typeChambreId,
                        typeChambreNom: sejour.typeChambreNom,
                        tarifType: sejour.tarifType,
                        tarifNom: sejour.tarifNom,
                        tarifPrix: sejour.tarifPrix,
                        tarifTva: tarifTva,
                        piecesIds: sejour.piecesIds,
                        note: sejour.note,
                      };
                    })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action sticky */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting
                ? "Sauvegarde..."
                : isEditing
                ? "Modifier"
                : "Créer la réservation"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal séjour */}
      <SejourFormModal
        isOpen={showSejourModal}
        onClose={() => {
          setShowSejourModal(false);
          setEditingSejourIndex(null);
        }}
        onSubmit={handleSejourSubmit}
        initialData={
          editingSejourIndex !== null
            ? {
                ...sejours[editingSejourIndex],
                chambresSelectionnees:
                  sejours[editingSejourIndex].chambresSelectionnees ||
                  sejours[editingSejourIndex].piecesIds ||
                  [],
              }
            : undefined
        }
        isEditing={editingSejourIndex !== null}
        chambresDejaAffectees={chambresDejaAffectees.map((c) => c.pieceid)}
        chambresParTypeAffectees={chambresParTypeAffectees}
      />
    </div>
  );
}
