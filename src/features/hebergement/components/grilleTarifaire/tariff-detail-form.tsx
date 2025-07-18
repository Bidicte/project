import type React from "react"

import { useState, useEffect } from "react"
import type { PricingDetail, DayOfWeek } from "../../types/pricing"
import { AlertCircle, X } from "lucide-react"


interface PricingDetailFormProps {
  initialData?: PricingDetail | null
  existingDetails: PricingDetail[]
  onSave: (data: PricingDetail) => void
  onCancel: () => void
}

export function TariffDetailForm({ initialData, existingDetails, onSave, onCancel }: PricingDetailFormProps) {
  const [formData, setFormData] = useState({
    tarifappid: initialData ? initialData.tarifappid : "",
    codetarifapp: "",
    tarifid: initialData ? initialData.tarifid : "",
    libtarifapp: "",
    prixtarifapp: 0,
    jourtarifapp: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  })

  const [validationError, setValidationError] = useState<string>("")

  const dayLabels = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Jeu",
    friday: "Ven",
    saturday: "Sam",
    sunday: "Dim",
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        tarifid: initialData.tarifid,
        tarifappid: initialData.tarifappid,
        codetarifapp: initialData.codetarifapp,
        libtarifapp: initialData.libtarifapp,
        prixtarifapp: initialData.prixtarifapp,
        jourtarifapp: { ...initialData.jourtarifapp },
      })
    }
  }, [initialData])

  // Fonction pour vérifier les conflits de jours
  const checkDayConflicts = (selectedDays: typeof formData.jourtarifapp) => {
    const conflictingDays: string[] = []

    Object.entries(selectedDays).forEach(([day, isSelected]) => {
      if (isSelected) {
        const hasConflict = existingDetails.some((detail) => detail.jourtarifapp[day as DayOfWeek] === true)
        if (hasConflict) {
          conflictingDays.push(dayLabels[day as DayOfWeek])
        }
      }
    })

    return conflictingDays
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Vérifier les conflits de jours
    const conflictingDays = checkDayConflicts(formData.jourtarifapp)

    if (conflictingDays.length > 0) {
      setValidationError("Un tarif a déja été configuré pour le(s) jour(s) selectionné(s)")
      return
    }

    // Vérifier qu'au moins un jour est sélectionné
    const hasSelectedDay = Object.values(formData.jourtarifapp).some((day) => day === true)
    if (!hasSelectedDay) {
      setValidationError("Veuillez sélectionner au moins un jour")
      return
    }

    setValidationError("")
    onSave(formData)
  }

  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = {
      ...formData.jourtarifapp,
      [day]: !formData.jourtarifapp[day],
    }

    setFormData((prev) => ({
      ...prev,
      jourtarifapp: newDays,
    }))

    // Vérifier les conflits en temps réel
    const conflictingDays = checkDayConflicts(newDays)
    if (conflictingDays.length > 0) {
      setValidationError("Un tarif a déja été configuré pour le(s) jour(s) selectionné(s)")
    } else {
      setValidationError("")
    }
  }

  const getDayColor = (day: DayOfWeek) => {
    const isSelected = formData.jourtarifapp[day]
    const hasConflict = existingDetails.some((detail) => detail.jourtarifapp[day] === true)

    if (isSelected && hasConflict) {
      return "bg-red-400 border-2 border-red-600" // Rouge pour conflit
    } else if (isSelected) {
      return "bg-orange-400" // Orange pour sélectionné
    } else if (hasConflict) {
      return "bg-gray-400" // Gris foncé pour déjà utilisé
    } else {
      return "bg-gray-200" // Gris clair pour disponible
    }
  }

  const isDayDisabled = (day: DayOfWeek) => {
    return existingDetails.some((detail) => detail.jourtarifapp[day] === true)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Modifier le détail" : "Ajouter un détail"}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <input
                type="text"
                id="code"
                value={formData.codetarifapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, codetarifapp: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix
              </label>
              <input
                type="number"
                id="price"
                value={formData.prixtarifapp}
                onChange={(e) => setFormData((prev) => ({ ...prev, prixtarifapp: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={formData.libtarifapp}
              onChange={(e) => setFormData((prev) => ({ ...prev, libtarifapp: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jours de la semaine</label>
            <div className="flex space-x-4">
              {Object.entries(dayLabels).map(([day, label]) => {
                const dayKey = day as DayOfWeek
                const isDisabled = isDayDisabled(dayKey)
                const isSelected = formData.jourtarifapp[dayKey]

                return (
                  <div key={day} className="text-center">
                    <div className="text-sm mb-1 text-gray-600">{label}</div>
                    <div
                      className={`w-8 h-8 rounded transition-colors ${getDayColor(dayKey)} ${
                        isDisabled && !isSelected ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-80"
                      }`}
                      onClick={() => {
                        if (!isDisabled || isSelected) {
                          handleDayToggle(dayKey)
                        }
                      }}
                      title={isDisabled && !isSelected ? "Ce jour est déjà configuré dans un autre tarif" : ""}
                    />
                  </div>
                )
              })}
            </div>

            {/* Légende */}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Sélectionné</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span>Déjà configuré</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Conflit</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Disponible</span>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {validationError && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{validationError}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!!validationError}
            >
              {initialData ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
