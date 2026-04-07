export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  status?: 'PENDING' | 'ACTIVE' | 'BANNED';
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  baseCurrency: string;
  totalCost: number;
  totalValue: number;
  totalUnrealizedPnL: number;
  realizedPnL: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  quantity: number;
  price: number;
  fee?: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  change24h: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  addedAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  symbol: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'CHANGE_ABOVE' | 'CHANGE_BELOW';
  threshold: number;
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'TRANSACTION' | 'PORTFOLIO' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  totalPortfolioValue: number;
  totalUnrealizedPnL: number;
  totalRealizedPnL: number;
  portfolioCount: number;
  topGainers: Holding[];
  topLosers: Holding[];
}

export interface PerformanceData {
  date: string;
  marketValue: number;
  costBasis: number;
}

export interface AllocationData {
  symbol: string;
  value: number;
  percentage: number;
}

export interface TrendCoin {
  symbol: string;
  change24h: number;
  currentPrice: number;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface ReportSummary {
  period: 'DAY' | 'MONTH' | 'YEAR';
  realizedPnL: number;
  unrealizedPnL: number;
  trades: number;
  topCoin: string;
}

export interface TaxReport {
  symbol: string;
  realizedPnL: number;
  trades: number;
  date: string;
}
