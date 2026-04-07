import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../api/transactions';
import { toast } from 'sonner';

interface CreateTransactionData {
  portfolioId: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  quantity: number;
  price: number;
  fee?: number;
  date: string;
  notes?: string;
}

export const useTransactions = (page: number = 1, limit: number = 10, portfolioId?: string) => {
  return useQuery({
    queryKey: ['transactions', page, limit, portfolioId],
    queryFn: () => transactionsAPI.list(page, limit, portfolioId),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionData) => transactionsAPI.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['holdings', variables.portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
      toast.success('Transaction created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) =>
      transactionsAPI.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (variables.data.portfolioId) {
        queryClient.invalidateQueries({ queryKey: ['holdings', variables.data.portfolioId] });
      }
      toast.success('Transaction updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['holdings'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    },
  });
};
