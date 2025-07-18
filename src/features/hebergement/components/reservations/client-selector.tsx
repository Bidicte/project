import React, { useState, useEffect } from 'react';
import { Search, User, Building, ChevronDown, CheckCircle } from 'lucide-react';
import { useClients } from '../../hooks/reservations/use-clients';
import type { RegularClient, BusinessClient } from '../../types/client';
import type { ClientHeberge } from '../../types/reservation';

interface ClientSelectorProps {
  typeClient: 'Régulier' | 'Business' | 'Occasionnel';
  onClientSelect: (clientData: Partial<ClientHeberge>) => void;
  selectedClientId?: string;
}

export default function ClientSelector({
  typeClient,
  onClientSelect,
  selectedClientId
}: ClientSelectorProps) {
  const {
    regularClients,
    businessClients,
    loading,
    error,
    fetchClients,
    searchClients
  } = useClients();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<RegularClient | BusinessClient | null>(null);

  useEffect(() => {
    if (typeClient !== 'Occasionnel') {
      fetchClients(typeClient);
    }
  }, [typeClient, fetchClients]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchClients(searchTerm, typeClient as 'Régulier' | 'Business');
    } else if (searchTerm.length === 0) {
      fetchClients(typeClient as 'Régulier' | 'Business');
    }
  }, [searchTerm, typeClient, searchClients, fetchClients]);

  const handleClientSelect = (client: RegularClient | BusinessClient) => {
    setSelectedClient(client);
    setIsOpen(false);
    setSearchTerm('');

    if (typeClient === 'Régulier') {
      const regularClient = client as RegularClient;
      onClientSelect({
        nom: regularClient.nomcltreg,
        prenom: regularClient.prenomcltreg,
        adresse: regularClient.adressecltreg,
        email: regularClient.emailcltreg,
        telephone: regularClient.telcltreg,
        ville: regularClient.villecltreg,
        pays: regularClient.payscltreg,
        typeClient: 'Régulier'
      });
    } else {
      const businessClient = client as BusinessClient;
      onClientSelect({
        nom: businessClient.raisoncltbusiness, // Pour les business, on met la raison sociale dans nom
        prenom: '', // Pas de prénom pour les entreprises
        adresse: businessClient.adrcltbusiness,
        email: businessClient.emailcltbusiness,
        telephone: businessClient.telcltbusiness,
        ville: businessClient.villecltbusiness,
        pays: businessClient.payscltbusiness,
        raisonSociale: businessClient.raisoncltbusiness,
        typeClient: 'Business'
      });
    }
  };

  const getClientDisplayName = (client: RegularClient | BusinessClient) => {
    if (typeClient === 'Régulier') {
      const regularClient = client as RegularClient;
      return `${regularClient.prenomcltreg} ${regularClient.nomcltreg}`;
    } else {
      const businessClient = client as BusinessClient;
      return businessClient.raisoncltbusiness;
    }
  };

  const getClientSubInfo = (client: RegularClient | BusinessClient) => {
    if (typeClient === 'Régulier') {
      const regularClient = client as RegularClient;
      return regularClient.emailcltreg;
    } else {
      const businessClient = client as BusinessClient;
      return businessClient.emailcltbusiness;
    }
  };

  const clients = typeClient === 'Régulier' ? regularClients : businessClients;

  if (typeClient === 'Occasionnel') {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <User className="w-5 h-5 text-blue-500 mr-2" />
          <p className="text-blue-700">
            Client occasionnel - Les informations seront saisies manuellement
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <div className="flex items-center">
            {typeClient === 'Régulier' ? (
              <User className="w-5 h-5 text-gray-400 mr-3" />
            ) : (
              <Building className="w-5 h-5 text-gray-400 mr-3" />
            )}
            <span className="text-gray-700">
              {selectedClient ? (
                <div>
                  <div className="font-medium">{getClientDisplayName(selectedClient)}</div>
                  <div className="text-sm text-gray-500">{getClientSubInfo(selectedClient)}</div>
                </div>
              ) : (
                `Sélectionner un client ${typeClient.toLowerCase()}`
              )}
            </span>
          </div>
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
                  placeholder={`Rechercher un client ${typeClient.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Liste des clients */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">
                  <p className="text-sm">{error}</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">
                    {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
                  </p>
                </div>
              ) : (
                clients.map((client) => {
                  const clientId = typeClient === 'Régulier' 
                    ? (client as RegularClient).idcltreg 
                    : (client as BusinessClient).idcltbusiness;
                  
                  return (
                    <button
                      key={clientId}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        {typeClient === 'Régulier' ? (
                          <User className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        ) : (
                          <Building className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {getClientDisplayName(client)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getClientSubInfo(client)}
                          </div>
                          {typeClient === 'Régulier' && (
                            <div className="text-xs text-gray-400">
                              {(client as RegularClient).villecltreg}, {(client as RegularClient).payscltreg}
                            </div>
                          )}
                          {typeClient === 'Business' && (
                            <div className="text-xs text-gray-400">
                              {(client as BusinessClient).villecltbusiness}, {(client as BusinessClient).payscltbusiness}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedClientId === clientId && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bouton pour créer un nouveau client */}
            <div className="p-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onClientSelect({ typeClient });
                }}
                className="w-full text-left p-2 text-blue-600 hover:bg-blue-50 rounded-md text-sm font-medium"
              >
                + Créer un nouveau client {typeClient.toLowerCase()}
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <div>
              <p className="text-green-800 font-medium">Client sélectionné</p>
              <p className="text-green-700 text-sm">
                Les informations ont été automatiquement remplies
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}