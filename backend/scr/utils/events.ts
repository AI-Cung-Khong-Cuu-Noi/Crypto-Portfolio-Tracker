import { EventEmitter } from 'events';

export const events = new EventEmitter();

export const TRANSACTION_EVENTS = {
  CHANGED: 'TRANSACTION_CHANGED',
};

export type TransactionChangedPayload = {
  userId: string;
  portfolioId?: string;
};
