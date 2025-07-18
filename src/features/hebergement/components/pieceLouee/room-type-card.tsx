import { useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Euro,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { RoomTable } from "./room-table";
import { ConfirmationModal } from "./confirmation-modal";
import type { Room, RoomTypeWithTarif } from "../../types/pieceLouee/room";

interface RoomTypeCardProps {
  roomType: RoomTypeWithTarif;
  rooms: Room[];
  onEditType: (roomType: RoomTypeWithTarif) => void;
  onDeleteType: (typepieceid: string) => void;
  onAddRoom: (typepieceid: string) => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (pieceid: string) => void;
}

export function RoomTypeCard({
  roomType,
  rooms,
  onEditType,
  onDeleteType,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
}: RoomTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const functionalRooms = rooms.filter((room) => room.fonctionnel).length;
  const nonFunctionalRooms = rooms.length - functionalRooms;

  // Debug: Vérifier que les pièces sont correctement filtrées
  // console.log(`Type: ${roomType.libellepiece} (${roomType.typepieceid})`);
  // console.log(`Pièces pour ce type:`, rooms.map(r => ({id: r.pieceid, typeId: r.typepieceid, libelle: r.piecelibelle})))
  // console.log(`Total pièces: ${rooms.length}, Fonctionnelles: ${functionalRooms}, Hors service: ${nonFunctionalRooms}`)

  const getStatusColor = () => {
    if (rooms.length === 0) return "bg-gray-100 text-gray-600";
    if (functionalRooms === rooms.length) return "bg-green-100 text-green-700";
    if (functionalRooms === 0) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusIcon = () => {
    if (rooms.length === 0) return <AlertCircle className="h-4 w-4" />;
    if (functionalRooms === rooms.length)
      return <CheckCircle className="h-4 w-4" />;
    if (functionalRooms === 0) return <XCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? "Réduire" : "Développer"}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {roomType.libellepiece}
                </h3>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
                >
                  {getStatusIcon()}
                  <span>
                    {rooms.length === 0
                      ? "Aucune pièce"
                      : functionalRooms === rooms.length
                      ? "Toutes fonctionnelles"
                      : functionalRooms === 0
                      ? "Toutes hors service"
                      : "Partiellement fonctionnelles"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-gray-900">
                    {rooms.length}
                  </span>
                  <span>pièce{rooms.length > 1 ? "s" : ""}</span>
                </div>
                {roomType.tarif && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {roomType.tarif.codetarif}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditType(roomType)}
              className="p-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              title="Modifier le type"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              title="Supprimer le type"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onAddRoom(roomType.typepieceid)}
              className="p-3 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              title="Ajouter une pièce"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          <div className="p-6">
            <RoomTable
              rooms={rooms}
              onEditRoom={onEditRoom}
              onDeleteRoom={onDeleteRoom}
              typepieceid={roomType.typepieceid}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDeleteType(roomType.typepieceid)}
        title="Supprimer le type de pièce"
        message={`Êtes-vous sûr de vouloir supprimer le type de pièce "${
          roomType.libellepiece
        }" ?${
          rooms.length > 0
            ? ` ${rooms.length} pièce(s) associée(s) seront également supprimées.`
            : ""
        }`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
}
