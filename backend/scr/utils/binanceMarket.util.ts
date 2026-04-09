/** Binance Spot public REST — không dùng CoinGecko */

const BINANCE_API = 'https://api.binance.com/api/v3';

/** Giá + %24h cho một cặp BASEUSDT (dùng khi WS chưa kịp cache). */
export async function fetchBinance24hQuoteForBase(baseSymbol: string): Promise<{
  usd: number | null;
  usd_24h_change: number | null;
} | null> {
  const base = String(baseSymbol).trim().toUpperCase();
  if (!base) return null;
  const pair = `${base}USDT`;
  try {
    const res = await fetch(`${BINANCE_API}/ticker/24hr?symbol=${pair}`);
    if (!res.ok) return null;
    const row = (await res.json()) as { lastPrice?: string; priceChangePercent?: string };
    const price = parseFloat(String(row.lastPrice ?? ''));
    const chg = parseFloat(String(row.priceChangePercent ?? ''));
    return {
      usd: Number.isFinite(price) ? price : null,
      usd_24h_change: Number.isFinite(chg) ? chg : null,
    };
  } catch {
    return null;
  }
}

export type Binance24hTickerRow = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
};

export type MarketMoverRow = {
  symbol: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
};

export async function fetchUsd24hMarketMovers(perPage: number): Promise<{
  topGainers: MarketMoverRow[];
  topLosers: MarketMoverRow[];
}> {
  const res = await fetch(`${BINANCE_API}/ticker/24hr`);
  if (!res.ok) {
    throw new Error(`Binance 24hr ticker failed: ${res.status}`);
  }
  const rows = (await res.json()) as Binance24hTickerRow[];
  const usdt = rows.filter((r) => r.symbol.endsWith('USDT'));
  const mapped: MarketMoverRow[] = usdt.map((r) => {
    const base = r.symbol.slice(0, -4);
    const price = parseFloat(r.lastPrice);
    const chg = parseFloat(r.priceChangePercent);
    return {
      symbol: base,
      current_price: Number.isFinite(price) ? price : null,
      price_change_percentage_24h: Number.isFinite(chg) ? chg : null,
    };
  });

  const withChg = mapped.filter((m) => m.price_change_percentage_24h != null);
  const sortedDesc = [...withChg].sort(
    (a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)
  );
  const sortedAsc = [...withChg].sort(
    (a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)
  );

  const take = Math.max(1, Math.min(100, perPage));
  return {
    topGainers: sortedDesc.slice(0, take),
    topLosers: sortedAsc.slice(0, take),
  };
}
