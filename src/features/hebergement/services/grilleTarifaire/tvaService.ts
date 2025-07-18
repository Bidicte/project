import type { Tva } from '../../types/grilleTarifaire/tva';
import api from './axiosInstance';

export const getTvas = async (): Promise<Tva[]> => {
  const res = await api.get('/tva/all');
  return res.data;
};
