import { useState, useEffect, useMemo } from "react";
import { reservationService } from "../../services/reservationService";

interface AvailableRoom {
  pieceid: string;
  piecelibelle: string;
  piececode: string;
  typepieceid: string;
  fonctionnel: boolean;
  libellepiecetype: string;
  tarifid: string;
}

interface RoomType {
  id: string;
  nom: string;
  nombreDisponible: number;
  rooms: AvailableRoom[];
  tarifid?: string;
}

interface UseAvailableRoomsProps {
  typePieceId?: string;
  startDate?: string;
  endDate?: string;
}

interface UseAvailableRoomsReturn {
  rooms: AvailableRoom[];
  roomTypes: RoomType[];
  allRooms: AvailableRoom[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailableRooms({
  typePieceId,
  startDate,
  endDate,
}: UseAvailableRoomsProps): UseAvailableRoomsReturn {
  const [allRooms, setAllRooms] = useState<AvailableRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllAvailableRooms = async () => {
    if (!startDate || !endDate) {
      setAllRooms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await reservationService.getAllAvailableRooms(
        startDate,
        endDate
      );
      if (response && response.data) {
        setAllRooms(response.data || []);
      } else if (response && Array.isArray(response)) {
        // Si la réponse est directement un tableau
        setAllRooms(response);
      } else {
        setError("Format de réponse inattendu");
        setAllRooms([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion au serveur";
      setError(errorMessage);
      setAllRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Grouper les pièces par type
  const roomTypes = useMemo(() => {
    const grouped = allRooms.reduce((acc, room) => {
      const typeId = room.typepieceid;
      const typeName = room.libellepiecetype;

      if (!acc[typeId]) {
        acc[typeId] = {
          id: typeId,
          nom: typeName,
          nombreDisponible: 0,
          rooms: [],
          tarifid: room.tarifid,
        };
      }

      acc[typeId].rooms.push(room);
      acc[typeId].nombreDisponible = acc[typeId].rooms.length;

      return acc;
    }, {} as Record<string, RoomType>);

    return Object.values(grouped);
  }, [allRooms]);

  // Filtrer les pièces pour un type spécifique
  const rooms = useMemo(() => {
    if (!typePieceId) return [];
    return allRooms.filter((room) => room.typepieceid === typePieceId);
  }, [allRooms, typePieceId]);

  useEffect(() => {
    fetchAllAvailableRooms();
  }, [startDate, endDate]);

  return {
    rooms,
    roomTypes,
    allRooms,
    loading,
    error,
    refetch: fetchAllAvailableRooms,
  };
}
