import { useEffect } from "react"
import { CheckCircle, XCircle, X } from "lucide-react"

interface NotificationProps {
  type: "success" | "error"
  message: string
  onClose: () => void
  duration?: number
}

export default function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const bgColor = type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  const textColor = type === "success" ? "text-green-800" : "text-red-800"
  const iconColor = type === "success" ? "text-green-400" : "text-red-400"
  const Icon = type === "success" ? CheckCircle : XCircle

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${bgColor} border rounded-lg p-4 shadow-lg`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button onClick={onClose} className={`ml-3 ${textColor} hover:opacity-70 transition-opacity`}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
