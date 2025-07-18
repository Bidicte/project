import React from 'react';
import { Activity, ArrowLeft, BarChart3, Clock, Users } from 'lucide-react';

export default function SuiviHebergement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* En-tête */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-green-600" />
                Suivi Hébergement
              </h1>
              <p className="text-gray-600">
                Suivi en temps réel des hébergements et occupations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
            </div>
          </div>
        </div>

        {/* Indicateurs de performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Clients actuels</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Taux d'occupation</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Durée moyenne</p>
                <p className="text-2xl font-bold text-gray-900">4.2j</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Suivi d'hébergement en développement
            </h3>
            <p className="text-gray-600">
              Cette page sera bientôt disponible avec le suivi complet des hébergements en cours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}