import { Server as HttpServer } from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { verifyToken } from '../utils/jwt.util';
import { fetchUsdPricesForSymbols } from '../utils/coingecko.util';
import { WatchlistItem } from '../models/watchlistItem.model';

type SocketAuthedUser = {
  userId: string;
  role: string;
};

type PriceSocket = Socket & {
  user?: SocketAuthedUser;
  subscribedSymbols?: Set<string>;
};

const PRICE_PUSH_INTERVAL_MS = Number(process.env.WS_PRICE_INTERVAL_MS || 15000);
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

  const quotes = await fetchUsdPricesForSymbols(symbols.map((symbol) => ({ symbol })));
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

    const interval = setInterval(() => {
      emitPrices(socket).catch((error) => {
        socket.emit('price:error', {
          message: 'Failed to fetch prices',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      });
    }, PRICE_PUSH_INTERVAL_MS);

    socket.on('disconnect', () => {
      clearInterval(interval);
    });
  });

  return io;
}
