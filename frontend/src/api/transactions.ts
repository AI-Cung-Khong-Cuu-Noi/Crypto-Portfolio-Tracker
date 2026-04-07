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

type TxDoc = {
  _id: string;
  portfolioId: string;
  userId?: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  amount: number;
  price?: number;
  fee?: number;
  totalValue?: number;
  date: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
};

const mapTransaction = (tx: TxDoc): Transaction => ({
  id: String(tx._id),
  portfolioId: String(tx.portfolioId),
  symbol: tx.symbol,
  type: tx.type,
  quantity: tx.amount,
  price: tx.price ?? 0,
  fee: tx.fee,
  totalValue: tx.totalValue,
  date: new Date(tx.date).toISOString(),
  notes: tx.note ?? '',
  createdAt: tx.created_at ? new Date(tx.created_at).toISOString() : '',
  updatedAt: tx.updated_at ? new Date(tx.updated_at).toISOString() : '',
});

export interface TransactionsListResult {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const transactionsAPI = {
  create: async (data: CreateTransactionData) => {
    const body: Record<string, unknown> = {
      portfolioId: data.portfolioId,
      type: data.type,
      symbol: data.symbol,
      amount: data.quantity,
      price: data.price,
      fee: data.fee ?? 0,
      date: data.date,
      note: data.notes ?? '',
    };
    if (data.type === 'TRANSFER') {
      body.transferDirection = 'IN';
    }
    const response = await axiosInstance.post<{ success: boolean; data: TxDoc }>('/transactions', body);
    return mapTransaction(response.data.data);
  },

  list: async (page: number = 1, limit: number = 10, portfolioId?: string): Promise<TransactionsListResult> => {
    const response = await axiosInstance.get<{
      success: boolean;
      data: TxDoc[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>('/transactions', {
      params: { page, limit, portfolioId },
    });
    return {
      data: response.data.data.map(mapTransaction),
      meta: response.data.meta,
    };
  },

  update: async (id: string, data: Partial<CreateTransactionData>) => {
    const body: Record<string, unknown> = {};
    if (data.symbol !== undefined) body.symbol = data.symbol;
    if (data.type !== undefined) body.type = data.type;
    if (data.quantity !== undefined) body.amount = data.quantity;
    if (data.price !== undefined) body.price = data.price;
    if (data.fee !== undefined) body.fee = data.fee;
    if (data.date !== undefined) body.date = data.date;
    if (data.notes !== undefined) body.note = data.notes;
    const response = await axiosInstance.put<{ success: boolean; data: TxDoc }>(`/transactions/${id}`, body);
    return mapTransaction(response.data.data);
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(`/transactions/${id}`);
    return response.data;
  },
};
