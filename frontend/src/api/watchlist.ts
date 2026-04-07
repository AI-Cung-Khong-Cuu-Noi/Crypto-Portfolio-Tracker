import axiosInstance from './axios';
import { WatchlistItem } from '../types';

type ApiMessage = {
  success: boolean;
  message: string;
};

type WatchlistDoc = {
  _id: string;
  symbol: string;
  coinGeckoId?: string;
  currentPriceUsd: number | null;
  change24hPercent: number | null;
  created_at: string;
};

const mapWatchlistItem = (doc: WatchlistDoc): WatchlistItem => ({
  id: String(doc._id),
  userId: '',
  symbol: doc.symbol,
  price: doc.currentPriceUsd ?? 0,
  change24h: doc.change24hPercent ?? 0,
  addedAt: doc.created_at,
});

export const watchlistAPI = {
  list: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: WatchlistDoc[] }>('/watchlist');
    return response.data.data.map(mapWatchlistItem);
  },

  add: async (symbol: string, coinGeckoId?: string) => {
    const response = await axiosInstance.post<{ success: boolean; data: WatchlistDoc }>('/watchlist', {
      symbol,
      coinGeckoId,
    });
    return mapWatchlistItem(response.data.data);
  },

  remove: async (id: string) => {
    const response = await axiosInstance.delete<ApiMessage>(`/watchlist/${id}`);
    return response.data;
  },
};
