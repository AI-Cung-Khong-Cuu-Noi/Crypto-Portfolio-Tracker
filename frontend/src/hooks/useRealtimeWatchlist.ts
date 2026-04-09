import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getSocketBaseUrl } from '../utils/socketUrl';
import { getSocketIoOptions } from '../utils/socketClient';
import { useAuthStore } from '../store/authStore';

export type WatchlistQuote = {
  currentPriceUsd: number | null;
  change24hPercent: number | null;
};

type PriceQuoteRow = {
  symbol: string;
  currentPriceUsd: number | null;
  change24hPercent: number | null;
  ts: string;
};

/**
 * Live quotes for watchlist symbols via Socket.IO (`price:watchlist` + `price:update`).
 */
export function useRealtimeWatchlistQuotes(symbols: string[]) {
  const token = useAuthStore((s) => s.token);
  const [quotesBySymbol, setQuotesBySymbol] = useState<Record<string, WatchlistQuote>>({});

  const symbolsKey = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))]
    .sort()
    .join(',');

  useEffect(() => {
    if (!token || !symbolsKey) {
      setQuotesBySymbol({});
      return;
    }

    const socket = io(getSocketBaseUrl(), getSocketIoOptions(token));

    const onPriceUpdate = (data: PriceQuoteRow[]) => {
      if (!Array.isArray(data)) return;
      setQuotesBySymbol((prev) => {
        const next = { ...prev };
        for (const row of data) {
          const sym = String(row.symbol).trim().toUpperCase();
          next[sym] = {
            currentPriceUsd: row.currentPriceUsd,
            change24hPercent: row.change24hPercent,
          };
        }
        return next;
      });
    };

    const subscribe = () => {
      socket.emit('price:watchlist');
    };

    socket.on('connect', subscribe);
    socket.on('price:update', onPriceUpdate);
    if (socket.connected) {
      subscribe();
    }

    return () => {
      socket.off('connect', subscribe);
      socket.off('price:update', onPriceUpdate);
      socket.disconnect();
    };
  }, [token, symbolsKey]);

  return quotesBySymbol;
}
