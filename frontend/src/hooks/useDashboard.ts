import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../api/dashboard';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardAPI.getSummary,
  });
};

export const useDashboardAllocation = (portfolioId?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'allocation', portfolioId],
    queryFn: () => dashboardAPI.getAllocation(portfolioId),
  });
};

export const useDashboardPerformance = (days: number = 30, portfolioId?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'performance', days, portfolioId],
    queryFn: () => dashboardAPI.getPerformance(days, portfolioId),
  });
};

export const useDashboardTrend = () => {
  return useQuery({
    queryKey: ['dashboard', 'trend'],
    queryFn: dashboardAPI.getTrend,
    refetchInterval: 60000,
  });
};
