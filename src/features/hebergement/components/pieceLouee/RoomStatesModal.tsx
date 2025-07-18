// components/RoomStatesModal.tsx
import React from 'react';
import { X, CheckCircle, XCircle, Calendar, FileText } from 'lucide-react';
import type { Room,RoomState } from '../../types/pieceLouee/room';

interface RoomStatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  roomStates: RoomState[];
  loading: boolean;
  error: string | null;
}

export const RoomStatesModal: React.FC<RoomStatesModalProps> = ({ 
  isOpen, 
  onClose, 
  room, 
  roomStates, 
  loading, 
  error 
}) => {
  if (!isOpen || !room) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
        
        {/* Header - Style moderne blanc */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Historique des états</h2>
            <p className="text-sm text-gray-500 mt-1">
              Pièce {room.piececode} - {room.piecelibelle}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Chargement des états...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-medium">Une erreur est survenue</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && roomStates.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun état enregistré</h3>
              <p className="text-gray-500">Cette pièce n'a pas encore d'historique d'états.</p>
            </div>
          )}

          {/* States list */}
          {!loading && !error && roomStates.length > 0 && (
            <div className="space-y-6">
              
              {/* Header avec compteur */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {roomStates.length} état{roomStates.length > 1 ? 's' : ''} trouvé{roomStates.length > 1 ? 's' : ''}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Plus récent en premier
                </span>
              </div>

              {/* Liste des états */}
              <div className="space-y-4">
                {roomStates
                  .sort((a, b) => new Date(b.dateetat).getTime() - new Date(a.dateetat).getTime())
                  .map((state, index) => (
                    <div
                      key={state.etatpieceid}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      {/* En-tête de l'état */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {state.etatpiece ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                          )}
                          
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              state.etatpiece 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {state.etatpiece ? 'Fonctionnel' : 'Non fonctionnel'}
                            </span>
                          </div>
                        </div>
                        
                        {index === 0 && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            État actuel
                          </span>
                        )}
                      </div>
                      
                      {/* Date */}
                      <div className="flex items-center text-gray-600 text-sm mb-3">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="font-medium">Modifié le {formatDate(state.dateetat)}</span>
                      </div>
                      
                      {/* Motif si présent */}
                      {state.motifetat && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start space-x-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                Motif du changement
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {state.motifetat} eeeeeeee
                              </p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                 eeeeeeee
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Style moderne avec boutons */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};