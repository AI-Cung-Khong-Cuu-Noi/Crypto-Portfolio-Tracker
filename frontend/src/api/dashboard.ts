import axiosInstance from './axios';
import { DashboardSummary, PerformanceData, AllocationData, TrendCoin } from '../types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const dashboardAPI = {
  getSummary: async () => {
    const response = await axiosInstance.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return response.data.data;
  },

  getAllocation: async (portfolioId?: string) => {
    const response = await axiosInstance.get<
      ApiResponse<{ portfolioId: string | null; segments: AllocationData[]; totalMarketValueUsd: number }>
    >('/dashboard/allocation', {
      params: { portfolioId },
    });
    return response.data.data.segments;
  },

  getPerformance: async (days: number = 30, portfolioId?: string) => {
    const response = await axiosInstance.get<
      ApiResponse<{ portfolioId: string | null; days: number; points: PerformanceData[]; note: string }>
    >('/dashboard/performance', {
      params: { days, portfolioId },
    });
    return response.data.data.points;
  },

  getTrend: async () => {
    const response = await axiosInstance.get<
      ApiResponse<{
        topGainers: Array<{ symbol: string; current_price: number | null; price_change_percentage_24h: number | null }>;
        topLosers: Array<{ symbol: string; current_price: number | null; price_change_percentage_24h: number | null }>;
      }>
    >('/dashboard/trend');

    return {
      gainers: response.data.data.topGainers.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        currentPrice: coin.current_price,
        change24h: coin.price_change_percentage_24h,
      })) as TrendCoin[],
      losers: response.data.data.topLosers.map((coin) => ({
        symbol: coin.symbol.toUpperCase(),
        currentPrice: coin.current_price,
        change24h: coin.price_change_percentage_24h,
      })) as TrendCoin[],
    };
  },
};
