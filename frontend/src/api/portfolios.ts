import axiosInstance from './axios';
import { Portfolio, Holding } from '../types';

type ApiMessage = { success: boolean; message: string };

type PortfolioDoc = {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

type HoldingDoc = {
  symbol: string;
  quantity: number;
  costBasisUsd: number;
  averageCostUsd: number;
  currentPriceUsd: number | null;
  change24hPercent: number | null;
  valueUsd: number | null;
  unrealizedPnlUsd: number | null;
};

const mapPortfolio = (doc: PortfolioDoc): Portfolio => ({
  id: String(doc._id),
  userId: String(doc.userId),
  name: doc.name,
  description: doc.description ?? '',
  createdAt: doc.created_at ? new Date(doc.created_at).toISOString() : '',
  updatedAt: doc.updated_at ? new Date(doc.updated_at).toISOString() : '',
});

const mapHolding = (portfolioId: string, h: HoldingDoc): Holding => {
  const cost = h.costBasisUsd ?? 0;
  const unrealized = h.unrealizedPnlUsd ?? 0;
  return {
    id: `${portfolioId}-${h.symbol}`,
    portfolioId,
    symbol: h.symbol,
    quantity: h.quantity,
    avgCost: h.averageCostUsd ?? 0,
    currentPrice: h.currentPriceUsd ?? 0,
    totalValue: h.valueUsd ?? 0,
    unrealizedPnL: unrealized,
    unrealizedPnLPercent: cost > 0 ? unrealized / cost : 0,
    change24h: h.change24hPercent ?? 0,
  };
};

export type PortfolioHoldingsResult = {
  holdings: Holding[];
  summary: {
    totalCostBasisUsd: number;
    totalMarketValueUsd: number;
    totalUnrealizedPnlUsd: number;
  };
};

export const portfoliosAPI = {
  list: async (): Promise<Portfolio[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: PortfolioDoc[] }>('/portfolios');
    return response.data.data.map(mapPortfolio);
  },

  create: async (data: { name: string; description?: string }): Promise<Portfolio> => {
    const response = await axiosInstance.post<{ success: boolean; data: PortfolioDoc }>('/portfolios', data);
    return mapPortfolio(response.data.data);
  },

  getById: async (id: string): Promise<Portfolio> => {
    const response = await axiosInstance.get<{ success: boolean; data: PortfolioDoc }>(`/portfolios/${id}`);
    return mapPortfolio(response.data.data);
  },

  update: async (id: string, data: { name?: string; description?: string }): Promise<Portfolio> => {
    const response = await axiosInstance.put<{ success: boolean; data: PortfolioDoc }>(`/portfolios/${id}`, data);
    return mapPortfolio(response.data.data);
  },

  delete: async (id: string): Promise<ApiMessage> => {
    const response = await axiosInstance.delete<ApiMessage>(`/portfolios/${id}`);
    return response.data;
  },

  getHoldings: async (id: string): Promise<PortfolioHoldingsResult> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: {
        portfolioId: string;
        holdings: HoldingDoc[];
        summary: {
          totalCostBasisUsd: number;
          totalMarketValueUsd: number;
          totalUnrealizedPnlUsd: number;
        };
      };
    }>(`/portfolios/${id}/holdings`);

    const { portfolioId, holdings, summary } = response.data.data;
    const pid = String(portfolioId);
    return {
      holdings: holdings.map((h) => mapHolding(pid, h)),
      summary,
    };
  },
};
