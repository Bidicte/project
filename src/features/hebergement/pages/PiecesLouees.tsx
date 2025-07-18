/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import {
  Euro,
  Home,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Building2,
  Settings,
  Trash2,
  Activity,
  Grid3X3,
  List,
  Eye,
  EyeOff,
  MoreHorizontal,
  Calendar,
  Clock,
  Users,
  Zap,
  Edit,
} from "lucide-react";
import type { Room, RoomTypeWithTarif } from "../types/pieceLouee/room";
import { RoomTypeCard } from "../components/pieceLouee/room-type-card";
import { RoomTypeForm } from "../components/pieceLouee/room-type-form";
import { RoomForm } from "../components/pieceLouee/room-form";
import { RoomDetailView } from "../components/pieceLouee/room-detail-view";
import { ConfirmationModal } from "../components/pieceLouee/confirmation-modal";
import { useNotification } from "../hooks/pieceLouee/useNotification";
import { useRoomTypes } from "../hooks/pieceLouee/useRoomTypes";
import { useRooms } from "../hooks/pieceLouee/useRooms";
import { ErrorMessage } from "../components/error-message";
import LoadingSpinner from "../components/clients/loading-spinner";
import { Notification } from "../components/pieceLouee/notification";

export default function HotelRoomManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedRoomType, setSelectedRoomType] =
    useState<RoomTypeWithTarif | null>(null);

  // États pour les modales
  const [isRoomTypeFormOpen, setIsRoomTypeFormOpen] = useState(false);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<
    RoomTypeWithTarif | undefined
  >();
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();
  const [selectedTypePieceId, setSelectedTypePieceId] = useState<string>("");
  const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
  const [roomTypeToDelete, setRoomTypeToDelete] =
    useState<RoomTypeWithTarif | null>(null);

  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Hooks pour les données
  const {
    roomTypesWithTarifs,
    loading: roomTypesLoading,
    error: roomTypesError,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    refetch: refetchRoomTypes,
  } = useRoomTypes();

  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchAllRoomsForTypes,
    getRoomsForType,
  } = useRooms();



  // Filtrage des types de pièces
  const filteredRoomTypes = roomTypesWithTarifs.filter((type) =>
    type.libellepiece.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistiques
  const totalRooms = rooms.length;
  const functionalRooms = rooms.filter((room) => room.fonctionnel).length;
  const outOfOrderRooms = totalRooms - functionalRooms;
  const occupancyRate =
    totalRooms > 0 ? Math.round((functionalRooms / totalRooms) * 100) : 0;

  // Calcul des statistiques par type
  const roomTypeStats = roomTypesWithTarifs.map((type) => {
    const typeRooms = getRoomsForType(type.typepieceid);
    const functionalTypeRooms = typeRooms.filter(
      (room) => room.fonctionnel
    ).length;
    const typeOccupancyRate =
      typeRooms.length > 0
        ? Math.round((functionalTypeRooms / typeRooms.length) * 100)
        : 0;

    return {
      ...type,
      totalRooms: typeRooms.length,
      functionalRooms: functionalTypeRooms,
      occupancyRate: typeOccupancyRate,
      status:
        typeRooms.length === 0
          ? "empty"
          : functionalTypeRooms === typeRooms.length
          ? "optimal"
          : functionalTypeRooms === 0
          ? "critical"
          : "warning",
    };
  });

  // Debug: Vérifier l'état global des pièces
  // console.log('=== DEBUG PIECES LOUEES ===')
  // console.log('Total types de pièces:', roomTypesWithTarifs.length)
  // console.log('Total pièces:', rooms.length)
  // console.log('Pièces par type:')
  // roomTypesWithTarifs.forEach(type => {
  //   const roomsForType = getRoomsForType(type.typepieceid)
  //   console.log(`- ${type.libellepiece} (${type.typepieceid}): ${roomsForType.length} pièces`)
  // })
  // console.log('Toutes les pièces:', rooms.map(r => ({id: r.pieceid, typeId: r.typepieceid, libelle: r.piecelibelle})))
  // console.log('=========================')

  // Charger les pièces quand les types sont disponibles
  useEffect(() => {
    if (roomTypesWithTarifs.length > 0) {
      const typeIds = roomTypesWithTarifs.map((type) => type.typepieceid);
      fetchAllRoomsForTypes(typeIds);
    }
  }, [roomTypesWithTarifs, fetchAllRoomsForTypes]);

  // Fonctions pour les types de pièces
  const handleAddRoomType = () => {
    setEditingRoomType(undefined);
    setIsRoomTypeFormOpen(true);
  };

  const handleEditRoomType = (roomType: RoomTypeWithTarif) => {
    setEditingRoomType(roomType);
    setIsRoomTypeFormOpen(true);
  };

  const handleDeleteRoomType = async (typepieceid: string) => {
    try {
      await deleteRoomType(typepieceid);
      // Recharger les pièces après suppression du type
      const typeIds = roomTypesWithTarifs
        .filter((type) => type.typepieceid !== typepieceid)
        .map((type) => type.typepieceid);
      if (typeIds.length > 0) {
        fetchAllRoomsForTypes(typeIds);
      }
      showSuccess("Type de pièce supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du type de pièce"
      );
    }
  };

  const handleDeleteRoomTypeWithConfirmation = (
    roomType: RoomTypeWithTarif
  ) => {
    setRoomTypeToDelete(roomType);
    setShowDeleteTypeModal(true);
  };

  const confirmDeleteRoomType = async () => {
    if (roomTypeToDelete) {
      try {
        await handleDeleteRoomType(roomTypeToDelete.typepieceid);
        setRoomTypeToDelete(null);
      } catch (error) {
        // L'erreur est déjà gérée dans handleDeleteRoomType
      }
    }
  };

  const handleSubmitRoomType = async (data: any) => {
    try {
      if (data.typepieceid) {
        await updateRoomType(data.typepieceid, data);
        showSuccess("Type de pièce modifié avec succès");
      } else {
        await createRoomType(data);
        showSuccess("Type de pièce créé avec succès");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement du type de pièce";
      showError(errorMessage);
      throw error;
    }
  };

  // Fonctions pour les pièces
  const handleAddRoom = (typepieceid: string) => {
    setSelectedTypePieceId(typepieceid);
    setEditingRoom(undefined);
    setIsRoomFormOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedTypePieceId(room.typepieceid);
    setEditingRoom(room);
    setIsRoomFormOpen(true);
  };

  const handleDeleteRoom = async (pieceid: string) => {
    try {
      await deleteRoom(pieceid);
      showSuccess("Pièce supprimée avec succès");
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de la pièce"
      );
    }
  };

  const handleSubmitRoom = async (data: any) => {
    try {
      if (data.pieceid) {
        await updateRoom(data.pieceid, data);
        showSuccess("Pièce modifiée avec succès");
      } else {
        await createRoom(data);
        showSuccess("Pièce créée avec succès");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement de la pièce";
      showError(errorMessage);
      throw error;
    }
  };

  // Fonctions pour la vue détaillée
  const handleAddRoomInDetail = async (data: any) => {
    // Cette fonction sera utilisée dans la vue détaillée
    return createRoom(data);
  };

  const handleEditRoomInDetail = async (room: Room) => {
    // Cette fonction sera utilisée dans la vue détaillée
    return updateRoom(room.pieceid, room);
  };

  const handleDeleteRoomInDetail = async (pieceid: string) => {
    // Cette fonction sera utilisée dans la vue détaillée
    return deleteRoom(pieceid);
  };

  const handleViewAllRoom = async(pieceid: string) => {
    // Cette fonction sera utilisée dans la vue détaillée
    return viewAllRom(pieceid);
  };

  // Gestion des erreurs
  if (roomTypesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={roomTypesError} onRetry={refetchRoomTypes} />
      </div>
    );
  }

  // Si une vue détaillée est sélectionnée, afficher seulement cette vue
  if (selectedRoomType) {
    return (
      <RoomDetailView
        roomType={selectedRoomType}
        rooms={getRoomsForType(selectedRoomType.typepieceid)}
        onBack={() => setSelectedRoomType(null)}
        onEditType={handleEditRoomType}
        onDeleteType={handleDeleteRoomType}
        onAddRoom={handleAddRoomInDetail}
        onEditRoom={handleEditRoomInDetail}
        onDeleteRoom={handleDeleteRoomInDetail}
        onViewAllRoom={handleViewAllRoom} roomState={[]}      />
    );
  }

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 ">
      <div className="px-4 sm:px-6 lg:px-2 py-2">
        {/* En-tête moderne avec navigation */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
           <div className="flex items-center gap-3 mb-3">
                {/* <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <Home className="h-6 w-6 text-white" />
                </div> */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Gestion des Pièces
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gérez vos types de pièces et leurs inventaires de manière
                    efficace
                  </p>
                </div>
              </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                title={
                  showStats
                    ? "Masquer les statistiques"
                    : "Afficher les statistiques"
                }
              >
                {showStats ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {/* <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button> */}
            </div>
          </div>

          {/* Statistiques modernes avec animations */}
          {showStats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Types de pièces
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {roomTypesWithTarifs.length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Catégories configurées
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <Home className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Total pièces
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalRooms}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Inventaire total
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Fonctionnelles
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {functionalRooms}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      sur {totalRooms} pièces
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Taux de fonctionnement
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {occupancyRate}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                    <Activity className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Barre de recherche et actions modernes */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un type de pièce..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 hover:bg-white transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Filtres */}
                {/* <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl bg-white/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="all">Tous les types</option>
                  <option value="optimal">Fonctionnels</option>
                  <option value="warning">Partiellement fonctionnels</option>
                  <option value="critical">Hors service</option>
                  <option value="empty">Sans pièces</option>
                </select> */}

                <button
                  onClick={handleAddRoomType}
                  disabled={roomTypesLoading}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau type
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {roomTypesLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Vue cartes modernes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRoomTypes.map((roomType) => {
                const stats = roomTypeStats.find(
                  (s) => s.typepieceid === roomType.typepieceid
                );
                const rooms = getRoomsForType(roomType.typepieceid);

                return (
                  <div key={roomType.typepieceid} className="group">
                    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      {/* En-tête de la carte */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {roomType.libellepiece}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                stats?.status === "optimal"
                                  ? "bg-green-100 text-green-800"
                                  : stats?.status === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : stats?.status === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {stats?.status === "optimal"
                                ? "✓ Optimal"
                                : stats?.status === "warning"
                                ? "⚠ Partiel"
                                : stats?.status === "critical"
                                ? "✗ Critique"
                                : "○ Vide"}
                            </span>
                            {roomType.tarif && (
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {roomType.tarif.codetarif}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleEditRoomType(roomType)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRoomTypeWithConfirmation(roomType)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Statistiques de la carte */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-gray-900">
                            {stats?.totalRooms || 0}
                          </p>
                          <p className="text-xs text-gray-500">Pièces</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <p className="text-2xl font-bold text-green-600">
                            {stats?.functionalRooms || 0}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fonctionnelles
                          </p>
                        </div>
                      </div>

                      {/* Barre de progression */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Taux de fonctionnement</span>
                          <span>{stats?.occupancyRate || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              stats?.status === "optimal"
                                ? "bg-green-500"
                                : stats?.status === "warning"
                                ? "bg-yellow-500"
                                : stats?.status === "critical"
                                ? "bg-red-500"
                                : "bg-gray-300"
                            }`}
                            style={{ width: `${stats?.occupancyRate || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleAddRoom(roomType.typepieceid)}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter pièce
                        </button>

                        <button
                          onClick={() => setSelectedRoomType(roomType)}
                          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message vide */}
            {filteredRoomTypes.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-12 shadow-lg">
                  <div className="text-gray-400 mb-4">
                    <Home className="h-16 w-16 mx-auto" />
                  </div>
                  <div className="text-gray-500 text-lg mb-2">
                    {searchTerm
                      ? "Aucun type de pièce trouvé"
                      : "Aucun type de pièce configuré"}
                  </div>
                  <p className="text-gray-400 mb-6">
                    {searchTerm
                      ? "Essayez de modifier vos critères de recherche"
                      : "Commencez par créer votre premier type de pièce"}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={handleAddRoomType}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer votre premier type de pièce
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Affichage des erreurs pour les pièces */}
        {roomsError && (
          <div className="mt-4">
            <ErrorMessage
              message={roomsError}
              onRetry={() =>
                fetchAllRoomsForTypes(
                  roomTypesWithTarifs.map((t) => t.typepieceid)
                )
              }
            />
          </div>
        )}

        {/* Modales */}
        <RoomTypeForm
          isOpen={isRoomTypeFormOpen}
          onClose={() => setIsRoomTypeFormOpen(false)}
          onSubmit={handleSubmitRoomType}
          roomType={editingRoomType}
        />

        <RoomForm
          isOpen={isRoomFormOpen}
          onClose={() => setIsRoomFormOpen(false)}
          onSubmit={handleSubmitRoom}
          room={editingRoom}
          typepieceid={selectedTypePieceId}
        />

        {/* Modal de confirmation pour suppression de type de pièce */}
        <ConfirmationModal
          isOpen={showDeleteTypeModal}
          onClose={() => {
            setShowDeleteTypeModal(false);
            setRoomTypeToDelete(null);
          }}
          onConfirm={confirmDeleteRoomType}
          title="Supprimer le type de pièce"
          message={`Êtes-vous sûr de vouloir supprimer le type de pièce "${
            roomTypeToDelete?.libellepiece
          }" ?${
            roomTypeToDelete
              ? ` ${
                  getRoomsForType(roomTypeToDelete.typepieceid).length
                } pièce(s) associée(s) seront également supprimées.`
              : ""
          } Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />

        {/* Notifications */}
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      </div>
    </div>
  );
}
function viewAllRom(pieceid: string) {
  throw new Error("Function not implemented.");
}

