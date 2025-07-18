import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  Check, 
  X, 
  Search, 
  Filter,
  MapPin,
  Users,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown
} from 'lucide-react';

interface ChambreSpecifique {
  id: string;
  numero: string;
  nom: string;
  typeChambreId: string;
  typeChambreNom: string;
  etage: number;
  capacite: number;
  superficie: number;
  equipements: string[];
  statut: 'libre' | 'occupee' | 'maintenance' | 'menage';
  prixActuel: number;
  disponible: boolean;
  conflits?: Array<{
    dateDebut: string;
    dateFin: string;
    motif: string;
  }>;
  caracteristiques?: Record<string, any>;
}

interface RoomSpecificSelectionProps {
  dateDebut: string;
  dateFin: string;
  typeChambreId: string;
  chambresSelectionnees: string[];
  onChambresChange: (chambreIds: string[]) => void;
  loading?: boolean;
  error?: string;
  onFilteredChambresChange?: (ids: string[]) => void; // Ajout pour exposer les chambres filtrées
}

const equipementIcons: Record<string, React.ReactNode> = {
  'wifi': <Star className="w-3 h-3" />,
  'tv': <Star className="w-3 h-3" />,
  'minibar': <Star className="w-3 h-3" />,
  'climatisation': <Star className="w-3 h-3" />,
  'balcon': <Star className="w-3 h-3" />,
  'coffre': <Star className="w-3 h-3" />,
};

// Mock API service
const mockChambresService = {
  async getChambresDisponibles(dateDebut: string, dateFin: string, typeChambreId: string): Promise<ChambreSpecifique[]> {
    // Simulation d'un délai API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: '101',
        numero: '101',
        nom: 'Chambre Standard Vue Jardin',
        typeChambreId: '1',
        typeChambreNom: 'Chambre Standard',
        etage: 1,
        capacite: 2,
        superficie: 25,
        equipements: ['wifi', 'tv', 'climatisation'],
        statut: 'libre' as 'libre',
        prixActuel: 80,
        disponible: true,
        caracteristiques: {
          'Vue': 'Jardin',
          'Lit': 'Double',
          'Salle de bain': 'Privée'
        }
      },
      {
        id: '102',
        numero: '102',
        nom: 'Chambre Standard Vue Piscine',
        typeChambreId: '1',
        typeChambreNom: 'Chambre Standard',
        etage: 1,
        capacite: 2,
        superficie: 25,
        equipements: ['wifi', 'tv', 'climatisation', 'balcon'],
        statut: 'libre' as 'libre',
        prixActuel: 90,
        disponible: true,
        caracteristiques: {
          'Vue': 'Piscine',
          'Lit': 'Double',
          'Salle de bain': 'Privée'
        }
      },
      {
        id: '103',
        numero: '103',
        nom: 'Chambre Standard',
        typeChambreId: '1',
        typeChambreNom: 'Chambre Standard',
        etage: 1,
        capacite: 2,
        superficie: 23,
        equipements: ['wifi', 'tv'],
        statut: 'occupee' as 'occupee',
        prixActuel: 75,
        disponible: false,
        conflits: [{
          dateDebut: dateDebut,
          dateFin: dateFin,
          motif: 'Réservation existante'
        }]
      },
      {
        id: '201',
        numero: '201',
        nom: 'Suite Executive',
        typeChambreId: '2',
        typeChambreNom: 'Suite Executive',
        etage: 2,
        capacite: 4,
        superficie: 45,
        equipements: ['wifi', 'tv', 'climatisation', 'minibar', 'coffre', 'balcon'],
        statut: 'libre' as 'libre',
        prixActuel: 150,
        disponible: true,
        caracteristiques: {
          'Vue': 'Mer',
          'Lit': 'King Size',
          'Salon': 'Séparé',
          'Salle de bain': 'Double vasque'
        }
      },
      {
        id: '301',
        numero: '301',
        nom: 'Chambre Familiale',
        typeChambreId: '3',
        typeChambreNom: 'Chambre Familiale',
        etage: 3,
        capacite: 6,
        superficie: 35,
        equipements: ['wifi', 'tv', 'climatisation'],
        statut: 'menage' as 'menage',
        prixActuel: 120,
        disponible: true,
        caracteristiques: {
          'Lits': '1 double + 2 simples',
          'Configuration': 'Famille',
          'Salle de bain': 'Baignoire'
        }
      }
    ].filter(chambre => chambre.typeChambreId === typeChambreId);
  }
};

