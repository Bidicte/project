import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Bed,
  DollarSign,
  Search,
  ChevronDown,
  MapPin,
  Users,
  Info,
  Save,
  AlertCircle,
} from "lucide-react";
import DateRangePicker from "./date-range-picker";
import RoomCompactSelector from "./room-compact-selector";
import { useAvailableRooms } from "../../hooks/reservations/useAvailableRooms";
import { reservationService } from "../../services/reservationService";
import type { TarifOption } from "../../types/reservation";
import { periodesChevauchent } from "../../utils/api.utils";

// interface TypeChambre {
//   id: string;
//   nom: string;
//   description: string;
//   capacite: number;
//   equipements: string[];
//   nombreDisponible: number;
//   tarifid?: string;
// }

interface SejourFormData {
  id?: string;
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
  // Nouvelles propriétés pour l'enrichissement des données
  roomCodes?: string[];
  roomNames?: string[];
  tarifCodes?: string[];
  tarifIds?: string[];
  tarifNames?: string[];
}

interface SejourFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SejourFormData) => void;
  initialData?: SejourFormData;
  isEditing?: boolean;
  /** Liste des chambres déjà affectées à d'autres séjours (hors séjour en cours d'édition) */
  chambresDejaAffectees?: string[];
  /** Mapping du nombre de chambres déjà affectées par type (hors séjour en cours d'édition) */
  chambresParTypeAffectees?: Record<string, number>;
}

