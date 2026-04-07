import axiosInstance from './axios';
import { ReportByCoinRow, ReportSummaryResponse, TaxRealizedLine } from '../types';

export const reportsAPI = {
  getSummary: async (params: {
    granularity?: 'day' | 'month' | 'year';
    portfolioId?: string;
    from?: string;
    to?: string;
  }) => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: ReportSummaryResponse;
    }>('/reports/summary', {
      params,
    });
    return response.data.data;
  },

  getTaxRealized: async (params: {
    portfolioId?: string;
    from?: string;
    to?: string;
  }) => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: {
        portfolioId: string | null;
        from: string;
        to: string;
        description: string;
        totalRealizedPnlUsd: number;
        lines: TaxRealizedLine[];
      };
    }>('/reports/tax-realized', {
      params,
    });
    return response.data.data;
  },

  getByCoin: async (params: {
    portfolioId?: string;
    from?: string;
    to?: string;
    includeMarket?: boolean;
  }) => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: {
        portfolioId: string | null;
        from: string | null;
        to: string | null;
        includeMarket: boolean;
        coins: ReportByCoinRow[];
      };
    }>('/reports/by-coin', {
      params: {
        ...params,
        includeMarket: params.includeMarket ? 'true' : 'false',
      },
    });
    return response.data.data;
  },
};
