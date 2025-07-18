import { useEffect, useState } from "react";
import type { TypePiece } from "../../types/pieceLouee/room";
import { typePieceService } from "../../services/pieceLouee/typePieceService";

export function useTypePieces() {
  const [typePieces, setTypePieces] = useState<TypePiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypePieces = async () => {
    try {
      setLoading(true);
      const result = await typePieceService.getAll();
      setTypePieces(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypePieces();
  }, []);

  return {
    typePieces,
    loading,
    error,
    refetch: fetchTypePieces,
  };
}