export default function SejourFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  chambresDejaAffectees = [],
  chambresParTypeAffectees = {},
}: SejourFormModalProps) {
  const initialFormData: SejourFormData = {
    dateArrivee: "",
    dateDepart: "",
    heureArrivee: "12:00",
    heureDepart: "11:59",
    typeChambreId: "",
    tarifId: "",
    nombrePersonnes: 1,
    nombreUnites: 1,
    piecesIds: [],
    note: "",
    chambresSelectionnees: [],
    ...initialData,
  };
  const [formData, setFormData] = useState<SejourFormData>(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allTarifs, setAllTarifs] = useState<TarifOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTypeSearch, setShowTypeSearch] = useState(false);
  const [showTarifSearch, setShowTarifSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tarifsLoading, setTarifsLoading] = useState(false);
  const [tarifsLoaded, setTarifsLoaded] = useState(false);

  // Hook pour récupérer les pièces disponibles
  const {
    roomTypes,
    rooms,
    loading: roomsLoading,
    error: roomsError,
  } = useAvailableRooms({
    typePieceId: formData.typeChambreId,
    startDate: formData.dateArrivee,
    endDate: formData.dateDepart,
  });

  const selectedTypeChambre = roomTypes.find(
    (t) => t.id === formData.typeChambreId
  );
  const selectedTarif = allTarifs.find((t) => t.tarifid === formData.tarifId);

  // Réinitialiser la sélection du type de chambre si elle n'est plus disponible
  useEffect(() => {
    if (formData.typeChambreId && roomTypes.length > 0) {
      const typeExists = roomTypes.some(
        (type) => type.id === formData.typeChambreId
      );
      if (!typeExists) {
        setFormData((prev) => ({
          ...prev,
          typeChambreId: "",
          tarifId: "",
          chambresSelectionnees: [],
        }));
      }
    }
  }, [roomTypes, formData.typeChambreId]);

  // Charger tous les tarifs disponibles une seule fois
  useEffect(() => {
    if (!tarifsLoaded && isOpen) {
      const loadTarifs = async () => {
        try {
          setTarifsLoading(true);
          const apiResponse = await reservationService.getAllTarifs();
          if (apiResponse.success) {
            setAllTarifs(apiResponse.data); // ici data est TarifOption[]
            setTarifsLoaded(true);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des tarifs:", error);
        } finally {
          setTarifsLoading(false);
        }
      };
      loadTarifs();
    }
  }, [isOpen, tarifsLoaded]);

  // Présélectionner le tarif du type de chambre quand il change
  useEffect(() => {
    if (
      selectedTypeChambre &&
      selectedTypeChambre.tarifid &&
      allTarifs.length > 0
    ) {
      const tarifExists = allTarifs.some(
        (tarif) => tarif.tarifid === selectedTypeChambre.tarifid
      );

      if (tarifExists) {
        setFormData((prev) => ({
          ...prev,
          tarifId: selectedTypeChambre.tarifid || "",
        }));
      }
    }
  }, [selectedTypeChambre, allTarifs]);

  // Mettre à jour les heures par défaut selon le tarif
  useEffect(() => {
    const currentTarif = allTarifs.find((t) => t.tarifid === formData.tarifId);
    if (currentTarif) {
      if (currentTarif.modelocatlibelle === "Nuitée") {
        setFormData((prev) => ({
          ...prev,
          heureArrivee: "12:00",
          heureDepart: "11:59",
        }));
      }
    }
  }, [formData.tarifId, allTarifs]);

  // Vider le formulaire à l'ouverture en mode ajout
  useEffect(() => {
    if (isOpen && !isEditing) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen, isEditing]);

  const filteredTypes = roomTypes.filter((type) =>
    type.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcule dynamiquement le nombre de chambres disponibles pour chaque type
  const getNombreDisponible = (type: any) => {
    const nombreDejaPris = chambresParTypeAffectees[type.id] || 0;
    return (type.nombreDisponible || 0) - nombreDejaPris;
  };

  const calculateNights = () => {
    if (!formData.dateArrivee || !formData.dateDepart) return 0;
    const start = new Date(formData.dateArrivee);
    const end = new Date(formData.dateDepart);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalHours = () => {
    if (
      !formData.dateArrivee ||
      !formData.dateDepart ||
      !formData.heureArrivee ||
      !formData.heureDepart
    )
      return 0;

    const startDateTime = new Date(
      `${formData.dateArrivee}T${formData.heureArrivee}:00`
    );
    const endDateTime = new Date(
      `${formData.dateDepart}T${formData.heureDepart}:00`
    );

    const diffMilliseconds = endDateTime.getTime() - startDateTime.getTime();
    const diffHours = diffMilliseconds / (1000 * 60 * 60);

    return Math.ceil(diffHours);
  };

  const calculateTotal = () => {
    if (!selectedTarif) return 0;
    const nights = calculateNights();
    const chambresCount = formData.chambresSelectionnees.length;

    // Pour l'instant, on retourne 0 car nous n'avons pas le prix dans la structure de tarif
    // Le calcul sera implémenté avec la simulation API
    return 0;
  };

  const handleDateRangeChange = (range: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      dateArrivee: range.startDate,
      dateDepart: range.endDate,
      heureArrivee: range.startTime || prev.heureArrivee,
      heureDepart: range.endTime || prev.heureDepart,
    }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dateArrivee) newErrors.dateArrivee = "Date d'arrivée requise";
    if (!formData.dateDepart) newErrors.dateDepart = "Date de départ requise";
    if (!formData.typeChambreId)
      newErrors.typeChambreId = "Type de chambre requis";
    if (!formData.tarifId) newErrors.tarifId = "Tarif requis";
    if (formData.chambresSelectionnees.length === 0)
      newErrors.chambresSelectionnees =
        "Au moins une chambre doit être sélectionnée";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Enrichir les données avec les informations complètes
    const selectedRooms = rooms.filter((room) =>
      formData.chambresSelectionnees.includes(room.pieceid)
    );

    const enrichedFormData: SejourFormData = {
      ...formData,
      typeChambreNom: selectedTypeChambre?.nom,
      tarifNom: selectedTarif?.libelletarif,
      tarifType:
        selectedTarif?.modelocatlibelle === "Nuitée"
          ? "nuitee"
          : selectedTarif?.modelocatlibelle === "Passage"
          ? "passage"
          : undefined,
      piecesIds: formData.chambresSelectionnees,
      nombreUnites:
        selectedTarif?.modelocatlibelle === "Nuitée"
          ? calculateNights()
          : calculateTotalHours(),
      // Ajout des codes des chambres en plus des IDs
      roomCodes: selectedRooms.map((room) => room.piececode),
      roomNames: selectedRooms.map((room) => room.piecelibelle),
      // Ajout des codes et IDs des tarifs en listes
      tarifCodes: selectedTarif ? [selectedTarif.codetarif] : [],
      tarifIds: selectedTarif ? [selectedTarif.tarifid] : [],
      tarifNames: selectedTarif ? [selectedTarif.libelletarif] : [],
    };

    console.log("📝 Données enrichies du séjour:", enrichedFormData);

    // Réinitialiser les erreurs si la validation réussit
    setErrors({});
    onSubmit(enrichedFormData);
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? "Modifier le séjour" : "Ajouter un séjour"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période de séjour *
            </label>
            <DateRangePicker
              value={{
                startDate: formData.dateArrivee,
                endDate: formData.dateDepart,
                startTime: formData.heureArrivee,
                endTime: formData.heureDepart,
              }}
              onChange={handleDateRangeChange}
              placeholder="Sélectionner les dates"
              error={errors.dateArrivee || errors.dateDepart}
              includeTime={true}
              tarifType={
                selectedTarif?.modelocatlibelle === "Nuitée"
                  ? "nuitee"
                  : selectedTarif?.modelocatlibelle === "Passage"
                  ? "passage"
                  : undefined
              }
            />
          </div>

          {/* Type de chambre avec recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de chambre *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeSearch(!showTypeSearch)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <div className="flex items-center">
                  <Bed className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    {selectedTypeChambre
                      ? selectedTypeChambre.nom
                      : "Sélectionner un type"}
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>

              {showTypeSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {roomsLoading && (
                      <div className="p-4 text-center text-gray-500">
                        Chargement des types de chambres...
                      </div>
                    )}

                    {roomsError && (
                      <div className="p-4 text-center text-red-500">
                        {roomsError}
                      </div>
                    )}

                    {!roomsLoading &&
                      !roomsError &&
                      filteredTypes.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          {formData.dateArrivee && formData.dateDepart
                            ? "Aucun type de chambre disponible pour ces dates"
                            : "Sélectionnez d'abord une période"}
                        </div>
                      )}

                    {filteredTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            typeChambreId: type.id,
                          }));
                          setShowTypeSearch(false);
                          setSearchTerm("");
                        }}
                        className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {type.nom}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600">
                              {getNombreDisponible(type)} disponible
                              {getNombreDisponible(type) > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.typeChambreId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.typeChambreId}
              </p>
            )}
          </div>

          {/* Tarifs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarif *
            </label>
            {tarifsLoading ? (
              <div className="p-4 text-center text-gray-500">
                Chargement des tarifs...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTarifs.map((tarif) => (
                  <div
                    key={tarif.tarifid}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.tarifId === tarif.tarifid
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tarifId: tarif.tarifid,
                      }))
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {tarif.libelletarif}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tarif.codetarif} - {tarif.modelocatlibelle}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          TVA {tarif.codetva} - {tarif.ttcactive ? "TTC" : "HT"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          par {tarif.modelocatlibelle.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.tarifId && (
              <p className="mt-1 text-sm text-red-600">{errors.tarifId}</p>
            )}
          </div>

          {/* Sélection des chambres spécifiques */}
          {formData.typeChambreId &&
            formData.dateArrivee &&
            formData.dateDepart && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner les chambres *
                </label>
                <RoomCompactSelector
                  dateDebut={formData.dateArrivee}
                  dateFin={formData.dateDepart}
                  typeChambreId={formData.typeChambreId}
                  chambresSelectionnees={formData.chambresSelectionnees}
                  onChambresChange={(chambres) =>
                    setFormData((prev) => ({
                      ...prev,
                      chambresSelectionnees: chambres,
                    }))
                  }
                  loading={roomsLoading}
                  availableRooms={rooms.filter((room) => {
                    // Si la chambre est déjà sélectionnée dans ce séjour, elle reste dispo
                    if (formData.chambresSelectionnees.includes(room.pieceid)) {
                      return true;
                    }
                    // Sinon, vérifier si elle est occupée sur une période qui chevauche
                    // chambresDejaAffectees doit être enrichi pour contenir les périodes
                    // On suppose que chambresDejaAffectees = [{ pieceid, dateArrivee, dateDepart }]
                    if (!Array.isArray(chambresDejaAffectees) || chambresDejaAffectees.length === 0) {
                      return true;
                    }
                    // chambresDejaAffectees peut contenir soit des strings (ids), soit des objets enrichis
                    // On gère les deux cas pour compatibilité
                    if (typeof chambresDejaAffectees[0] === "string") {
                      // fallback legacy: simple id
                      return !chambresDejaAffectees.includes(room.pieceid);
                    }
                    // cas enrichi: [{ pieceid, dateArrivee, dateDepart }]
                    return !chambresDejaAffectees.some((affectee: any) =>
                      affectee.pieceid === room.pieceid &&
                      periodesChevauchent(
                        affectee.dateArrivee,
                        affectee.dateDepart,
                        formData.dateArrivee,
                        formData.dateDepart
                      )
                    );
                  })}
                />
                {errors.chambresSelectionnees && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.chambresSelectionnees}
                  </p>
                )}
              </div>
            )}

          {/* Résumé */}
          {selectedTarif && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Résumé du séjour
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                {selectedTarif.modelocatlibelle === "Nuitée" ? (
                  <div>
                    Période : {calculateNights()} nuitée
                    {calculateNights() > 1 ? "s" : ""}
                  </div>
                ) : (
                  <div>
                    Durée : {calculateTotalHours()}h ({formData.dateArrivee}{" "}
                    {formData.heureArrivee} → {formData.dateDepart}{" "}
                    {formData.heureDepart})
                  </div>
                )}
                <div>Type : {selectedTarif.modelocatlibelle}</div>
                <div>Chambres : {formData.chambresSelectionnees.length}</div>
                <div>Tarif : {selectedTarif.libelletarif}</div>
                <div>Code tarif : {selectedTarif.codetarif}</div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Modifier" : "Ajouter"} le séjour
          </button>
        </div>
      </div>
    </div>
  );
}