export default function RoomSpecificSelection({
  dateDebut,
  dateFin,
  typeChambreId,
  chambresSelectionnees,
  onChambresChange,
  loading = false,
  error,
  onFilteredChambresChange
}: RoomSpecificSelectionProps) {
  // Ajout du filtre statut si manquant
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [chambres, setChambres] = useState<ChambreSpecifique[]>([]);
  const [loadingChambres, setLoadingChambres] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // <-- Déplacé ici, AVANT tout return
  // Liste filtrée des chambres (doit être déclarée avant le useEffect qui l'utilise)
  const chambresFiltered = chambres.filter(chambre => {
    // Filtre par recherche (seulement le numéro)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!chambre.numero.toLowerCase().includes(term)) {
        return false;
      }
    }
    // Filtre par statut
    if (filterStatut && chambre.statut !== filterStatut) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (dateDebut && dateFin && typeChambreId) {
      fetchChambres();
    }
  }, [dateDebut, dateFin, typeChambreId]);

  // Appeler le callback à chaque changement de chambres filtrées
  useEffect(() => {
    if (onFilteredChambresChange) {
      const filteredIds = chambresFiltered.filter(c => c.disponible).map(c => c.id);
      // On évite de rappeler si la liste n'a pas changé
      onFilteredChambresChange(filteredIds);
    }
  }, [chambresFiltered.length, chambresFiltered.map(c => c.id).join(','), onFilteredChambresChange]);

  const fetchChambres = async () => {
    setLoadingChambres(true);
    try {
      const data = await mockChambresService.getChambresDisponibles(dateDebut, dateFin, typeChambreId);
      setChambres(data);
    } catch (err) {
      console.error('Erreur lors du chargement des chambres:', err);
    } finally {
      setLoadingChambres(false);
    }
  };

  const toggleChambreSelection = (chambreId: string) => {
    if (chambresSelectionnees.includes(chambreId)) {
      onChambresChange(chambresSelectionnees.filter(id => id !== chambreId));
    } else {
      onChambresChange([...chambresSelectionnees, chambreId]);
    }
  };

  const getStatutColor = (statut: string, disponible: boolean) => {
    if (!disponible) return 'bg-red-100 border-red-300 text-red-700';
    
    switch (statut) {
      case 'libre':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'occupee':
        return 'bg-red-100 border-red-300 text-red-700';
      case 'maintenance':
        return 'bg-orange-100 border-orange-300 text-orange-700';
      case 'menage':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getStatutText = (statut: string, disponible: boolean) => {
    if (!disponible) return 'Indisponible';
    
    switch (statut) {
      case 'libre':
        return 'Libre';
      case 'occupee':
        return 'Occupée';
      case 'maintenance':
        return 'Maintenance';
      case 'menage':
        return 'Ménage';
      default:
        return statut;
    }
  };

  if (loading || loadingChambres) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Chargement des chambres...</span>
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

  if (!dateDebut || !dateFin || !typeChambreId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bed className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Sélectionnez d'abord les dates et le type de chambre</p>
      </div>
    );
  }

  // Gestion du select all
  const allAvailableIds = chambresFiltered.filter(c => c.disponible).map(c => c.id);
  const isAllSelected = allAvailableIds.length > 0 && allAvailableIds.every(id => chambresSelectionnees.includes(id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChambresChange(chambresSelectionnees.filter(id => !allAvailableIds.includes(id)));
    } else {
      onChambresChange(Array.from(new Set([...chambresSelectionnees, ...allAvailableIds])));
    }
  };

  // Affichage du bouton principal
  const selectedCount = chambresSelectionnees.filter(id => allAvailableIds.includes(id)).length;
  const buttonLabel = selectedCount > 0 ? `${selectedCount} chambre${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''}` : 'Sélectionner des chambres';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-gray-700">{buttonLabel}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Option tout sélectionner */}
          <div className="flex items-center px-4 py-2 border-b border-gray-100">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="mr-2"
              id="select-all-chambres"
            />
            <label htmlFor="select-all-chambres" className="text-sm cursor-pointer select-none">
              Tout sélectionner
            </label>
          </div>
          {/* Liste des chambres disponibles */}
          {chambresFiltered.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Aucune chambre disponible</div>
          ) : (
            chambresFiltered.filter(c => c.disponible).map(chambre => (
              <div
                key={chambre.id}
                className="flex items-center px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                onClick={() => {
                  if (chambresSelectionnees.includes(chambre.id)) {
                    onChambresChange(chambresSelectionnees.filter(id => id !== chambre.id));
                  } else {
                    onChambresChange([...chambresSelectionnees, chambre.id]);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={chambresSelectionnees.includes(chambre.id)}
                  onChange={() => {
                    if (chambresSelectionnees.includes(chambre.id)) {
                      onChambresChange(chambresSelectionnees.filter(id => id !== chambre.id));
                    } else {
                      onChambresChange([...chambresSelectionnees, chambre.id]);
                    }
                  }}
                  className="mr-2"
                  id={`chambre-${chambre.id}`}
                />
                <label htmlFor={`chambre-${chambre.id}`} className="text-sm cursor-pointer select-none">
                  Chambre {chambre.numero}
                </label>
                {chambresSelectionnees.includes(chambre.id) && <Check className="w-4 h-4 text-blue-500 ml-auto" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}