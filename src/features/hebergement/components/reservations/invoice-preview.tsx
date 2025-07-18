import React from "react";
import {
  FileText,
  Calendar,
  User,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type {
  SimulationReservation,
  Reservant,
  ClientHeberge,
} from "../../types/reservation";

interface InvoicePreviewProps {
  simulation: SimulationReservation | null;
  reservant: Reservant;
  clientHeberge: ClientHeberge;
  sejours: Array<{
    dateArrivee: string;
    dateDepart: string;
    heureArrivee?: string;
    heureDepart?: string;
    typePieceId: string;
    typeChambreNom?: string;
    tarifType?: "nuitee" | "passage";
    tarifNom?: string;
    tarifPrix?: number;
    tarifTva?: number;
    piecesIds: string[];
    note?: string;
  }>;
  numeroReservation?: string;
}

export default function InvoicePreview({
  simulation,
  reservant,
  clientHeberge,
  sejours,
  numeroReservation = "PREV-2024-001",
}: InvoicePreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    // Affiche en XOF/FCFA sans décimales
    return (
      amount.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " FCFA"
    );
  };

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  // Pour les passages, calculer le nombre d'heures entières (arrondi supérieur)
  const calculateTotalHours = (
    startDate: string,
    startTime: string,
    endDate: string,
    endTime: string
  ) => {
    if (!startDate || !endDate || !startTime || !endTime) return 0;
    const startDateTime = new Date(`${startDate}T${startTime}:00`);
    const endDateTime = new Date(`${endDate}T${endTime}:00`);
    const diffMilliseconds = endDateTime.getTime() - startDateTime.getTime();
    const diffHours = diffMilliseconds / (1000 * 60 * 60);
    return Math.ceil(diffHours);
  };

  // Calculer une simulation basique si pas de simulation fournie
  const calculateBasicSimulation = () => {
    if (!sejours || sejours.length === 0) return null;

    let totalHT = 0;
    let totalTVA = 0;

    const sejoursWithCalculations = sejours.map((sejour) => {
      // Utilise un prix par défaut (80) si pas de tarif fourni
      const prix = sejour.tarifPrix || 80;
      const tauxTVA = (sejour.tarifTva || 18) / 100; // Récupère le taux TVA du tarif

      // Calcul de la quantité selon le type de tarif
      let quantite;
      if (sejour.tarifType === "passage") {
        // Pour les passages, calculer les heures
        quantite = calculateTotalHours(
          sejour.dateArrivee,
          sejour.heureArrivee || "00:00",
          sejour.dateDepart,
          sejour.heureDepart || "23:59"
        );
      } else {
        // Pour les nuitées, calculer les nuits
        quantite = calculateNights(sejour.dateArrivee, sejour.dateDepart);
      }

      const montantHT = prix * quantite;
      const montantTVA = montantHT * tauxTVA;
      totalHT += montantHT;
      totalTVA += montantTVA;
      return {
        ...sejour,
        montantHT,
        montantTVA,
        quantite,
      };
    });

    return {
      totalHT,
      totalTVA,
      totalTTC: totalHT + totalTVA,
      sejours: sejoursWithCalculations,
    };
  };

  const displaySimulation = simulation || calculateBasicSimulation();

  if (!displaySimulation) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Prévisualisation de la facture
          </h3>
          <p className="text-gray-600">
            Remplissez les informations de réservation pour voir la
            prévisualisation
          </p>
        </div>
      </div>
    );
  }

  // Type guard pour vérifier si un séjour est bien du type attendu
  function isSejourWithDetails(sejour: any): sejour is {
    dateArrivee: string;
    dateDepart: string;
    tarifType?: string;
    heureArrivee?: string;
    heureDepart?: string;
    nights?: number;
    chambresSelectionnees?: string[];
    piecesIds?: string[];
    montantHT?: number;
    montantTVA?: number;
  } {
    return (
      typeof sejour === "object" &&
      typeof sejour.dateArrivee === "string" &&
      typeof sejour.dateDepart === "string"
    );
  }

  let groupedSejours: Array<{
    key: string;
    count: number;
    montantU: number;
    montantHT: number;
  }> = [];

  if (
    Array.isArray(displaySimulation.sejours) &&
    displaySimulation.sejours.length > 0
  ) {
    const grouped: Record<
      string,
      { count: number; montantU: number; montantTotal: number }
    > = {};

    displaySimulation.sejours.forEach((sejour: any) => {
      const typeChambreNom = sejour.typeChambreNom || "Type inconnu";
      const tarifNom = sejour.tarifNom || "";
      const key = `${typeChambreNom} / ${tarifNom}`;
      const quantite = sejour.quantite || 1;
      const montantHT = sejour.montantHT || 0;

      if (!grouped[key])
        grouped[key] = { count: 0, montantU: 0, montantTotal: 0 };

      grouped[key].count += quantite;
      grouped[key].montantTotal += montantHT;
      grouped[key].montantU = montantHT / quantite; // Prix unitaire
    });

    groupedSejours = Object.entries(grouped).map(([key, value]) => ({
      key,
      count: value.count,
      montantU: value.montantU,
      montantHT: value.montantTotal,
    }));
  }

  console.log(displaySimulation.sejours);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* En-tête de la facture */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">CHK-PMS</h2>
            <p className="text-blue-100">Système de gestion hôtelière</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold mb-1">
              Prévisualisation Facture
            </h3>
            <p className="text-blue-100">N° {numeroReservation}</p>
            <p className="text-blue-100">
              {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Informations clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Réservant */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-blue-600" />
              Réservant
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                {reservant.prenom} {reservant.nom}
              </p>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-2" />
                  {reservant.telephone}
                </div>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-2" />
                  {reservant.email}
                </div>
              </div>
            </div>
          </div>

          {/* Client hébergé */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              {clientHeberge.typeClient === "Business" ? (
                <Building className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <User className="w-4 h-4 mr-2 text-green-600" />
              )}
              Client hébergé ({clientHeberge.typeClient})
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">
                {clientHeberge.typeClient === "Business"
                  ? clientHeberge.raisonSociale
                  : `${clientHeberge.prenom} ${clientHeberge.nom}`}
              </p>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-2" />
                  {clientHeberge.telephone}
                </div>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-2" />
                  {clientHeberge.email}
                </div>
                {clientHeberge.adresse && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    {clientHeberge.adresse}, {clientHeberge.ville},{" "}
                    {clientHeberge.pays}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Détail des séjours */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-purple-600" />
            Détail des séjours
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Désignation
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Nombre(s)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Prix U.
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {groupedSejours.length > 0 ? (
                  groupedSejours.map(({ key, count, montantU, montantHT }) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{key}</td>
                      <td className="px-4 py-3 text-right">{count}</td>
                      <td className="px-4 py-3 text-right">
                        {montantU}
                        {/* {formatCurrency(montantU)} */}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {montantHT}
                        {/* {formatCurrency(montantHT)} */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-3 text-gray-400 text-center"
                      colSpan={4}
                    >
                      Aucun séjour à afficher
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Résumé financier */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT :</span>
                <span className="font-medium">
                  {formatCurrency(
                    (displaySimulation as any).montantHT ||
                      (displaySimulation as any).totalHT ||
                      0
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA :</span>
                <span className="font-medium">
                  {formatCurrency(
                    (displaySimulation as any).montantTVA ||
                      (displaySimulation as any).totalTVA ||
                      0
                  )}
                </span>
              </div>
              {((displaySimulation as any).montantReductions || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réductions :</span>
                  <span className="font-medium">
                    -
                    {formatCurrency(
                      (displaySimulation as any).montantReductions || 0
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC :</span>
                  <span className="text-blue-600">
                    {formatCurrency(
                      (displaySimulation as any).montantTTC ||
                        (displaySimulation as any).totalTTC ||
                        0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes et conditions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">
            Conditions générales
          </h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Les prix sont exprimés en XOF/FCFA TTC</p>
            <p>• L'arrivée s'effectue à partir de 12h00, le départ a 11h00</p>
            <p>• Toute annulation doit être signalée 48h à l'avance</p>
            <p>• Un acompte sera demandé à la confirmation</p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Document généré le {formatDate(new Date().toISOString())} -
            Prévisualisation uniquement
          </p>
        </div>
      </div>
    </div>
  );
}
