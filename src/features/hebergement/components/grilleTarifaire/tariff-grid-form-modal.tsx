import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { getTvas } from "../../services/grilleTarifaire/tvaService";
import { getRentalModes } from "../../services/grilleTarifaire/modeLocationService";
import type { Tva } from "../../types/grilleTarifaire/tva";
import type { ModeLocation } from "../../types/grilleTarifaire/modeLocation";
import type { Tarif } from "../../types/grilleTarifaire/tarif";

interface TariffGridFormModalProps {
  initialData?: Tarif;
  onSave: (data: Tarif | Omit<Tarif, "tarifid">) => void;
  onClose: () => void;
}

export function TariffGridFormModal({ initialData, onSave, onClose }: TariffGridFormModalProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    codetarif: "",
    libelletarif: "",
    tvaid: 0,
    modelocatid: 0,
    ttcactive: 1,
    codetva: "",
    modelocatlibelle: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [tvas, setTvas] = useState<Tva[]>([]);
  const [rentalModes, setRentalModes] = useState<ModeLocation[]>([]);
  
  // État pour le drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tvaData, rentalData] = await Promise.all([
          getTvas(),
          getRentalModes()
        ]);
        setTvas(tvaData);
        setRentalModes(rentalData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        codetarif: initialData.codetarif || "",
        libelletarif: initialData.libelletarif || "",
        tvaid: initialData.tvaid || 0,
        modelocatid: initialData.modelocatid || 0,
        ttcactive: initialData.ttcactive || 1,
        codetva: initialData.codetva || "",
        modelocatlibelle: initialData.modelocatlibelle || "",
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.codetarif.trim()) {
      newErrors.codetarif = "Information requise";
    }
    if (!formData.libelletarif.trim()) {
      newErrors.libelletarif = "Information requise";
    }
    if (formData.tvaid === 0) {
      newErrors.tvaid = "Information requise";
    }
    if (formData.modelocatid === 0) {
      newErrors.modelocatid = "Information requise";
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
        // Récupérer les libellés pour les IDs sélectionnés
        const selectedTva = tvas.find(t => t.tvaid === formData.tvaid);
        const selectedMode = rentalModes.find(m => m.modelocatid === formData.modelocatid);
        
        const dataToSave = {
          ...formData,
          codetva: selectedTva?.codetva || "",
          modelocatlibelle: selectedMode?.modelocatlibelle || "",
        };

        if (isEditing) {
          await onSave({ ...initialData, ...dataToSave });
        } else {
          await onSave(dataToSave);
        }
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
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
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
            {isEditing ? "Modifier la grille tarifaire" : "Nouvelle grille tarifaire"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                type="text"
                value={formData.codetarif}
                onChange={(e) => handleChange("codetarif", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.codetarif ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="Ex: TARIF001"
              />
              {errors.codetarif && (
                <p className="mt-1 text-sm text-red-600">{errors.codetarif}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formData.libelletarif}
                onChange={(e) => handleChange("libelletarif", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.libelletarif ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="Ex: Tarif standard"
              />
              {errors.libelletarif && (
                <p className="mt-1 text-sm text-red-600">{errors.libelletarif}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TVA *
              </label>
              <select
                value={formData.tvaid}
                onChange={(e) => handleChange("tvaid", Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.tvaid ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value={0}>-- Sélectionner --</option>
                {tvas.map((tva) => (
                  <option key={tva.tvaid} value={tva.tvaid}>
                    {tva.codetva}
                  </option>
                ))}
              </select>
              {errors.tvaid && (
                <p className="mt-1 text-sm text-red-600">{errors.tvaid}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode de location *
              </label>
              <select
                value={formData.modelocatid}
                onChange={(e) => handleChange("modelocatid", Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.modelocatid ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value={0}>-- Sélectionner --</option>
                {rentalModes.map((mode) => (
                  <option key={mode.modelocatid} value={mode.modelocatid}>
                    {mode.modelocatlibelle}
                  </option>
                ))}
              </select>
              {errors.modelocatid && (
                <p className="mt-1 text-sm text-red-600">{errors.modelocatid}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant *
              </label>
              <select
                value={formData.ttcactive}
                onChange={(e) => handleChange("ttcactive", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value={1}>TTC</option>
                <option value={0}>HT</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? (isEditing ? "Modification..." : "Création...") : (isEditing ? "Modifier" : "Créer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}