import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { AllocationData, DashboardSummary } from '../types';
import { getSocketBaseUrl } from '../utils/socketUrl';
import { getSocketIoOptions } from '../utils/socketClient';
import { useAuthStore } from '../store/authStore';

type DashboardSocketPayload = DashboardSummary & {
  ts: string;
  portfolioId: string | null;
  allocation?: AllocationData[];
  holdings?: any[];
};

type GlobalTrendPayload = {
  ts: string;
  gainers: Array<{ symbol: string; change24h: number | null }>;
  losers: Array<{ symbol: string; change24h: number | null }>;
};

type PriceUpdateRow = {
  symbol: string;
  currentPriceUsd: number | null;
  change24hPercent: number | null;
};

export function useRealtimeDashboard() {
  const token = useAuthStore((s) => s.token);
  const [realtimeSummary, setRealtimeSummary] = useState<DashboardSummary | null>(null);
  const [realtimeAllocation, setRealtimeAllocation] = useState<AllocationData[] | null>(null);
  const [realtimeTrend, setRealtimeTrend] = useState<GlobalTrendPayload | null>(null);
  const [lastHoldings, setLastHoldings] = useState<any[] | null>(null);

  useEffect(() => {
    if (!token) {
      setRealtimeSummary(null);
      setRealtimeAllocation(null);
      setRealtimeTrend(null);
      return;
    }

    const socket = io(getSocketBaseUrl(), getSocketIoOptions(token));

    const onDashboardUpdate = (payload: DashboardSocketPayload) => {
      if (payload.portfolioId != null) return;
      
      setRealtimeSummary({
        totalMarketValueUsd: payload.totalMarketValueUsd,
        totalCostBasisUsd: payload.totalCostBasisUsd,
        totalUnrealizedPnlUsd: payload.totalUnrealizedPnlUsd,
        totalRealizedPnlUsd: payload.totalRealizedPnlUsd,
        totalPnlUsd: payload.totalPnlUsd,
        portfolioCount: payload.portfolioCount,
        holdingsCount: payload.holdingsCount,
        topGainers: payload.topGainers,
        topLosers: payload.topLosers,
      });
      setRealtimeAllocation(payload.allocation ?? null);
      if (payload.holdings) {
        setLastHoldings(payload.holdings);
      }
    };

    const onPriceUpdate = (data: PriceUpdateRow[]) => {
      if (!Array.isArray(data)) return;
      
      let updatedHoldingsLocal: any[] | null = null;
      let newMarketValue = 0;
      let newUnrealizedPnl = 0;
      let changed = false;

      setRealtimeSummary((prevSummary) => {
        if (!prevSummary || !lastHoldings) return prevSummary;
        
        const prices = new Map(data.map(d => [d.symbol.toUpperCase(), d.currentPriceUsd]));
        
        const nextHoldings = lastHoldings.map(h => {
          const newPrice = prices.get(h.symbol.toUpperCase());
          if (newPrice != null && newPrice !== h.currentPriceUsd) {
            changed = true;
            const val = h.quantity * newPrice;
            const pnl = val - h.costBasisUsd;
            newMarketValue += val;
            newUnrealizedPnl += pnl;
            return { ...h, currentPriceUsd: newPrice, valueUsd: val, unrealizedPnlUsd: pnl };
          }
          newMarketValue += (h.valueUsd ?? 0);
          newUnrealizedPnl += (h.unrealizedPnlUsd ?? 0);
          return h;
        });

        if (!changed) return prevSummary;

        updatedHoldingsLocal = nextHoldings;
        setLastHoldings(nextHoldings);

        const withChange = nextHoldings.filter((h) => h.change24hPercent != null && !Number.isNaN(h.change24hPercent));
        const topGainers = [...withChange]
          .sort((a, b) => (b.change24hPercent ?? 0) - (a.change24hPercent ?? 0))
          .slice(0, 5);
        const topLosers = [...withChange]
          .sort((a, b) => (a.change24hPercent ?? 0) - (b.change24hPercent ?? 0))
          .slice(0, 5);

        return {
          ...prevSummary,
          totalMarketValueUsd: newMarketValue,
          totalUnrealizedPnlUsd: newUnrealizedPnl,
          totalPnlUsd: newUnrealizedPnl + (prevSummary.totalRealizedPnlUsd || 0),
          topGainers,
          topLosers,
        };
      });

      // Recalculate allocation if holdings changed
      if (changed && updatedHoldingsLocal) {
        const total = (updatedHoldingsLocal as any[]).reduce((sum, h) => sum + (h.valueUsd || 0), 0);
        if (total > 0) {
          const nextAlloc = (updatedHoldingsLocal as any[]).map(h => ({
            symbol: h.symbol,
            valueUsd: h.valueUsd || 0,
            percent: ((h.valueUsd || 0) / total) * 100,
          })).filter(a => a.valueUsd > 0);
          setRealtimeAllocation(nextAlloc);
        }
      }
    };

    const onMarketTrend = (payload: GlobalTrendPayload) => {
      setRealtimeTrend(payload);
    };

    const subscribe = () => {
      socket.emit('dashboard:subscribe', {});
    };

    socket.on('connect', subscribe);
    socket.on('dashboard:update', onDashboardUpdate);
    socket.on('price:update', onPriceUpdate);
    socket.on('market:trend', onMarketTrend);
    if (socket.connected) {
      subscribe();
    }

    return () => {
      socket.off('connect', subscribe);
      socket.off('dashboard:update', onDashboardUpdate);
      socket.off('price:update', onPriceUpdate);
      socket.off('market:trend', onMarketTrend);
      socket.emit('dashboard:unsubscribe');
      socket.disconnect();
    };
  }, [token, lastHoldings]);

  return { realtimeSummary, realtimeAllocation, realtimeTrend };
}
