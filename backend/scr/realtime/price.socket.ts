import { Server as HttpServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../utils/jwt.util';
import { WatchlistItem } from '../models/watchlistItem.model';
import { binanceRealtimeService } from '../services/binanceRealtime.service';
import { Transaction } from '../models/transaction.model';
import { Portfolio } from '../models/portfolio.model';
import { aggregatePositionsAndRealized, enrichHoldingsWithMarket } from '../services/holdings.service';
import { buildAllocationSegments, splitTopGainersLosers } from '../services/dashboard.service';

type SocketAuthedUser = {
  userId: string;
  role: string;
};

type PriceSocket = Socket & {
  user?: SocketAuthedUser;
  subscribedSymbols?: Set<string>;
  dashboardScope?: { portfolioId?: string | null };
};

/** How often to push quotes + dashboard snapshots to each socket (ms). Lower = snappier UI. */
const PRICE_PUSH_INTERVAL_MS = Number(process.env.WS_PRICE_INTERVAL_MS || 5000);
const MAX_SYMBOLS_PER_SOCKET = 100;

function normalizeSymbols(symbols: unknown): string[] {
  if (!Array.isArray(symbols)) return [];
  const normalized = symbols
    .map((s) => String(s).trim().toUpperCase())
    .filter((s) => s.length > 0)
    .slice(0, MAX_SYMBOLS_PER_SOCKET);
  return [...new Set(normalized)];
}

async function emitPrices(socket: PriceSocket): Promise<void> {
  const symbols = [...(socket.subscribedSymbols ?? new Set<string>())];
  if (symbols.length === 0) {
    return;
  }

  const quotes = await binanceRealtimeService.getQuotesForSymbols(symbols);
  const data = symbols.map((symbol) => {
    const quote = quotes.get(symbol) ?? { usd: null, usd_24h_change: null };
    return {
      symbol,
      currentPriceUsd: quote.usd,
      change24hPercent: quote.usd_24h_change,
      ts: new Date().toISOString(),
    };
  });

  socket.emit('price:update', data);
}

async function emitDashboard(socket: PriceSocket): Promise<void> {
  const userId = socket.user?.userId;
  if (!userId) return;

  const portfolioId = socket.dashboardScope?.portfolioId;
  const txFilter = portfolioId ? { userId, portfolioId } : { userId };
  const transactions = await Transaction.find(txFilter).sort({ date: 1 });
  const { positions, totalRealizedPnlUsd } = aggregatePositionsAndRealized(transactions);
  const realtimeQuotes = await binanceRealtimeService.getQuotesForSymbols(
    positions.map((position) => position.symbol)
  );
  const holdings = enrichHoldingsWithMarket(positions, realtimeQuotes);
  const totalCostBasisUsd = holdings.reduce((sum, h) => sum + h.costBasisUsd, 0);
  const totalMarketValueUsd = holdings.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0);
  const totalUnrealizedPnlUsd = holdings.reduce((sum, h) => sum + (h.unrealizedPnlUsd ?? 0), 0);
  const totalPnlUsd = totalUnrealizedPnlUsd + totalRealizedPnlUsd;
  const portfolioCount = await Portfolio.countDocuments({ userId });
  const { topGainers, topLosers } = splitTopGainersLosers(holdings, 5);
  const allocation = buildAllocationSegments(holdings);

  socket.emit('dashboard:update', {
    ts: new Date().toISOString(),
    portfolioId: portfolioId != null ? String(portfolioId) : null,
    totalMarketValueUsd,
    totalCostBasisUsd,
    totalUnrealizedPnlUsd,
    totalRealizedPnlUsd,
    totalPnlUsd,
    portfolioCount,
    holdingsCount: holdings.length,
    topGainers,
    topLosers,
    allocation,
    holdings: holdings.map((h) => ({
      symbol: h.symbol,
      quantity: h.quantity,
      costBasisUsd: h.costBasisUsd,
      averageCostUsd: h.averageCostUsd,
      currentPriceUsd: h.currentPriceUsd,
      change24hPercent: h.change24hPercent,
      valueUsd: h.valueUsd,
      unrealizedPnlUsd: h.unrealizedPnlUsd,
    })),
    holdingsSummary: {
      totalCostBasisUsd,
      totalMarketValueUsd,
      totalUnrealizedPnlUsd,
    },
  });
}

