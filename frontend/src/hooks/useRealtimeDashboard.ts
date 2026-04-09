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
};

export function useRealtimeDashboard() {
  const token = useAuthStore((s) => s.token);
  const [realtimeSummary, setRealtimeSummary] = useState<DashboardSummary | null>(null);
  const [realtimeAllocation, setRealtimeAllocation] = useState<AllocationData[] | null>(null);

  useEffect(() => {
    if (!token) {
      setRealtimeSummary(null);
      setRealtimeAllocation(null);
      return;
    }

    const socket = io(getSocketBaseUrl(), getSocketIoOptions(token));

    const onDashboardUpdate = (payload: DashboardSocketPayload) => {
      if (payload.portfolioId != null) {
        return;
      }
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
    };

    const subscribe = () => {
      socket.emit('dashboard:subscribe', {});
    };

    socket.on('connect', subscribe);
    socket.on('dashboard:update', onDashboardUpdate);
    // connect may have fired before handlers attach (fast reconnect / Strict Mode)
    if (socket.connected) {
      subscribe();
    }

    return () => {
      socket.off('connect', subscribe);
      socket.off('dashboard:update', onDashboardUpdate);
      socket.emit('dashboard:unsubscribe');
      socket.disconnect();
    };
  }, [token]);

  return { realtimeSummary, realtimeAllocation };
}
