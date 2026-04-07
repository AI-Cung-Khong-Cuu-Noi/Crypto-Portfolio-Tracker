import axiosInstance from './axios';
import { Transaction } from '../types';

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

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const transactionsAPI = {
  create: async (data: CreateTransactionData) => {
    const response = await axiosInstance.post<Transaction>('/transactions', data);
    return response.data;
  },

  list: async (page: number = 1, limit: number = 10, portfolioId?: string) => {
    const response = await axiosInstance.get<PaginatedResponse<Transaction>>('/transactions', {
      params: { page, limit, portfolioId },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTransactionData>) => {
    const response = await axiosInstance.put<Transaction>(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<{ message: string }>(`/transactions/${id}`);
    return response.data;
  },
};
