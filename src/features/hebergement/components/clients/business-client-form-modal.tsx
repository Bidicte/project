import type React from "react";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { BusinessClient } from "../../types/client";
import LoadingSpinner from "./loading-spinner";

interface BusinessClientFormModalProps {
  client?: BusinessClient;
  onClose: () => void;
  onSave: (client: BusinessClient | Omit<BusinessClient, "idcltbusiness">) => Promise<void>;
}

export default function BusinessClientFormModal({
  client,
  onClose,
  onSave,
}: BusinessClientFormModalProps) {
  const isEditing = !!client;
  
  const [formData, setFormData] = useState({
    raisoncltbusiness: "",
    adrcltbusiness: "",
    payscltbusiness: "",
    villecltbusiness: "",
    emailcltbusiness: "",
    telcltbusiness: "",
    numfisccltbusiness: "",
    numcomptcltbusiness: "",
    typecomptcltbusiness: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  
  // État pour le drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (client) {
      setFormData({
        raisoncltbusiness: client.raisoncltbusiness || "",
        adrcltbusiness: client.adrcltbusiness || "",
        payscltbusiness: client.payscltbusiness || "",
        villecltbusiness: client.villecltbusiness || "",
        emailcltbusiness: client.emailcltbusiness || "",
        telcltbusiness: client.telcltbusiness || "",
        numfisccltbusiness: client.numfisccltbusiness || "",
        numcomptcltbusiness: client.numcomptcltbusiness || "",
        typecomptcltbusiness: client.typecomptcltbusiness || "",
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.raisoncltbusiness.trim()) {
      newErrors.raisoncltbusiness = "Information requise";
    }
    if (!formData.telcltbusiness.trim()) {
      newErrors.telcltbusiness = "Information requise";
    }
    if (!formData.emailcltbusiness.trim()) {
      newErrors.emailcltbusiness = "Information requise";
    }
    if (!formData.adrcltbusiness.trim()) {
      newErrors.adrcltbusiness = "Information requise";
    }
    if (!formData.villecltbusiness.trim()) {
      newErrors.villecltbusiness = "Information requise";
    }
    if (!formData.payscltbusiness.trim()) {
      newErrors.payscltbusiness = "Information requise";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      setLoading(true);
      try {
        if (isEditing) {
          await onSave({ ...client, ...formData });
        } else {
          await onSave(formData);
        }
        onClose();
      } catch (error) {
        // L'erreur est gérée par le parent
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ si elle existe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        style={{
          transform: `translate(${modalPosition.x}px, ${modalPosition.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        <div 
          className="flex justify-between items-center p-6 border-b cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Modifier le client business" : "Ajouter un client business"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison sociale *
            </label>
            <input
              type="text"
              value={formData.raisoncltbusiness}
              onChange={(e) =>
                handleChange("raisoncltbusiness", e.target.value)
              }
              placeholder="Ex: CHK Hotel SARL"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.raisoncltbusiness ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.raisoncltbusiness && (
              <p className="mt-1 text-sm text-red-600">{errors.raisoncltbusiness}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.telcltbusiness}
                onChange={(e) => handleChange("telcltbusiness", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.telcltbusiness ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.telcltbusiness && (
                <p className="mt-1 text-sm text-red-600">{errors.telcltbusiness}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.emailcltbusiness}
                onChange={(e) =>
                  handleChange("emailcltbusiness", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.emailcltbusiness ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.emailcltbusiness && (
                <p className="mt-1 text-sm text-red-600">{errors.emailcltbusiness}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              value={formData.adrcltbusiness}
              onChange={(e) => handleChange("adrcltbusiness", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.adrcltbusiness ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.adrcltbusiness && (
              <p className="mt-1 text-sm text-red-600">{errors.adrcltbusiness}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={formData.villecltbusiness}
                onChange={(e) =>
                  handleChange("villecltbusiness", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.villecltbusiness ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.villecltbusiness && (
                <p className="mt-1 text-sm text-red-600">{errors.villecltbusiness}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                type="text"
                value={formData.payscltbusiness}
                onChange={(e) =>
                  handleChange("payscltbusiness", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.payscltbusiness ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.payscltbusiness && (
                <p className="mt-1 text-sm text-red-600">{errors.payscltbusiness}</p>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3 text-gray-700">
              Informations fiscales et comptables
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identification fiscale
                </label>
                <input
                  type="text"
                  value={formData.numfisccltbusiness}
                  onChange={(e) =>
                    handleChange("numfisccltbusiness", e.target.value)
                  }
                  placeholder="Ex: CI2023001234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading && <LoadingSpinner size="sm" />}
              {loading ? (isEditing ? "Sauvegarde..." : "Ajout...") : (isEditing ? "Sauvegarder" : "Ajouter")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}