import axiosInstance from './axios';
import { Portfolio, Holding, PerformanceData, AllocationData } from '../types';

export const portfoliosAPI = {
  list: async () => {
    const response = await axiosInstance.get<Portfolio[]>('/portfolios');
    return response.data;
  },

  create: async (data: { name: string; description?: string; baseCurrency: string }) => {
    const response = await axiosInstance.post<Portfolio>('/portfolios', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Portfolio>(`/portfolios/${id}`);
    return response.data;
  },

  update: async (id: string, data: { name: string; description?: string }) => {
    const response = await axiosInstance.put<Portfolio>(`/portfolios/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<{ message: string }>(`/portfolios/${id}`);
    return response.data;
  },

  getHoldings: async (id: string) => {
    const response = await axiosInstance.get<Holding[]>(`/portfolios/${id}/holdings`);
    return response.data;
  },
};
