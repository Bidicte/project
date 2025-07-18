import React, { useState, useEffect } from "react";
import { ChevronDown, Check, Search, Bed, Users, X } from "lucide-react";

interface AvailableRoom {
  pieceid: string;
  piecelibelle: string;
  piececode: string;
  typepieceid: string;
  fonctionnel: boolean;
  libellepiecetype: string;
}

interface RoomCompactSelectorProps {
  dateDebut: string;
  dateFin: string;
  typeChambreId: string;
  chambresSelectionnees: string[];
  onChambresChange: (chambreIds: string[]) => void;
  loading?: boolean;
  error?: string;
  availableRooms?: AvailableRoom[];
}

export default function RoomCompactSelector({
  dateDebut,
  dateFin,
  typeChambreId,
  chambresSelectionnees,
  onChambresChange,
  loading = false,
  error,
  availableRooms = [],
}: RoomCompactSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Convertir les AvailableRoom en format utilisé par le composant
  const chambres = availableRooms.filter(
    (room) => room.typepieceid === typeChambreId && room.fonctionnel
  );

  const chambresFiltered = chambres.filter((chambre) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        chambre.piecelibelle.toLowerCase().includes(term) ||
        chambre.piececode.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const chambresDisponibles = chambresFiltered; // Toutes les chambres reçues sont disponibles

  const toggleChambreSelection = (chambreId: string) => {
    if (chambresSelectionnees.includes(chambreId)) {
      onChambresChange(chambresSelectionnees.filter((id) => id !== chambreId));
    } else {
      onChambresChange([...chambresSelectionnees, chambreId]);
    }
  };

  const selectAllChambres = () => {
    const allIds = chambresDisponibles.map((c) => c.pieceid);
    onChambresChange(allIds);
  };

  const clearSelection = () => {
    onChambresChange([]);
  };

  const selectedChambres = chambres.filter((c) =>
    chambresSelectionnees.includes(c.pieceid)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Chargement des chambres...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center">
          <X className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!dateDebut || !dateFin || !typeChambreId) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Bed className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">
          Sélectionnez d'abord les dates et le type de chambre
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bouton principal */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <div className="flex items-center">
            <Bed className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-700">
              {chambresSelectionnees.length > 0
                ? `${chambresSelectionnees.length} chambre${
                    chambresSelectionnees.length > 1 ? "s" : ""
                  } sélectionnée${chambresSelectionnees.length > 1 ? "s" : ""}`
                : `Sélectionner des chambres (${chambresDisponibles.length} disponibles)`}
            </span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-hidden">
            {/* Header avec recherche */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {chambresDisponibles.length} chambre
                  {chambresDisponibles.length > 1 ? "s" : ""} disponible
                  {chambresDisponibles.length > 1 ? "s" : ""}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllChambres}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Effacer
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des chambres */}
            <div className="max-h-48 overflow-y-auto">
              {chambresDisponibles.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bed className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Aucune chambre disponible</p>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-2 p-3">
                  {chambresDisponibles.map((chambre) => (
                    <button
                      key={chambre.pieceid}
                      type="button"
                      onClick={() => toggleChambreSelection(chambre.pieceid)}
                      className={`relative p-3 rounded-lg border-2 transition-all text-center hover:shadow-md ${
                        chambresSelectionnees.includes(chambre.pieceid)
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {chambre.piececode}
                      </div>
                      {/* <div className="text-xs text-gray-500 truncate">{chambre.piecelibelle}</div> */}
                      {chambresSelectionnees.includes(chambre.pieceid) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Résumé des chambres sélectionnées */}
      {selectedChambres.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 text-sm">
                {selectedChambres.length} chambre
                {selectedChambres.length > 1 ? "s" : ""} sélectionnée
                {selectedChambres.length > 1 ? "s" : ""}
              </h4>
              <p className="text-xs text-blue-700">
                {selectedChambres.map((c) => c.piececode).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
