import { useEffect, useState } from "react"
import type { PricingDetail, DayOfWeek } from "../../types/pricing"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import { TariffDetailFormModal } from "./tariff-detail-form-modal"
import type { Tarif } from "../../types/grilleTarifaire/tarif"
import Notification from "../clients/notification"
import { DeleteConfirmationModal } from "../grilleTarifaire/delete-pricing"

import { tarifService, updatePricingDetail, createPricingDetail, deletePricingDetail } from "../../services/grilleTarifaire/tarifService"

interface PricingGridDetailsProps {
  pricingGrid: Tarif
  pricingGridDetails: PricingDetail[]
  onBack: () => void
  onEdit: () => void
}

export function TariffGridDetails({ pricingGrid, pricingGridDetails, onBack}: PricingGridDetailsProps) {
  const [details, setDetails] = useState<PricingDetail[]>(pricingGridDetails || [])
  const [showForm, setShowForm] = useState(false)
  const [editingDetail, setEditingDetail] = useState<PricingDetail | null>(null)
  const [loading, setLoading] = useState(true);
 const [isDeleteTarifModalOpen, setIsDeleteTarifModalOpen] = useState(false)
const [TarifDelete, setTarifToDelete] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await tarifService.getDetailsTarifs(pricingGrid.tarifid)
        setDetails(data)
      } catch (err) {
        console.error("Erreur chargement des détails", err)
      } finally {
        setLoading(false)
      }
    }
    loadDetails()
  }, [pricingGrid.tarifid])

  const dayLabels = {
    monday: "L",
    tuesday: "M",
    wednesday: "M",
    thursday: "J",
    friday: "V",
    saturday: "S",
    sunday: "D",
  }

  const getDayColor = (isActive: boolean) => {
    return isActive ? "bg-orange-400" : "bg-gray-200"
  }
  if (loading) return <p>Chargement en cours...</p>;
  const handleAddDetail = () => {
    setEditingDetail(null)
    setShowForm(true)
  }

  
  const openDeleteModal = (id:string) => {
    setTarifToDelete(id)
    setIsDeleteTarifModalOpen(true)
  }

  const handleEditDetail = (detail: PricingDetail) => {
    setEditingDetail(detail)
    setShowForm(true)
  }

  const handleDeleteDetail = async (id: string) => {
    try {
      await  deletePricingDetail(id)
      setNotification({ type: "success", message: "Tarif supprimé avec succès" })
    }
    catch (error) {
      setNotification({ type: "error", message: "Erreur lors de la suppression du tarif" })
    }finally {
    const updatedDetails = await tarifService.getDetailsTarifs(pricingGrid.tarifid)
    setDetails(updatedDetails)
  }
    // Mettre à jour la liste des détails après la suppression

    const updatedDetails = details.filter((d) => d.tarifappid !== id)
    setDetails(updatedDetails)
    //onUpdateDetails(updatedDetails)
  }

  const handleSaveDetail = async (detailData:Omit<PricingDetail,"tarifappid">) => {
try {
const newDetail: Omit<PricingDetail,"tarifappid"> = {
        ...detailData
      }
      await createPricingDetail(pricingGrid.tarifid,newDetail)
      setNotification({ type: "success", message: "Tarif ajouté avec succès" })

}
catch (error) {
  setNotification({ type: "error", message: "Erreur lors de l'ajout d'un tarif" })
}  
finally {
    const updatedDetails = await tarifService.getDetailsTarifs(pricingGrid.tarifid)
    setDetails(updatedDetails)
  }
    setShowForm(false)
  }
  

  const handleUpdateDetail = async (detailData:PricingDetail) => {
    let updatedDetails: PricingDetail[]
    try {
     const updated = await updatePricingDetail(detailData)
      updatedDetails = details.map((d) =>
        d.tarifappid === editingDetail?.tarifappid ? { ...d, ...updated } : d
      )
      setNotification({ type: "success", message: "Tarif modifié avec succès" })
      }   
      catch (error) {
        setNotification({ type: "error", message: "Erreur lors de la modification d'un tarif" }) 
      } 
      finally {
    const updatedDetails = await tarifService.getDetailsTarifs(pricingGrid.tarifid)
    setDetails(updatedDetails)
  } 
          setShowForm(false)
      }
  return (
    <div className="w-full">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {pricingGrid.codetarif} {pricingGrid.libelletarif}
              </h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>Mode de location : {pricingGrid.modelocatlibelle}</span>
                <span>
                  Le montant total sera en{" "}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      pricingGrid.ttcactive === 1  ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {pricingGrid.ttcactive === 1 ? "TTC" : "HT"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Détails</h3>
            <button
              onClick={handleAddDetail}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    M
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    M
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    J
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    V
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {details.map((detail) => (
                  <tr key={detail.tarifappid}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{detail.codetarifapp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.libtarifapp}</td>
                    {Object.entries(dayLabels).map(([day]) => (
                      <td key={day} className="px-6 py-4 whitespace-nowrap text-center">
                        <div className={`w-6 h-6 rounded mx-auto ${getDayColor(detail.jourtarifapp[day as DayOfWeek])}`} />
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {detail.prixtarifapp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditDetail(detail)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(detail.tarifappid)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {details.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                      Aucun détail configuré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <TariffDetailFormModal
          initialData={editingDetail}
          existingDetails={details.filter((d) => d.tarifappid !== editingDetail?.tarifappid)}
          onSave={editingDetail == null ? handleSaveDetail : handleUpdateDetail}
          onClose={() => setShowForm(false)}
        />
      )}
      {notification && (
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            )}

            <DeleteConfirmationModal
                    isOpen={isDeleteTarifModalOpen}
                    id={TarifDelete || ""}
                    type={details.find(d => d.tarifappid === TarifDelete)?.libtarifapp || ""}
                    onClose={() => setIsDeleteTarifModalOpen(false)}
                    onConfirm={(id:any) => {
                      handleDeleteDetail(id)
                      setIsDeleteTarifModalOpen(false)
                      setTarifToDelete(null)
                    }}
                  />
    </div>
  )
}
