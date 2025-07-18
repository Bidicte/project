import { useEffect, useState, useCallback } from "react"
import { TariffGridList } from "../components/grilleTarifaire/tariff-grid-list"
import { TariffGridDetails } from "../components/grilleTarifaire/tariff-grid-details"
import { TariffGridFormModal } from "../components/grilleTarifaire/tariff-grid-form-modal"
import Notification from "../components/clients/notification"
import type { ViewMode, PricingDetail } from "../types/pricing"
import type { Tarif } from "../types/grilleTarifaire/tarif"
import {
  tarifService
} from "../services/grilleTarifaire/tarifService"
import { DeleteConfirmationModal } from "../components/grilleTarifaire/delete-pricing"

export default function GrilleTarifaire() {
  const [currentView, setCurrentView] = useState<ViewMode>("list")
  const [pricingGrids, setPricingGrids] = useState<Tarif[]>([])
  const [selectedGrid, setSelectedGrid] = useState<Tarif | null>(null)
  const [editingGrid, setEditingGrid] = useState<Tarif | null>(null)
  const [pricingDetailsGrids, setPricingDetailsGrids] = useState<PricingDetail[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteGrilleModalOpen, setIsDeleteGrilleModalOpen] = useState(false)
  const [GrilleDelete, setGrilleToDelete] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Chargement initial
  useEffect(() => {
    fetchGrids()
  }, [])

  const fetchGrids = async () => {
    try {
      const data = await tarifService.getTariffs()
      setPricingGrids(data)
    } catch {
      setNotification({ type: "error", message: "Erreur de chargement des grilles tarifaires" })
    }
  }

  const handleAddGrid = () => {
    setEditingGrid(null)
    setIsFormOpen(true)
  }

  const handleEditGrid = (grid: Tarif) => {
    setEditingGrid(grid)
    setIsFormOpen(true)
  }

  const openDeleteModal = (id:string) => {
    setGrilleToDelete(id)
    setIsDeleteGrilleModalOpen(true)
  }
  const handleDeleteGrid = async (id: string) => {
    try {
      await tarifService.deleteTariff(id)
      fetchGrids()
      setNotification({ type: "success", message: "Grille supprimée avec succès" })
      setCurrentView("list")
    } catch(error:any) {
      setNotification({ type: "error", message: "Erreur lors de la suppression" })
    }
  }

  const handleViewDetails = async (grid: Tarif) => {
    setSelectedGrid(grid)
    setCurrentView("details")
    try {
      const details = await tarifService.getDetailsTarifs(grid.tarifid)
      setPricingDetailsGrids(details)
    } catch {
      setNotification({ type: "error", message: "Erreur de chargement des détails de grille" })
    }
  }

  const handleSaveGrid = async (gridData: Tarif | Omit<Tarif, "tarifid">) => {
    try {
      if ('tarifid' in gridData) {
        // Mode édition
        const updated = await tarifService.updateTariff(gridData)
        setPricingGrids(prev =>
          prev.map(g => (g.tarifid === updated.tarifid ? updated : g))
        )
        setNotification({ type: "success", message: "Grille mise à jour avec succès" })
      } else {
        // Mode ajout
        const created = await tarifService.createTariff(gridData as Tarif)
        setPricingGrids(prev => [...prev, created])
        setNotification({ type: "success", message: "Grille créée avec succès" })
      }
      setIsFormOpen(false)
      setEditingGrid(null)
      setCurrentView("list")
    } catch(error:any) {
      setNotification({ type: "error", message: error.message || "Erreur lors de la sauvegarde" })
    }
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedGrid(null)
    setEditingGrid(null)
    setIsFormOpen(false)
  }

  return (
    <div className="mx-auto min-h-screen">
      {currentView === "list" && (
        <TariffGridList
          pricingGrids={pricingGrids}
          onAdd={handleAddGrid}
          onEdit={handleEditGrid}
          onDelete={openDeleteModal}
          onViewDetails={handleViewDetails}
        />
      )}

      {currentView === "details" && selectedGrid && (
        <TariffGridDetails
          pricingGrid={selectedGrid}
          pricingGridDetails={pricingDetailsGrids}
          onBack={handleBackToList}
          onEdit={() => handleEditGrid(selectedGrid)}
        />
      )}

      {isFormOpen && (
        <TariffGridFormModal
          initialData={editingGrid ?? undefined}
          onSave={handleSaveGrid}
          onClose={handleBackToList}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteGrilleModalOpen}
        id={GrilleDelete || ""}
        type="tarif"
        onClose={() => setIsDeleteGrilleModalOpen(false)}
        onConfirm={(id:any) => {
          handleDeleteGrid(id)
          setIsDeleteGrilleModalOpen(false)
          setGrilleToDelete(null)
        }}
      />
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}
