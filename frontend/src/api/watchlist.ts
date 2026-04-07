import axiosInstance from './axios';
import { WatchlistItem } from '../types';

export const watchlistAPI = {
  list: async () => {
    const response = await axiosInstance.get<WatchlistItem[]>('/watchlist');
    return response.data;
  },

  add: async (symbol: string) => {
    const response = await axiosInstance.post<WatchlistItem>('/watchlist', { symbol });
    return response.data;
  },

  remove: async (id: string) => {
    const response = await axiosInstance.delete<{ message: string }>(`/watchlist/${id}`);
    return response.data;
  },
};
