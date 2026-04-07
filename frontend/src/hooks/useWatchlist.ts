import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistAPI } from '../api/watchlist';
import { toast } from 'sonner';
import type { WatchlistItem } from '../types';

export const useWatchlist = () => {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlistAPI.list,
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) => watchlistAPI.add(symbol),
    onSuccess: (newItem) => {
      queryClient.setQueryData<WatchlistItem[]>(['watchlist'], (old) => {
        const prev = old ?? [];
        const exists = prev.some((item) => item.id === newItem.id || item.symbol === newItem.symbol);
        if (exists) return prev;
        return [newItem, ...prev];
      });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Added to watchlist');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add to watchlist');
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => watchlistAPI.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<WatchlistItem[]>(['watchlist'], (old) => {
        const prev = old ?? [];
        return prev.filter((item) => item.id !== id);
      });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove from watchlist');
    },
  });
};
