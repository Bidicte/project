import type React from "react"
import { useState, useEffect } from "react"
import type { Room } from "../../types/pieceLouee/room"
import { Modal } from "./modal"
import LoadingSpinner from "../clients/loading-spinner"


interface RoomFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (room: Omit<Room, "pieceid"> & { pieceid?: string }) => void
  room?: Room
  typepieceid: string
}

export function RoomForm({ isOpen, onClose, onSubmit, room, typepieceid }: RoomFormProps) {
  const [formData, setFormData] = useState({
    piececode: "",
    piecelibelle: "",
    fonctionnel: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (room) {
      setFormData({
        piececode: room.piececode,
        piecelibelle: room.piecelibelle,
        fonctionnel: room.fonctionnel,
      })
    } else {
      setFormData({
        piececode: "",
        piecelibelle: "",
        fonctionnel: true,
      })
    }
  }, [room, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        ...(room && { pieceid: room.pieceid }),
        piececode: formData.piececode,
        piecelibelle: formData.piecelibelle,
        fonctionnel: formData.fonctionnel,
        typepieceid,
      })
      onClose()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? "Modifier la pièce" : "Nouvelle pièce"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="piececode" className="block text-sm font-medium text-gray-700 mb-1">
            Code de la pièce <span className="text-red-500">*</span>
          </label>
          <input
            id="piececode"
            type="text"
            value={formData.piececode}
            onChange={(e) => setFormData({ ...formData, piececode: e.target.value })}
            placeholder="Ex: 104, A12, Suite-01"
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label htmlFor="piecelibelle" className="block text-sm font-medium text-gray-700 mb-1">
            Libellé de la pièce <span className="text-red-500">*</span>
          </label>
          <textarea
            id="piecelibelle"
            value={formData.piecelibelle}
            onChange={(e) => setFormData({ ...formData, piecelibelle: e.target.value })}
            placeholder="Ex: Chambre avec vue sur route, balcon privé..."
            required
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
          />
        </div>

        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
          <input
            id="fonctionnel"
            type="checkbox"
            checked={formData.fonctionnel}
            onChange={(e) => setFormData({ ...formData, fonctionnel: e.target.checked })}
            disabled={isSubmitting}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
          />
          <label htmlFor="fonctionnel" className="text-sm font-medium text-gray-700">
            Pièce fonctionnelle
          </label>
          <span className="text-xs text-gray-500">(Décochez si la pièce est hors service)</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">En cours...</span>
              </>
            ) : room ? (
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
