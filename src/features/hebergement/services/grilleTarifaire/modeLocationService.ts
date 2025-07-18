import type { ModeLocation } from '../../types/grilleTarifaire/modeLocation';
import api from './axiosInstance';

export const getRentalModes = async (): Promise<ModeLocation[]> => {
  const res = await api.get('/modelocation/all');
  return res.data;
};
