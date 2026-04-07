import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfoliosAPI } from '../api/portfolios';
import { toast } from 'sonner';

export const usePortfolios = () => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: portfoliosAPI.list,
  });
};

export const usePortfolioDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: () => portfoliosAPI.getById(id!),
    enabled: !!id,
  });
};

export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; baseCurrency: string }) =>
      portfoliosAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create portfolio');
    },
  });
};

export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; description?: string } }) =>
      portfoliosAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.id] });
      toast.success('Portfolio updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update portfolio');
    },
  });
};

export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portfoliosAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success('Portfolio deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete portfolio');
    },
  });
};

export const usePortfolioHoldings = (portfolioId: string | undefined) => {
  return useQuery({
    queryKey: ['holdings', portfolioId],
    queryFn: () => portfoliosAPI.getHoldings(portfolioId!),
    enabled: !!portfolioId,
  });
};
