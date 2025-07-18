import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { useReservations } from "../hooks/reservations/use-reservations";
import ReservationFormModal from "../components/reservations/reservation-form-modal";
import type {
  Reservation,
  ReservationFormData,
  ReservationFilter,
} from "../types/reservation";

type ViewMode = "list" | "details";

export default function Reservations() {
  const {
    reservations,
    currentReservation,
    statistiques,
    loading,
    loadingReservation,
    loadingStatistiques,
    pagination,
    error,
    fetchReservations,
    fetchReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    confirmReservation,
    cancelReservation,
    fetchStatistiques,
    searchReservations,
    filterReservations,
    setPage,
    setLimit,
    refreshReservations,
    clearError,
    clearCurrentReservation,
  } = useReservations();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<string[]>(
    []
  );
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [filters, setFilters] = useState<ReservationFilter>({
    dateDebut: "",
    dateFin: "",
    statut: [],
    typeClient: [],
    typePiece: [],
    montantMin: undefined,
    montantMax: undefined,
  });

  useEffect(() => {
    fetchStatistiques();
  }, [fetchStatistiques]);

  const handleCreateReservation = async (data: ReservationFormData) => {
    try {
      await createReservation(data);
      setShowReservationModal(false);
      alert("Réservation créée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création de la réservation");
    }
  };

  const handleUpdateReservation = async (data: ReservationFormData) => {
    if (!editingReservation) return;

    try {
      await updateReservation(editingReservation.id, data);
      setShowReservationModal(false);
      setEditingReservation(null);
      alert("Réservation modifiée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification de la réservation");
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?"))
      return;

    try {
      await deleteReservation(id);
      alert("Réservation supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de la réservation");
    }
  };

  const handleConfirmReservation = async (id: string) => {
    try {
      await confirmReservation(id);
      alert("Réservation confirmée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      alert("Erreur lors de la confirmation de la réservation");
    }
  };

  const handleCancelReservation = async (id: string) => {
    const motif = prompt("Motif d'annulation (optionnel):");

    try {
      await cancelReservation(id, motif || undefined);
      alert("Réservation annulée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      alert("Erreur lors de l'annulation de la réservation");
    }
  };

  const handleViewDetails = async (id: string) => {
    await fetchReservationById(id);
    setViewMode("details");
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowReservationModal(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length >= 3 || term.length === 0) {
      searchReservations(term);
    }
  };

  const handleFilterChange = (newFilters: ReservationFilter) => {
    setFilters(newFilters);
    filterReservations(newFilters);
  };

  const handleExport = async (format: "excel" | "pdf" = "excel") => {
    try {
      // Logique d'export (à implémenter selon vos besoins)
      alert(`Export ${format} en cours...`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export");
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "Confirmée":
        return "bg-green-100 text-green-800";
      case "Brouillon":
        return "bg-yellow-100 text-yellow-800";
      case "Annulée":
        return "bg-red-100 text-red-800";
      case "Terminée":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "Confirmée":
        return <CheckCircle className="w-4 h-4" />;
      case "Brouillon":
        return <Clock className="w-4 h-4" />;
      case "Annulée":
        return <XCircle className="w-4 h-4" />;
      case "Terminée":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('fr-FR', {
  //     style: 'currency',
  //     currency: 'EUR'
  //   }).format(amount);
  // };

  const formatCurrency = (amount: number) => {
    // Affiche en XOF/FCFA sans décimales
    return (
      amount.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " FCFA"
    );
  };

  if (viewMode === "details" && currentReservation) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Réservation #{currentReservation.numero}
                </h1>
                <p className="text-gray-600">
                  Créée le {formatDate(currentReservation.dateCreation)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(
                    currentReservation.statut
                  )}`}
                >
                  {getStatutIcon(currentReservation.statut)}
                  <span className="ml-2">{currentReservation.statut}</span>
                </div>
                <button
                  onClick={() => setViewMode("list")}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Retour à la liste
                </button>
              </div>
            </div>
          </div>

          {/* Détails de la réservation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informations du réservant */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Réservant
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {currentReservation.reservant.prenom}{" "}
                    {currentReservation.reservant.nom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm">
                        {currentReservation.reservant.telephone}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm">
                        {currentReservation.reservant.email}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations du client hébergé */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2 text-green-600" />
                Client hébergé
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {currentReservation.clientHeberge.prenom}{" "}
                    {currentReservation.clientHeberge.nom}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type de client</p>
                  <p className="font-medium">
                    {currentReservation.clientHeberge.typeClient}
                  </p>
                </div>
                {currentReservation.clientHeberge.raisonSociale && (
                  <div>
                    <p className="text-sm text-gray-500">Raison sociale</p>
                    <p className="font-medium">
                      {currentReservation.clientHeberge.raisonSociale}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">
                      {currentReservation.clientHeberge.adresse},{" "}
                      {currentReservation.clientHeberge.ville},{" "}
                      {currentReservation.clientHeberge.pays}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Séjours */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Séjours ({currentReservation.sejours.length})
            </h3>
            <div className="space-y-4">
              {currentReservation.sejours.map((sejour, index) => (
                <div
                  key={sejour.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Séjour {index + 1}
                    </h4>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(sejour.montantTotal)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {sejour.nuitees} nuitée{sejour.nuitees > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Dates</p>
                      <p className="font-medium">
                        Du {formatDate(sejour.dateArrivee)} au{" "}
                        {formatDate(sejour.dateDepart)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type de pièce</p>
                      <p className="font-medium">{sejour.typePiece?.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pièces</p>
                      <p className="font-medium">
                        {sejour.piecesSelectionnees
                          .map((p) => p.piece.numero)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  {sejour.note && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{sejour.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Résumé financier */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
              Résumé financier
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Montant HT</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(currentReservation.montantHT)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">TVA</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(currentReservation.montantTVA)}
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-1">Réductions</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(currentReservation.montantReductions)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 mb-1">Total TTC</p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatCurrency(currentReservation.montantTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
              <p className="text-gray-600">
                Gestion des réservations et hébergements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExport("excel")}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
              <button
                onClick={() => setShowReservationModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle réservation
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        {statistiques && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total réservations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.totalReservations}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Confirmées</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.reservationsConfirmees}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Taux d'occupation</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistiques.tauxOccupation}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(statistiques.chiffreAffaires)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Masquer" : "Afficher"} les filtres
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, numéro de réservation..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateDebut || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filters,
                      dateDebut: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.dateFin || ""}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, dateFin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  multiple
                  value={filters.statut || []}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filters,
                      statut: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Confirmée">Confirmée</option>
                  <option value="Annulée">Annulée</option>
                  <option value="Terminée">Terminée</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Liste des réservations */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Réservation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Séjours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Aucune réservation trouvée
                    </td>
                  </tr>
                ) : (
                  reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{reservation.numero}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(reservation.dateCreation)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.clientHeberge.prenom}{" "}
                            {reservation.clientHeberge.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.clientHeberge.typeClient}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reservation.sejours.length} séjour
                          {reservation.sejours.length > 1 ? "s" : ""}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.sejours.reduce(
                            (total, sejour) => total + sejour.nuitees,
                            0
                          )}{" "}
                          nuitées
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(reservation.montantTotal)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(
                            reservation.statut
                          )}`}
                        >
                          {getStatutIcon(reservation.statut)}
                          <span className="ml-1">{reservation.statut}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(reservation.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditReservation(reservation)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {reservation.statut === "Brouillon" && (
                            <button
                              onClick={() =>
                                handleConfirmReservation(reservation.id)
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Confirmer"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {reservation.statut !== "Annulée" && (
                            <button
                              onClick={() =>
                                handleCancelReservation(reservation.id)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Annuler"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteReservation(reservation.id)
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  sur {pagination.total} réservations
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {pagination.page} sur {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de réservation */}
      <ReservationFormModal
        isOpen={showReservationModal}
        onClose={() => {
          setShowReservationModal(false);
          setEditingReservation(null);
        }}
        onSubmit={
          editingReservation ? handleUpdateReservation : handleCreateReservation
        }
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
  );
}
