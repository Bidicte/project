/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Activity,
  Home,
  Info,
} from "lucide-react";
import type { Room, RoomState, RoomTypeWithTarif } from "../../types/pieceLouee/room";
import { ConfirmationModal } from "./confirmation-modal";
import { RoomForm } from "./room-form";
import { useNotification } from "../../hooks/pieceLouee/useNotification";
import { Notification } from "./notification";
import { useRoomStates } from "../../hooks/pieceLouee/useRoomState";
import { RoomStatesModal } from "./RoomStatesModal";

interface RoomDetailViewProps {
  roomType: RoomTypeWithTarif;
  rooms: Room[];
  roomState: RoomState[];
  onBack: () => void;
  onEditType: (roomType: RoomTypeWithTarif) => void;
  onDeleteType: (typepieceid: string) => void;
  onAddRoom: (typepieceid: string) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (pieceid: string) => void;
  onViewAllRoom : (pieceid: string) => void;
}

export function RoomDetailView({
  roomType,
  rooms,
  roomState,
  onBack,
  onEditType,
  onDeleteType,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onViewAllRoom,
}: RoomDetailViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { roomStates, loading, error, fetchRoomStates, clearStates } = useRoomStates();


    // Fonction appelée quand on clique sur le bouton "infos"
  // Dans ton RoomDetailView, modifie handleInfoClick :
const handleInfoClick = async (room: Room) => {
  console.log('🎯 Room sélectionnée:', room); // Vérifie que pieceid existe
  setSelectedRoom(room);
  setIsModalOpen(true);
  await fetchRoomStates(room.pieceid);
};

  // Fermer la modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    clearStates();
  };


  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Calcul des statistiques
  const totalRooms = rooms.length;
  const functionalRooms = rooms.filter((room) => room.fonctionnel).length;
  const outOfOrderRooms = totalRooms - functionalRooms;
  const occupancyRate =
    totalRooms > 0 ? Math.round((functionalRooms / totalRooms) * 100) : 0;

  // Filtrage des chambres
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.piecelibelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.piececode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "functional" && room.fonctionnel) ||
      (statusFilter === "outOfOrder" && !room.fonctionnel);

    return matchesSearch && matchesStatus;
  });

  // Gestion des actions sur les chambres
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setIsRoomFormOpen(true);
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setShowDeleteRoomModal(true);
  };

  const onViewAllStateRoom = (roomState : RoomState) => {
    onViewAllStateRoom(roomState);
  }

  const confirmDeleteRoom = async () => {
    if (roomToDelete) {
      try {
        await onDeleteRoom(roomToDelete.pieceid);
        showSuccess("Chambre supprimée avec succès");
        setRoomToDelete(null);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la suppression de la chambre"
        );
      }
    }
  };

  const handleDeleteTypeWithConfirmation = () => {
    setShowDeleteTypeModal(true);
  };

  const confirmDeleteType = async () => {
    try {
      await onDeleteType(roomType.typepieceid);
      showSuccess("Type de pièce supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du type:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du type de pièce"
      );
    }
  };

  const handleAddRoom = () => {
    setEditingRoom(undefined);
    setIsRoomFormOpen(true);
  };

  const handleCloseRoomForm = () => {
    setIsRoomFormOpen(false);
    setEditingRoom(undefined);
  };

  const handleSubmitRoom = async (data: any) => {
    try {
      if (data.pieceid) {
        // Modification d'une chambre existante
        await onEditRoom({ ...editingRoom, ...data });
        showSuccess("Chambre modifiée avec succès");
      } else {
        // Création d'une nouvelle chambre
        await onAddRoom(data);
        showSuccess("Chambre créée avec succès");
      }
      setIsRoomFormOpen(false);
      setEditingRoom(undefined);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      showError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'enregistrement de la chambre"
      );
    }
  };

  const getStatusColor = () => {
    if (totalRooms === 0) return "bg-gray-100 text-gray-600";
    if (functionalRooms === totalRooms) return "bg-green-100 text-green-700";
    if (functionalRooms === 0) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusIcon = () => {
    if (totalRooms === 0) return <AlertCircle className="h-4 w-4" />;
    if (functionalRooms === totalRooms)
      return <CheckCircle className="h-4 w-4" />;
    if (functionalRooms === 0) return <XCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-2 py-2">
        {/* En-tête avec navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                title="Retour à la liste"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {roomType.libellepiece}
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestion des chambres de ce type
                </p>
              </div>
            </div>

            {/* <div className="flex items-center gap-3">
              <button
                onClick={() => onEditType(roomType)}
                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                title="Modifier le type"
              >
                <Settings className="h-4 w-4 mr-2" />
                Modifier le type
              </button>
              <button
                onClick={handleDeleteTypeWithConfirmation}
                className="flex items-center px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                title="Supprimer le type"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer le type
              </button>
            </div> */}
          </div>

          {/* Statistiques du type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total chambres
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalRooms}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Fonctionnelles
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {functionalRooms}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Hors service
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {outOfOrderRooms}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                  <XCircle className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-lg">
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

          {/* Barre de recherche et filtres */}
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une chambre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 hover:bg-white transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl bg-white/50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="all">Tous les états</option>
                  <option value="functional">Fonctionnelles</option>
                  <option value="outOfOrder">Hors service</option>
                </select>

                <button
                  onClick={handleAddRoom}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 shadow-lg font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une chambre
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des chambres */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Home className="h-16 w-16 mx-auto" />
              </div>
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || statusFilter !== "all"
                  ? "Aucune chambre trouvée"
                  : "Aucune chambre dans ce type"}
              </div>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par ajouter votre première chambre"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={handleAddRoom}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la première chambre
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Code
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Libellé
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      État
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredRooms.map((room, index) => (
                    <tr
                      key={room.pieceid}
                      className="hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {room.piececode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {room.piecelibelle}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            room.fonctionnel
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {room.fonctionnel ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Fonctionnel
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Hors service
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleInfoClick(room)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="historique"
                          >
                            <Info className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modales */}
        <RoomForm
          isOpen={isRoomFormOpen}
          onClose={handleCloseRoomForm}
          onSubmit={handleSubmitRoom}
          room={editingRoom}
          typepieceid={roomType.typepieceid}
        />

        {/* Modal de confirmation pour suppression de chambre */}
        <ConfirmationModal
          isOpen={showDeleteRoomModal}
          onClose={() => {
            setShowDeleteRoomModal(false);
            setRoomToDelete(null);
          }}
          onConfirm={confirmDeleteRoom}
          title="Supprimer la chambre"
          message={`Êtes-vous sûr de vouloir supprimer la chambre "${roomToDelete?.piecelibelle}" (${roomToDelete?.piececode}) ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />

        {/* Modal de confirmation pour suppression du type */}
        <ConfirmationModal
          isOpen={showDeleteTypeModal}
          onClose={() => setShowDeleteTypeModal(false)}
          onConfirm={confirmDeleteType}
          title="Supprimer le type de pièce"
          message={`Êtes-vous sûr de vouloir supprimer le type de pièce "${
            roomType.libellepiece
          }" ? ${
            rooms.length > 0
              ? `${rooms.length} chambre(s) associée(s) seront également supprimées.`
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

         {/* Modal pour afficher les états de la pièce */}
        <RoomStatesModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          room={selectedRoom}
          roomStates={roomStates}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
