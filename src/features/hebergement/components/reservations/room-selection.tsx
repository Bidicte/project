import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Wifi, 
  Coffee, 
  Car, 
  Tv, 
  Check, 
  X, 
  Info, 
  Star,
  MapPin,
  Square,
  Bed,
  Bath,
  ChevronDown,
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';
import type { Piece, TypePieceDisponible, PieceDisponible } from '../../types/reservation';

interface RoomSelectionProps {
  dateArrivee: string;
  dateDepart: string;
  typePieceId: string;
  piecesSelectionnees: string[];
  onPiecesChange: (pieceIds: string[]) => void;
  onTypePieceChange: (typePieceId: string) => void;
  typesPiecesDisponibles: TypePieceDisponible[];
  piecesDisponibles: PieceDisponible[];
  loading?: boolean;
  error?: string;
}

interface FilterOptions {
  etageMin?: number;
  etageMax?: number;
  superficieMin?: number;
  equipements?: string[];
  prixMax?: number;
}

const equipementIcons: Record<string, React.ReactNode> = {
  'wifi': <Wifi className="w-4 h-4" />,
  'coffee': <Coffee className="w-4 h-4" />,
  'parking': <Car className="w-4 h-4" />,
  'tv': <Tv className="w-4 h-4" />,
  'bed': <Bed className="w-4 h-4" />,
  'bath': <Bath className="w-4 h-4" />,
};

