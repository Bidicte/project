import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="flex items-center text-red-600 mb-4">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Erreur</span>
      </div>
      <p className="text-gray-600 text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </button>
      )}
    </div>
  )
}
