import type React from "react";
import { useState, useEffect, useRef } from "react";
import type { PricingDetail, DayOfWeek } from "../../types/pricing";
import { AlertCircle, X } from "lucide-react";

interface TariffDetailFormModalProps {
  initialData?: PricingDetail | null;
  existingDetails: PricingDetail[];
  onSave: (data: PricingDetail) => void;
  onClose: () => void;
}

export function TariffDetailFormModal({
  initialData,
  existingDetails,
  onSave,
  onClose,
}: TariffDetailFormModalProps) {
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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  
  // État pour le drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const dayLabels = {
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Jeu",
    friday: "Ven",
    saturday: "Sam",
    sunday: "Dim",
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        tarifid: initialData.tarifid,
        tarifappid: initialData.tarifappid,
        codetarifapp: initialData.codetarifapp,
        libtarifapp: initialData.libtarifapp,
        prixtarifapp: initialData.prixtarifapp,
        jourtarifapp: { ...initialData.jourtarifapp },
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.codetarifapp.trim()) {
      newErrors.codetarifapp = "Information requise";
    }
    if (!formData.libtarifapp.trim()) {
      newErrors.libtarifapp = "Information requise";
    }
    if (formData.prixtarifapp < 0) {
      newErrors.prixtarifapp = "Le prix doit être supérieur à 0";
    }

    // Vérifier qu'au moins un jour est sélectionné
    const hasSelectedDay = Object.values(formData.jourtarifapp).some(
      (day) => day === true
    );
    if (!hasSelectedDay) {
      newErrors.jourtarifapp = "Au moins un jour doit être sélectionné";
    }

    // Vérifier les conflits de jours
    const conflictingDays = checkDayConflicts(formData.jourtarifapp);
    if (conflictingDays.length > 0) {
      newErrors.jourtarifapp = `Un tarif a déjà été configuré pour le(s) jour(s): ${conflictingDays.join(
        ", "
      )}`;
    }

    return newErrors;
  };

  const checkDayConflicts = (selectedDays: typeof formData.jourtarifapp) => {
    const conflictingDays: string[] = [];

    Object.entries(selectedDays).forEach(([day, isSelected]) => {
      if (isSelected) {
        const hasConflict = existingDetails.some(
          (detail) => detail.jourtarifapp[day as DayOfWeek] === true
        );
        if (hasConflict) {
          conflictingDays.push(dayLabels[day as DayOfWeek]);
        }
      }
    });

    return conflictingDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ si elle existe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = {
      ...formData.jourtarifapp,
      [day]: !formData.jourtarifapp[day],
    };

    setFormData((prev) => ({
      ...prev,
      jourtarifapp: newDays,
    }));

    // Effacer l'erreur des jours si elle existe
    if (errors.jourtarifapp) {
      setErrors((prev) => ({ ...prev, jourtarifapp: "" }));
    }
  };

  const getDayColor = (day: DayOfWeek) => {
    const isSelected = formData.jourtarifapp[day];
    const hasConflict = existingDetails.some(
      (detail) => detail.jourtarifapp[day] === true
    );

    if (isSelected && hasConflict) {
      return "bg-red-400 border-2 border-red-600"; // Rouge pour conflit
    } else if (isSelected) {
      return "bg-orange-400"; // Orange pour sélectionné
    } else if (hasConflict) {
      return "bg-gray-400"; // Gris foncé pour déjà utilisé
    } else {
      return "bg-gray-200"; // Gris clair pour disponible
    }
  };

  const isDayDisabled = (day: DayOfWeek) => {
    return existingDetails.some((detail) => detail.jourtarifapp[day] === true);
  };

  // Gestion du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setModalPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto relative"
        style={{
          transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? "Modifier le détail" : "Ajouter un détail"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Code *
              </label>
              <input
                type="text"
                id="code"
                value={formData.codetarifapp}
                onChange={(e) => handleChange("codetarifapp", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.codetarifapp ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
                placeholder="Ex: T001"
              />
              {errors.codetarifapp && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.codetarifapp}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Prix *
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={formData.prixtarifapp}
                onChange={(e) =>
                  handleChange("prixtarifapp", Number(e.target.value) || 0)
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.prixtarifapp ? "border-red-500" : "border-gray-300"
                }`}
                disabled={loading}
                placeholder="0.00"
              />
              {errors.prixtarifapp && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.prixtarifapp}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <input
              type="text"
              id="description"
              value={formData.libtarifapp}
              onChange={(e) => handleChange("libtarifapp", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.libtarifapp ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
              placeholder="Ex: Tarif week-end"
            />
            {errors.libtarifapp && (
              <p className="mt-1 text-sm text-red-600">{errors.libtarifapp}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jours de la semaine *
            </label>
            <div className="flex space-x-4">
              {Object.entries(dayLabels).map(([day, label]) => {
                const dayKey = day as DayOfWeek;
                const isDisabled = isDayDisabled(dayKey);
                const isSelected = formData.jourtarifapp[dayKey];

                return (
                  <div key={day} className="text-center">
                    <div className="text-sm mb-1 text-gray-600">{label}</div>
                    <div
                      className={`w-8 h-8 rounded transition-colors ${getDayColor(
                        dayKey
                      )} ${
                        isDisabled && !isSelected
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer hover:opacity-80"
                      }`}
                      onClick={() => {
                        if (!loading && (!isDisabled || isSelected)) {
                          handleDayToggle(dayKey);
                        }
                      }}
                      title={
                        isDisabled && !isSelected
                          ? "Ce jour est déjà configuré dans un autre tarif"
                          : ""
                      }
                    />
                  </div>
                );
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

            {errors.jourtarifapp && (
              <p className="mt-1 text-sm text-red-600">{errors.jourtarifapp}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? initialData
                  ? "Modification..."
                  : "Ajout..."
                : initialData
                ? "Modifier"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