export default function RoomSelection({
  dateArrivee,
  dateDepart,
  typePieceId,
  piecesSelectionnees,
  onPiecesChange,
  onTypePieceChange,
  typesPiecesDisponibles,
  piecesDisponibles,
  loading = false,
  error
}: RoomSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [expandedPieces, setExpandedPieces] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const typePieceSelectionnee = typesPiecesDisponibles.find(tp => tp.id === typePieceId);
  
  const piecesFiltrees = piecesDisponibles.filter(piece => {
    // Filtre par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!piece.numero.toLowerCase().includes(term) && 
          !piece.nom.toLowerCase().includes(term)) {
        return false;
      }
    }
    
    // Filtre par étage
    if (filters.etageMin !== undefined && piece.etage < filters.etageMin) return false;
    if (filters.etageMax !== undefined && piece.etage > filters.etageMax) return false;
    
    // Filtre par superficie
    if (filters.superficieMin !== undefined && piece.superficie < filters.superficieMin) return false;
    
    // Filtre par prix
    if (filters.prixMax !== undefined && piece.prixActuel > filters.prixMax) return false;
    
    // Filtre par équipements
    if (filters.equipements && filters.equipements.length > 0) {
      const hasAllEquipements = filters.equipements.every(eq => 
        piece.equipements.includes(eq)
      );
      if (!hasAllEquipements) return false;
    }
    
    return true;
  });

  const togglePieceSelection = (pieceId: string) => {
    if (piecesSelectionnees.includes(pieceId)) {
      onPiecesChange(piecesSelectionnees.filter(id => id !== pieceId));
    } else {
      onPiecesChange([...piecesSelectionnees, pieceId]);
    }
  };

  const toggleExpandPiece = (pieceId: string) => {
    const newExpanded = new Set(expandedPieces);
    if (newExpanded.has(pieceId)) {
      newExpanded.delete(pieceId);
    } else {
      newExpanded.add(pieceId);
    }
    setExpandedPieces(newExpanded);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const getNuitees = () => {
    if (!dateArrivee || !dateDepart) return 0;
    const debut = new Date(dateArrivee);
    const fin = new Date(dateDepart);
    const diffTime = Math.abs(fin.getTime() - debut.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatutColor = (disponible: boolean, conflits?: any[]) => {
    if (!disponible || (conflits && conflits.length > 0)) {
      return 'bg-red-100 border-red-300 text-red-700';
    }
    return 'bg-green-100 border-green-300 text-green-700';
  };

  const getStatutText = (disponible: boolean, conflits?: any[]) => {
    if (!disponible) return 'Occupée';
    if (conflits && conflits.length > 0) return 'Partiellement occupée';
    return 'Disponible';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <X className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec sélection du type de pièce */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sélection des pièces
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{getNuitees()} nuitée{getNuitees() > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Sélection du type de pièce */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de pièce
          </label>
          <select
            value={typePieceId}
            onChange={(e) => onTypePieceChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Sélectionner un type --</option>
            {typesPiecesDisponibles.map(type => (
              <option key={type.id} value={type.id}>
                {type.nom} - {type.nombreDisponible} disponible{type.nombreDisponible > 1 ? 's' : ''}
                {type.prixBase > 0 && ` (à partir de ${type.prixBase}€)`}
              </option>
            ))}
          </select>
        </div>

        {/* Informations sur le type sélectionné */}
        {typePieceSelectionnee && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900">{typePieceSelectionnee.nom}</h4>
                <p className="text-sm text-blue-700 mt-1">{typePieceSelectionnee.description}</p>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Capacité: {typePieceSelectionnee.capacite} personne{typePieceSelectionnee.capacite > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtres et recherche */}
      {typePieceId && piecesDisponibles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">
              Pièces disponibles ({piecesFiltrees.length})
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {viewMode === 'grid' ? 'Liste' : 'Grille'}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filtres
                {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Étage min
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.etageMin || ''}
                    onChange={(e) => setFilters({...filters, etageMin: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Superficie min (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.superficieMin || ''}
                    onChange={(e) => setFilters({...filters, superficieMin: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix max (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.prixMax || ''}
                    onChange={(e) => setFilters({...filters, prixMax: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Effacer les filtres
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Liste des pièces */}
      {typePieceId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {piecesFiltrees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Square className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">Aucune pièce disponible pour ces critères</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {piecesFiltrees.map(piece => (
                <div
                  key={piece.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    piecesSelectionnees.includes(piece.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePieceSelection(piece.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 mr-3">
                          {piecesSelectionnees.includes(piece.id) ? (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {piece.numero} - {piece.nom}
                          </h4>
                          <div className="flex items-center mt-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>Étage {piece.etage}</span>
                            <span className="mx-2">•</span>
                            <Square className="w-4 h-4 mr-1" />
                            <span>{piece.superficie} m²</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatutColor(piece.disponible, piece.conflits)}`}>
                          {getStatutText(piece.disponible, piece.conflits)}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {piece.prixActuel}€
                          </div>
                          <div className="text-sm text-gray-500">
                            par nuitée
                          </div>
                        </div>
                      </div>

                      {/* Équipements */}
                      {piece.equipements && piece.equipements.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {piece.equipements.slice(0, 4).map(equipement => (
                            <div
                              key={equipement}
                              className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {equipementIcons[equipement] || <Star className="w-3 h-3" />}
                              <span className="ml-1 capitalize">{equipement}</span>
                            </div>
                          ))}
                          {piece.equipements.length > 4 && (
                            <div className="flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                              +{piece.equipements.length - 4} autres
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bouton d'expansion pour plus de détails */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpandPiece(piece.id);
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {expandedPieces.has(piece.id) ? (
                          <>
                            Moins de détails
                            <ChevronUp className="w-4 h-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Plus de détails
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>

                      {/* Détails étendus */}
                      {expandedPieces.has(piece.id) && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          {piece.description && (
                            <p className="text-sm text-gray-700 mb-3">{piece.description}</p>
                          )}
                          
                          {/* Tous les équipements */}
                          {piece.equipements && piece.equipements.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Équipements</h5>
                              <div className="flex flex-wrap gap-2">
                                {piece.equipements.map(equipement => (
                                  <div
                                    key={equipement}
                                    className="flex items-center px-2 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600"
                                  >
                                    {equipementIcons[equipement] || <Star className="w-3 h-3" />}
                                    <span className="ml-1 capitalize">{equipement}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Conflits s'il y en a */}
                          {piece.conflits && piece.conflits.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-red-700 mb-2">Conflits de disponibilité</h5>
                              <div className="space-y-1">
                                {piece.conflits.map((conflit, index) => (
                                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    Du {new Date(conflit.dateDebut).toLocaleDateString()} au {new Date(conflit.dateFin).toLocaleDateString()} - {conflit.motif}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Caractéristiques supplémentaires */}
                          {piece.caracteristiques && Object.keys(piece.caracteristiques).length > 0 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 mb-2">Caractéristiques</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(piece.caracteristiques).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-gray-600 capitalize">{key}:</span>
                                    <span className="text-gray-900">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Résumé de la sélection */}
          {piecesSelectionnees.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">
                    {piecesSelectionnees.length} pièce{piecesSelectionnees.length > 1 ? 's' : ''} sélectionnée{piecesSelectionnees.length > 1 ? 's' : ''}
                  </h4>
                  <p className="text-sm text-blue-700">
                    Total estimé: {piecesSelectionnees.reduce((total, pieceId) => {
                      const piece = piecesDisponibles.find(p => p.id === pieceId);
                      return total + (piece?.prixActuel || 0);
                    }, 0) * getNuitees()}€ pour {getNuitees()} nuitée{getNuitees() > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600">
                    {piecesSelectionnees.map(pieceId => {
                      const piece = piecesDisponibles.find(p => p.id === pieceId);
                      return piece?.numero;
                    }).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}