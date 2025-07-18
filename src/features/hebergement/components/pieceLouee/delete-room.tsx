import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  id: string
  type: string
  onClose: () => void
  onConfirm: (id:string) => void
}

export function DeleteConfirmationModal({
  isOpen,
  id,
  type,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (

    <div className="fixed inset-0 bg-gray-300 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-[350px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-3">
          <div className="bg-red-100 rounded-full p-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Suppression</h2>
        <p className="text-sm text-gray-600 mb-6">
          Voulez-vous supprimer ce client {type} ?<br />Retenez que toute action de suppression est irréversible.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
          <button
            onClick={() => onConfirm(id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