async function syncWatchlistSymbols(socket: PriceSocket): Promise<void> {
  const userId = socket.user?.userId;
  if (!userId) return;

  const watchlist = await WatchlistItem.find({ userId }).select('symbol').lean();
  socket.subscribedSymbols = new Set(
    watchlist.map((item) => String(item.symbol).trim().toUpperCase()).slice(0, MAX_SYMBOLS_PER_SOCKET)
  );
}

function extractToken(socket: Socket): string | null {
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === 'string' && authToken.trim()) {
    return authToken.trim();
  }

  const header = socket.handshake.headers.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return null;
}

export function setupPriceSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  /** Push watchlist / subscribed-symbol prices soon after Binance updates (dashboard stays on interval to limit DB load). */
  let binancePushTimer: ReturnType<typeof setTimeout> | null = null;
  const schedulePricePushAfterBinanceTick = () => {
    if (binancePushTimer) return;
    binancePushTimer = setTimeout(() => {
      binancePushTimer = null;
      for (const [, raw] of io.sockets.sockets) {
        const s = raw as PriceSocket;
        emitPrices(s).catch((error) => {
          s.emit('price:error', {
            message: 'Failed to fetch prices',
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      }
    }, 300);
  };
  binanceRealtimeService.onPriceCacheUpdated(schedulePricePushAfterBinanceTick);

  io.use((socket: PriceSocket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error('Unauthorized: missing token'));
      }
      const payload = verifyToken(token);
      socket.user = { userId: payload.userId, role: payload.role };
      socket.subscribedSymbols = new Set<string>();
      return next();
    } catch {
      return next(new Error('Unauthorized: invalid token'));
    }
  });

  io.on('connection', async (socket: PriceSocket) => {
    socket.emit('price:connected', {
      socketId: socket.id,
      intervalMs: PRICE_PUSH_INTERVAL_MS,
      message: 'Connected to realtime price stream',
    });

    socket.on('price:subscribe', async (payload: { symbols?: string[] }) => {
      const symbols = normalizeSymbols(payload?.symbols);
      const subscribed = socket.subscribedSymbols ?? new Set<string>();
      symbols.forEach((s) => subscribed.add(s));
      socket.subscribedSymbols = new Set([...subscribed].slice(0, MAX_SYMBOLS_PER_SOCKET));
      await emitPrices(socket);
      socket.emit('price:subscribed', { symbols: [...socket.subscribedSymbols] });
    });

    socket.on('price:unsubscribe', (payload: { symbols?: string[] }) => {
      const symbols = normalizeSymbols(payload?.symbols);
      const subscribed = socket.subscribedSymbols ?? new Set<string>();
      symbols.forEach((s) => subscribed.delete(s));
      socket.subscribedSymbols = subscribed;
      socket.emit('price:subscribed', { symbols: [...socket.subscribedSymbols] });
    });

    socket.on('price:watchlist', async () => {
      await syncWatchlistSymbols(socket);
      await emitPrices(socket);
      socket.emit('price:subscribed', { symbols: [...(socket.subscribedSymbols ?? [])] });
    });

    socket.on('dashboard:subscribe', async (payload: { portfolioId?: string | null }) => {
      socket.dashboardScope = { portfolioId: payload?.portfolioId ?? null };
      await emitDashboard(socket);
    });

    socket.on('dashboard:unsubscribe', () => {
      socket.dashboardScope = undefined;
    });

    const interval = setInterval(() => {
      emitPrices(socket).catch((error) => {
        socket.emit('price:error', {
          message: 'Failed to fetch prices',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      });
      if (socket.dashboardScope) {
        emitDashboard(socket).catch((error) => {
          socket.emit('dashboard:error', {
            message: 'Failed to compute dashboard',
            details: error instanceof Error ? error.message : 'Unknown error',
          });
        });
      }
    }, PRICE_PUSH_INTERVAL_MS);

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });

  return io;
}
