import axiosInstance from './axios';
import { ReportSummary, TaxReport } from '../types';

export const reportsAPI = {
  getSummary: async (period: 'DAY' | 'MONTH' | 'YEAR', portfolioId?: string) => {
    const response = await axiosInstance.get<ReportSummary>('/reports/summary', {
      params: { period, portfolioId },
    });
    return response.data;
  },

  getTaxReport: async (startDate: string, endDate: string, portfolioId?: string) => {
    const response = await axiosInstance.get<TaxReport[]>('/reports/tax-realized', {
      params: { startDate, endDate, portfolioId },
    });
    return response.data;
  },

  getBySymbol: async (symbol: string, portfolioId?: string) => {
    const response = await axiosInstance.get<{
      symbol: string;
      totalBuyCost: number;
      totalSellPrice: number;
      realizedPnL: number;
      trades: number;
    }>('/reports/by-coin', {
      params: { symbol, portfolioId },
    });
    return response.data;
  },
};
