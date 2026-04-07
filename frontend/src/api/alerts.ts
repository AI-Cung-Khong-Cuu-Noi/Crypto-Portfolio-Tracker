import axiosInstance from './axios';
import { Alert } from '../types';

interface CreateAlertData {
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'CHANGE_ABOVE' | 'CHANGE_BELOW';
  threshold: number;
}

export const alertsAPI = {
  list: async () => {
    const response = await axiosInstance.get<Alert[]>('/alerts');
    return response.data;
  },

  create: async (data: CreateAlertData) => {
    const response = await axiosInstance.post<Alert>('/alerts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAlertData & { isActive: boolean }>) => {
    const response = await axiosInstance.patch<Alert>(`/alerts/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<{ message: string }>(`/alerts/${id}`);
    return response.data;
  },
};
