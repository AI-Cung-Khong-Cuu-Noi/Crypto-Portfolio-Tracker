import WebSocket from 'ws';
import type { MarketQuote } from './holdings.service';
import { fetchBinance24hQuoteForBase } from '../utils/binanceMarket.util';

const BINANCE_WS_URL = process.env.BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws';
const RECONNECT_DELAY_MS = Number(process.env.BINANCE_WS_RECONNECT_MS || 3000);

type BinanceTicker = {
  stream?: string;
  data?: {
    s?: string;
    c?: string;
    P?: string;
  };
  result?: unknown;
  id?: number;
};

class BinanceRealtimeService {
  private ws: WebSocket | null = null;

  private connected = false;

  private nextId = 1;

  private readonly subscribedStreams = new Set<string>();

  private readonly priceBySymbol = new Map<string, MarketQuote>();

  /** Optional listeners (e.g. Socket.IO layer) to push updates shortly after a ticker arrives. */
  private readonly priceCacheListeners = new Set<() => void>();

  start(): void {
    if (this.ws) return;
    this.connect();
  }

  /** Subscribe to cache updates (throttled by caller). Returns unsubscribe. */
  onPriceCacheUpdated(listener: () => void): () => void {
    this.priceCacheListeners.add(listener);
    return () => this.priceCacheListeners.delete(listener);
  }

  private notifyPriceCacheUpdated(): void {
    for (const fn of this.priceCacheListeners) {
      try {
        fn();
      } catch {
        // ignore
      }
    }
  }

  private connect(): void {
    this.ws = new WebSocket(BINANCE_WS_URL);

    this.ws.on('open', () => {
      this.connected = true;
      if (this.subscribedStreams.size > 0) {
        this.send({
          method: 'SUBSCRIBE',
          params: [...this.subscribedStreams],
          id: this.nextId++,
        });
      }
      console.log(`[binance-ws] connected (${this.subscribedStreams.size} streams)`);
    });

    this.ws.on('message', (raw) => {
      try {
        const parsed = JSON.parse(raw.toString()) as BinanceTicker;
        const payload = parsed.data;
        if (!payload?.s) return;
        const symbol = this.toBaseSymbol(payload.s);
        if (!symbol) return;
        const price = Number(payload.c);
        const change = Number(payload.P);
        this.priceBySymbol.set(symbol, {
          usd: Number.isFinite(price) ? price : null,
          usd_24h_change: Number.isFinite(change) ? change : null,
        });
        this.notifyPriceCacheUpdated();
      } catch {
        // Ignore malformed messages and keep stream alive.
      }
    });

    this.ws.on('close', () => {
      this.connected = false;
      this.ws = null;
      console.warn('[binance-ws] disconnected, reconnecting...');
      setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
    });

    this.ws.on('error', (error) => {
      console.error('[binance-ws] error:', error instanceof Error ? error.message : error);
    });
  }

  private send(payload: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }

  private toStream(symbol: string): string {
    return `${symbol.toLowerCase()}usdt@ticker`;
  }

  private toBaseSymbol(pair: string): string | null {
    const upper = String(pair).toUpperCase();
    if (!upper.endsWith('USDT')) return null;
    return upper.slice(0, -4);
  }

  ensureSubscribed(symbols: string[]): void {
    const streamsToAdd: string[] = [];
    for (const raw of symbols) {
      const symbol = String(raw).trim().toUpperCase();
      if (!symbol) continue;
      const stream = this.toStream(symbol);
      if (this.subscribedStreams.has(stream)) continue;
      this.subscribedStreams.add(stream);
      streamsToAdd.push(stream);
    }
    if (streamsToAdd.length > 0 && this.connected) {
      this.send({ method: 'SUBSCRIBE', params: streamsToAdd, id: this.nextId++ });
    }
  }

  getCachedQuote(symbol: string): MarketQuote | null {
    return this.priceBySymbol.get(String(symbol).trim().toUpperCase()) ?? null;
  }

  async getQuotesForSymbols(symbols: string[]): Promise<Map<string, MarketQuote>> {
    const normalized = [...new Set(symbols.map((s) => String(s).trim().toUpperCase()).filter(Boolean))];
    this.ensureSubscribed(normalized);

    const out = new Map<string, MarketQuote>();
    for (const symbol of normalized) {
      const cached = this.getCachedQuote(symbol);
      out.set(symbol, cached ?? { usd: null, usd_24h_change: null });
    }

    const missingUsd = normalized.filter((s) => out.get(s)?.usd == null);
    if (missingUsd.length > 0) {
      await Promise.all(
        missingUsd.map(async (sym) => {
          const rest = await fetchBinance24hQuoteForBase(sym);
          if (rest?.usd != null) {
            this.priceBySymbol.set(sym, rest);
            out.set(sym, rest);
          }
        })
      );
    }

    return out;
  }
}

export const binanceRealtimeService = new BinanceRealtimeService();
