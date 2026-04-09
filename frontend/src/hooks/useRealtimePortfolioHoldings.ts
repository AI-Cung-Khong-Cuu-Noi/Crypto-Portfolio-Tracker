import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import type { Holding } from '../types';
import type { PortfolioHoldingsResult } from '../api/portfolios';
import { getSocketBaseUrl } from '../utils/socketUrl';
import { getSocketIoOptions } from '../utils/socketClient';
import { useAuthStore } from '../store/authStore';

type RealtimeHoldingPayload = {
  symbol: string;
  quantity: number;
  costBasisUsd: number;
  averageCostUsd: number;
  currentPriceUsd: number | null;
  change24hPercent: number | null;
  valueUsd: number | null;
  unrealizedPnlUsd: number | null;
};

type PortfolioSocketPayload = {
  portfolioId: string | null;
  holdings?: RealtimeHoldingPayload[];
  holdingsSummary?: PortfolioHoldingsResult['summary'];
};

function mapPayloadToHoldingsResult(portfolioId: string, payload: PortfolioSocketPayload): PortfolioHoldingsResult {
  const rows = payload.holdings ?? [];
  const holdings: Holding[] = rows.map((h) => {
    const cost = h.costBasisUsd ?? 0;
    const unrealized = h.unrealizedPnlUsd ?? null;
    return {
      id: `${portfolioId}-${h.symbol}`,
      portfolioId,
      symbol: h.symbol,
      quantity: h.quantity,
      avgCost: h.averageCostUsd ?? 0,
      currentPrice: h.currentPriceUsd ?? null,
      totalValue: h.valueUsd ?? null,
      unrealizedPnL: unrealized,
      unrealizedPnLPercent: cost > 0 && unrealized != null ? unrealized / cost : 0,
      change24h: h.change24hPercent ?? null,
    };
  });
  return {
    holdings,
    summary: payload.holdingsSummary!,
  };
}

export function useRealtimePortfolioHoldings(portfolioId: string | undefined) {
  const token = useAuthStore((s) => s.token);
  const [realtimeHoldingsData, setRealtimeHoldingsData] = useState<PortfolioHoldingsResult | null>(null);

  useEffect(() => {
    if (!portfolioId || !token) {
      setRealtimeHoldingsData(null);
      return;
    }

    const socket = io(getSocketBaseUrl(), getSocketIoOptions(token));

    const normId = (v: unknown) => (v == null ? '' : String(v).trim());

    const onDashboardUpdate = (payload: PortfolioSocketPayload) => {
      if (payload.portfolioId == null || normId(payload.portfolioId) !== normId(portfolioId)) {
        return;
      }
      if (!payload.holdings || !payload.holdingsSummary) return;
      setRealtimeHoldingsData(mapPayloadToHoldingsResult(portfolioId, payload));
    };

    const subscribe = () => {
      socket.emit('dashboard:subscribe', { portfolioId });
    };

    socket.on('connect', subscribe);
    socket.on('dashboard:update', onDashboardUpdate);
    if (socket.connected) {
      subscribe();
    }

    return () => {
      socket.off('connect', subscribe);
      socket.off('dashboard:update', onDashboardUpdate);
      socket.emit('dashboard:unsubscribe');
      socket.disconnect();
    };
  }, [portfolioId, token]);

  return realtimeHoldingsData;
}
