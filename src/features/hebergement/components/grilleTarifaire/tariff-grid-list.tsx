import type React from "react"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Edit, Trash2, Info, ArrowUpDown } from "lucide-react"


import { tarifService } from '../../services/grilleTarifaire/tarifService';
import { getTvas } from '../../services/grilleTarifaire/tvaService';
import { getRentalModes } from '../../services/grilleTarifaire/modeLocationService';
import type { Tarif } from "../../types/grilleTarifaire/tarif"
import type { Tva } from "../../types/grilleTarifaire/tva"
import type { ModeLocation } from "../../types/grilleTarifaire/modeLocation"

interface PricingGridListProps {
  pricingGrids: Tarif[]
  onAdd: () => void
  onEdit: (grid: Tarif) => void
  onDelete: (id: string) => void
  onViewDetails: (tarif:Tarif) => void
}

export function TariffGridList({ pricingGrids, onAdd, onEdit, onDelete, onViewDetails }: PricingGridListProps) {
  const [sortField, setSortField] = useState<keyof Tarif | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [tariffs, setTariffs] = useState<Tarif[]>([]);
  const [tvas, setTvas] = useState<Tva[]>([]);
  const [rentalModes, setRentalModes] = useState<ModeLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tarifRes, tvaRes, rentalModeRes] = await Promise.all([
          tarifService.getTariffs(),
          getTvas(),
          getRentalModes(),
        ]);
        setTariffs(tarifRes);
        setTvas(tvaRes);
        setRentalModes(rentalModeRes);
      } catch (err) {
        console.error('Erreur chargement', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getTvaCode = (id: number) =>
    tvas.find(t => t.tvaid === id)?.codetva || 'N/A';

  const getRentalLabel = (id: number) =>
    rentalModes.find(m => m.modelocatid === id)?.modelocatlibelle || 'N/A';


  if (loading) return <p>Chargement en cours...</p>;

  const handleSort = (field: keyof Tarif) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedGrids = [...pricingGrids].sort((a, b) => {
    if (!sortField) return 0

    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const SortableHeader = ({ field, children }: { field: keyof Tarif; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="w-3 h-3 text-gray-400" />
      </div>
    </th>
  )

  return (
       <div className="mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Grille tarifaire</h1>
          <p className="text-gray-600">Configurez vos grilles tarifaires ici ainsi que les prix applicables </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
             Nouveau tarif
          </button>
        </div>
      </div>
         <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900"></h1>
            <Maximize2 className="w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={onAdd}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
           
          </button>
        </div> */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="tarifid">N°</SortableHeader>
                <SortableHeader field="codetarif">Code</SortableHeader>
                <SortableHeader field="libelletarif">Description</SortableHeader>
                <SortableHeader field="codetva">TVA</SortableHeader>
                <SortableHeader field="modelocatlibelle">M.Location</SortableHeader>
                <SortableHeader field="ttcactive">Montant</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tariffs.map((t, index) => (
                <tr key={t.tarifid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.codetarif}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => onViewDetails(t)}>
                      {t.libelletarif}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={t.libelletarif === "Aucun" ? "text-blue-600" : ""}>{getTvaCode(t.tvaid)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRentalLabel(t.modelocatid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        t.ttcactive === 1 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {t.ttcactive === 1 ? "TTC" : "HT"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onEdit(t)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => onDelete(t.tarifid)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                      <button
                        onClick={() => onViewDetails(t)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Info className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* {sortedGrids.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Aucune grille tarifaire trouvée
                  </td>
                </tr>
              )} */}
            </tbody>
          </table>
        </div>
      </div>
      </div>  
  )
}
