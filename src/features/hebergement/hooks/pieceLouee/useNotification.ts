import { useState, useCallback } from "react"

interface NotificationState {
  type: "success" | "error" | "warning"
  message: string
  isVisible: boolean
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    type: "success",
    message: "",
    isVisible: false,
  })

  const showNotification = useCallback((type: "success" | "error" | "warning", message: string) => {
    setNotification({
      type,
      message,
      isVisible: true,
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }))
  }, [])

  const showSuccess = useCallback((message: string) => showNotification("success", message), [showNotification])
  const showError = useCallback((message: string) => showNotification("error", message), [showNotification])
  const showWarning = useCallback((message: string) => showNotification("warning", message), [showNotification])

  return {
    notification,
    showSuccess,
    showError,
    showWarning,
    hideNotification,
  }
}
