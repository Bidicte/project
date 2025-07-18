import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react"

interface NotificationProps {
  type: "success" | "error" | "warning"
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Notification({ type, message, isVisible, onClose, duration = 5000 }: NotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible && !isAnimating) return null

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  }

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
  }

  const Icon = icons[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className={`p-4 rounded-lg border shadow-lg ${colors[type]}`}>
        <div className="flex items-start">
          <Icon className={`h-5 w-5 mt-0.5 mr-3 ${iconColors[type]}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button onClick={onClose} className="ml-3 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
