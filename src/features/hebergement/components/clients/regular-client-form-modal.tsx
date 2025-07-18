import type React from "react";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { RegularClient } from "../../types/client";
import LoadingSpinner from "./loading-spinner";

interface RegularClientFormModalProps {
  client?: RegularClient;
  onClose: () => void;
  onSave: (client: RegularClient | Omit<RegularClient, "idcltreg">) => Promise<void>;
}

export default function RegularClientFormModal({
  client,
  onClose,
  onSave,
}: RegularClientFormModalProps) {
  const isEditing = !!client;
  
  const [formData, setFormData] = useState({
    nomcltreg: "",
    prenomcltreg: "",
    adressecltreg: "",
    emailcltreg: "",
    telcltreg: "",
    typecomptecltreg: "",
    villecltreg: "",
    payscltreg: "",
    numcomptcltreg: "",
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
        nomcltreg: client.nomcltreg || "",
        prenomcltreg: client.prenomcltreg || "",
        adressecltreg: client.adressecltreg || "",
        emailcltreg: client.emailcltreg || "",
        telcltreg: client.telcltreg || "",
        typecomptecltreg: client.typecomptecltreg || "",
        villecltreg: client.villecltreg || "",
        payscltreg: client.payscltreg || "",
        numcomptcltreg: client.numcomptcltreg || "",
      });
    }
  }, [client]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nomcltreg.trim()) {
      newErrors.nomcltreg = "Information requise";
    }
    if (!formData.prenomcltreg.trim()) {
      newErrors.prenomcltreg = "Information requise";
    }
    if (!formData.emailcltreg.trim()) {
      newErrors.emailcltreg = "Information requise";
    }
    if (!formData.telcltreg.trim()) {
      newErrors.telcltreg = "Information requise";
    }
    if (!formData.adressecltreg.trim()) {
      newErrors.adressecltreg = "Information requise";
    }
    if (!formData.villecltreg.trim()) {
      newErrors.villecltreg = "Information requise";
    }
    if (!formData.payscltreg.trim()) {
      newErrors.payscltreg = "Information requise";
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
            {isEditing ? "Modifier le client régulier" : "Ajouter un client régulier"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nomcltreg}
                onChange={(e) => handleChange("nomcltreg", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nomcltreg ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.nomcltreg && (
                <p className="mt-1 text-sm text-red-600">{errors.nomcltreg}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.prenomcltreg}
                onChange={(e) => handleChange("prenomcltreg", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.prenomcltreg ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.prenomcltreg && (
                <p className="mt-1 text-sm text-red-600">{errors.prenomcltreg}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.emailcltreg}
                onChange={(e) => handleChange("emailcltreg", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.emailcltreg ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.emailcltreg && (
                <p className="mt-1 text-sm text-red-600">{errors.emailcltreg}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.telcltreg}
                onChange={(e) => handleChange("telcltreg", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.telcltreg ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.telcltreg && (
                <p className="mt-1 text-sm text-red-600">{errors.telcltreg}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              value={formData.adressecltreg}
              onChange={(e) => handleChange("adressecltreg", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.adressecltreg ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.adressecltreg && (
              <p className="mt-1 text-sm text-red-600">{errors.adressecltreg}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={formData.villecltreg}
                onChange={(e) => handleChange("villecltreg", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.villecltreg ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.villecltreg && (
                <p className="mt-1 text-sm text-red-600">{errors.villecltreg}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                type="text"
                value={formData.payscltreg}
                onChange={(e) => handleChange("payscltreg", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.payscltreg ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.payscltreg && (
                <p className="mt-1 text-sm text-red-600">{errors.payscltreg}</p>
              )}
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