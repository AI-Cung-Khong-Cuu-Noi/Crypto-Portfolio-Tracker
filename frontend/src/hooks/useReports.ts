import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '../api/reports';

type PeriodUI = 'DAY' | 'MONTH' | 'YEAR';

const toGranularity = (period: PeriodUI): 'day' | 'month' | 'year' => {
  if (period === 'DAY') return 'day';
  if (period === 'YEAR') return 'year';
  return 'month';
};

export const useReportsSummary = (period: PeriodUI, portfolioId?: string) => {
  return useQuery({
    queryKey: ['reports', 'summary', period, portfolioId],
    queryFn: () =>
      reportsAPI.getSummary({
        granularity: toGranularity(period),
        portfolioId,
      }),
  });
};

export const useReportsTaxRealized = (portfolioId?: string) => {
  return useQuery({
    queryKey: ['reports', 'tax-realized', portfolioId],
    queryFn: () =>
      reportsAPI.getTaxRealized({
        portfolioId,
      }),
  });
};

export const useReportsByCoin = (portfolioId?: string) => {
  return useQuery({
    queryKey: ['reports', 'by-coin', portfolioId],
    queryFn: () =>
      reportsAPI.getByCoin({
        portfolioId,
        includeMarket: true,
      }),
  });
};
