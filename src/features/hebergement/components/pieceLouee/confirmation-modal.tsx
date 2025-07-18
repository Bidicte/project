import { AlertTriangle, X } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
      case 'warning':
        return {
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      default:
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    }
  }

  const colors = getColors()

  return (

    <div className="fixed inset-0 bg-gray-300 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md w-[350px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-3">
          <div className={`p-2 rounded-full ${colors.iconBg}`}>
                <AlertTriangle className={`h-5 w-5 ${colors.icon}`} />
              </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Fermer
          </button>
          <button
           onClick={() => {
                onConfirm()
                onClose()
              }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
           {confirmText}
          </button>
        </div>
      </div>
    </div>
    
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    //   <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
    //     <div className="p-6">
    //       <div className="flex items-center justify-between mb-4">
    //         <div className="flex items-center gap-3">
    //           <div className={`p-2 rounded-full ${colors.iconBg}`}>
    //             <AlertTriangle className={`h-5 w-5 ${colors.icon}`} />
    //           </div>
    //           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    //         </div>
    //         <button
    //           onClick={onClose}
    //           className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
    //         >
    //           <X className="h-5 w-5 text-gray-400" />
    //         </button>
    //       </div>
          
    //       <div className="mb-6">
    //         <p className="text-gray-600">{message}</p>
    //       </div>
          
    //       <div className="flex gap-3 justify-end">
    //         <button
    //           onClick={onClose}
    //           className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    //         >
    //           {cancelText}
    //         </button>
    //         <button
    //           onClick={() => {
    //             onConfirm()
    //             onClose()
    //           }}
    //           className={`px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.button}`}
    //         >
    //           {confirmText}
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  )
}