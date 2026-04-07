import axiosInstance from './axios';
import { Alert } from '../types';

interface CreateAlertData {
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'CHANGE_ABOVE' | 'CHANGE_BELOW';
  threshold: number;
}

type AlertKind = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'CHANGE_24H_ABOVE' | 'CHANGE_24H_BELOW';

type AlertDoc = {
  _id: string;
  userId: string;
  symbol: string;
  kind: AlertKind;
  threshold: number;
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
  created_at: string;
  updated_at: string;
};

type ApiMessage = {
  success: boolean;
  message: string;
};

const toBackendKind = (type: CreateAlertData['type']): AlertKind => {
  if (type === 'CHANGE_ABOVE') return 'CHANGE_24H_ABOVE';
  if (type === 'CHANGE_BELOW') return 'CHANGE_24H_BELOW';
  return type;
};

const toFrontendType = (kind: AlertKind): Alert['type'] => {
  if (kind === 'CHANGE_24H_ABOVE') return 'CHANGE_ABOVE';
  if (kind === 'CHANGE_24H_BELOW') return 'CHANGE_BELOW';
  return kind;
};

const mapAlert = (doc: AlertDoc): Alert => ({
  id: String(doc._id),
  userId: String(doc.userId),
  symbol: doc.symbol,
  type: toFrontendType(doc.kind),
  threshold: doc.threshold,
  isActive: doc.isActive,
  triggeredAt: doc.lastTriggeredAt,
  createdAt: doc.created_at,
  updatedAt: doc.updated_at,
});

export const alertsAPI = {
  list: async () => {
    const response = await axiosInstance.get<{ success: boolean; data: AlertDoc[] }>('/alerts');
    return response.data.data.map(mapAlert);
  },

  create: async (data: CreateAlertData) => {
    const response = await axiosInstance.post<{ success: boolean; data: AlertDoc }>('/alerts', {
      symbol: data.symbol,
      kind: toBackendKind(data.type),
      threshold: data.threshold,
    });
    return mapAlert(response.data.data);
  },

  update: async (id: string, data: Partial<CreateAlertData & { isActive: boolean }>) => {
    const body: Record<string, unknown> = {};
    if (data.symbol !== undefined) body.symbol = data.symbol;
    if (data.type !== undefined) body.kind = toBackendKind(data.type);
    if (data.threshold !== undefined) body.threshold = data.threshold;
    if (data.isActive !== undefined) body.isActive = data.isActive;

    const response = await axiosInstance.patch<{ success: boolean; data: AlertDoc }>(`/alerts/${id}`, body);
    return mapAlert(response.data.data);
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiMessage>(`/alerts/${id}`);
    return response.data;
  },
};
