import { useState } from "react"
import type {RoomState } from "../../types/pieceLouee/room"
import { apiService } from "../../services/pieceLouee/apiPieceLouee"


export const useRoomStates = () => {
  const [roomStates, setRoomStates] = useState<RoomState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomStates = async (pieceid: string) => {
    console.log('🔍 [DEBUG] Récupération des états pour pieceid:', pieceid);
    
    if (!pieceid || pieceid.trim() === '') {
      const errorMsg = 'ID de pièce manquant ou vide';
      console.error('❌ [ERROR]', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 [DEBUG] Appel API en cours...');
      const response = await apiService.getRoomStates(pieceid);
      
      console.log('📡 [DEBUG] Réponse API complète:', response);
      
      if (response.success && response.data) {
        if (!Array.isArray(response.data)) {
          console.warn('⚠️ [WARNING] La réponse n\'est pas un tableau:', response.data);
          setError('Format de données incorrect');
          setRoomStates([]);
          return;
        }

        console.log('📡 [DEBUG] Nombre d\'états reçus:', response.data.length);
        
        // Convertir les dates string en objets Date
        const statesWithDates = response.data.map((state: any) => ({
          etatpieceid: state.etatpieceid,
          etatpiece: state.etatpiece,
          dateetat: new Date(state.dateetat),
          motifetat: state.motifetat || '',
          pieceid: state.pieceid
        } as RoomState));
        
        console.log('✅ [SUCCESS] États traités:', statesWithDates);
        setRoomStates(statesWithDates);
        
      } else {
        const errorMsg = response.message || 'Aucune donnée trouvée';
        console.warn('⚠️ [WARNING]', errorMsg);
        setError(errorMsg);
        setRoomStates([]);
      }
    } catch (err) {
      console.error('❌ [ERROR] Erreur complète:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('404')) {
          // 🎯 Gestion spéciale pour 404 : pas d'états pour cette pièce
          console.log('ℹ️ [INFO] Pièce sans états, affichage du message approprié');
          setError(null); // Pas d'erreur, juste pas d'états
          setRoomStates([]); // Tableau vide
        } else if (err.message.includes('401')) {
          setError('Non autorisé. Vérifiez votre connexion.');
        } else if (err.message.includes('403')) {
          setError('Accès refusé. Permissions insuffisantes.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Erreur inconnue');
      }
      
      // Si c'est une 404, on met quand même un tableau vide
      if (err instanceof Error && err.message.includes('404')) {
        setRoomStates([]);
      }
    } finally {
      setLoading(false);
      console.log('🏁 [DEBUG] Fin du fetchRoomStates');
    }
  };

  const clearStates = () => {
    console.log('🧹 [DEBUG] Nettoyage des états');
    setRoomStates([]);
    setError(null);
  };

  return {
    roomStates,
    loading,
    error,
    fetchRoomStates,
    clearStates
  };
};