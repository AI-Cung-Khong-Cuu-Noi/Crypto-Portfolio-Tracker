import axiosInstance from './axios';
import { DashboardSummary, PerformanceData, AllocationData, TrendCoin } from '../types';

export const dashboardAPI = {
  getSummary: async () => {
    const response = await axiosInstance.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  getAllocation: async (portfolioId?: string) => {
    const response = await axiosInstance.get<AllocationData[]>('/dashboard/allocation', {
      params: { portfolioId },
    });
    return response.data;
  },

  getPerformance: async (days: number = 30, portfolioId?: string) => {
    const response = await axiosInstance.get<PerformanceData[]>('/dashboard/performance', {
      params: { days, portfolioId },
    });
    return response.data;
  },

  getTrend: async () => {
    const response = await axiosInstance.get<{
      gainers: TrendCoin[];
      losers: TrendCoin[];
    }>('/dashboard/trend');
    return response.data;
  },
};
