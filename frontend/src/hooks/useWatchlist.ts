import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistAPI } from '../api/watchlist';
import { toast } from 'sonner';

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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove from watchlist');
    },
  });
};
