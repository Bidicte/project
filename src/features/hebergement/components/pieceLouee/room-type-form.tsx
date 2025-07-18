import type React from "react"
import { useState, useEffect } from "react"
import type { RoomType } from "../../types/pieceLouee/room"
import { Modal } from "./modal"
import { useTarifs } from "../../hooks/pieceLouee/useTarifs"
import LoadingSpinner from "../clients/loading-spinner"



interface RoomTypeFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (roomType: Omit<RoomType, "typepieceid"> & { typepieceid?: string }) => void
  roomType?: RoomType
}

export function RoomTypeForm({ isOpen, onClose, onSubmit, roomType }: RoomTypeFormProps) {
  const [formData, setFormData] = useState({
    libellepiece: "",
    tarifid: "",
  typepieceid: roomType ? roomType.typepieceid : "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { tarifs, loading: tarifsLoading, error: tarifsError } = useTarifs()

  useEffect(() => {
    if (roomType) {
      setFormData({
        typepieceid: roomType.typepieceid,
        libellepiece: roomType.libellepiece,
        tarifid: roomType.tarifid,
      })
    } else {
      setFormData({
        libellepiece: "",
        tarifid: "",
        typepieceid: "",
      })
    }
  }, [roomType, isOpen])

  // const selectedTarif = tarifs.find((t) => t.tarifid === formData.tarifid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const selectedTarifData = tarifs.find((t) => t.tarifid === formData.tarifid)
      if (!selectedTarifData) {
        throw new Error("Tarif sélectionné non trouvé")
      }

      await onSubmit({
        ...(roomType && { typepieceid: roomType.typepieceid }),
        libellepiece: formData.libellepiece,
        tarifid: formData.tarifid,
      })
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roomType ? "Modifier le type de pièce" : "Ajouter un type de pièce"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Libellé de la pièce */}
        <div>
          <label htmlFor="libellepiece" className="block text-sm font-medium text-gray-700 mb-2">
            Libellé du type de pièce <span className="text-red-500">*</span>
          </label>
          <input
            id="libellepiece"
            type="text"
            value={formData.libellepiece}
            onChange={(e) => setFormData({ ...formData, libellepiece: e.target.value })}
            placeholder="Ex: Chambre Standard Route"
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        {/* Tarif */}
        <div>
          <label htmlFor="tarifid" className="block text-sm font-medium text-gray-700 mb-2">
            Tarif <span className="text-red-500">*</span>
          </label>

          {tarifsLoading ? (
            <div className="flex items-center justify-center py-3 border border-gray-300 rounded-md bg-gray-50">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-500">Chargement des tarifs...</span>
            </div>
          ) : tarifsError ? (
            <div className="p-3 border border-red-300 rounded-md bg-red-50 text-red-700 text-sm">
              Erreur lors du chargement des tarifs
            </div>
          ) : (
            <>
              <select
                id="tarifid"
                value={formData.tarifid}
                onChange={(e) => setFormData({ ...formData, tarifid: e.target.value })}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Sélectionnez un tarif</option>
                {tarifs.map((tarif) => (
                  <option key={tarif.tarifid} value={tarif.tarifid}>
                    {tarif.libelletarif}
                  </option>
                ))}
              </select>

              {/* Affichage du tarif sélectionné */}
              {/* {selectedTarif && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="font-medium text-blue-900">{selectedTarif.libelletarif}</div>
                      <div className="text-sm text-blue-700">Code: {selectedTarif.codetarif}</div>
                      <div className="text-sm text-blue-700">Catégorie: {selectedTarif.modelocatlibelle}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{selectedTarif.ttcactive}€</div>
                      <div className="text-sm text-blue-700">TVA: {selectedTarif.tvaid}%</div>
                      <div className="text-sm text-blue-700">Code TVA: {selectedTarif.codetva}</div>
                    </div>
                  </div>
                </div>
              )} */}
            </>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || tarifsLoading || !formData.libellepiece || !formData.tarifid}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">En cours...</span>
              </>
            ) : roomType ? (
              "Modifier"
            ) : (
              "Ajouter"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
