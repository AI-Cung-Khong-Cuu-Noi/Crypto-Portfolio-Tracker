const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

const SYMBOL_TO_ID: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  bnb: 'binancecoin',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
  dot: 'polkadot',
  matic: 'matic-network',
  pol: 'matic-network',
  avax: 'avalanche-2',
  link: 'chainlink',
  ltc: 'litecoin',
};

export type CoinGeckoUsdQuote = {
  usd?: number;
  usd_24h_change?: number;
};

let searchCache = new Map<string, string | null>();

export async function resolveCoinGeckoId(symbol: string, hintId?: string): Promise<string | null> {
  if (hintId && hintId.trim()) {
    return hintId.trim().toLowerCase();
  }

  const sym = symbol.trim().toLowerCase();
  if (!sym) return null;

  if (SYMBOL_TO_ID[sym]) {
    return SYMBOL_TO_ID[sym];
  }

  if (searchCache.has(sym)) {
    return searchCache.get(sym) ?? null;
  }

  try {
    const res = await fetch(`${COINGECKO_BASE}/search?query=${encodeURIComponent(sym)}`);
    if (!res.ok) {
      searchCache.set(sym, null);
      return null;
    }
    const data = (await res.json()) as { coins?: { id: string; symbol: string }[] };
    const match = data.coins?.find((c) => c.symbol?.toLowerCase() === sym);
    const id = match?.id?.toLowerCase() ?? null;
    searchCache.set(sym, id);
    return id;
  } catch {
    searchCache.set(sym, null);
    return null;
  }
}

export type SymbolUsdQuote = {
  usd: number | null;
  usd_24h_change: number | null;
};

export async function fetchUsdPricesForSymbols(
  entries: { symbol: string; coinGeckoId?: string }[]
): Promise<Map<string, SymbolUsdQuote>> {
  const hints = new Map<string, string | undefined>();
  for (const e of entries) {
    hints.set(String(e.symbol).toUpperCase(), e.coinGeckoId);
  }
  const symbols = [...hints.keys()];
  if (symbols.length === 0) {
    return new Map();
  }

  const resolvedIds = await Promise.all(symbols.map((s) => resolveCoinGeckoId(s, hints.get(s))));
  const ids = resolvedIds.filter((id): id is string => Boolean(id));
  const quotes = ids.length > 0 ? await fetchUsdQuotesByCoinIds(ids) : {};

  const out = new Map<string, SymbolUsdQuote>();
  symbols.forEach((sym, i) => {
    const id = resolvedIds[i];
    if (!id) {
      out.set(sym, { usd: null, usd_24h_change: null });
      return;
    }
    const q = quotes[id];
    out.set(sym, {
      usd: q?.usd ?? null,
      usd_24h_change: q?.usd_24h_change ?? null,
    });
  });
  return out;
}

export async function fetchUsdQuotesByCoinIds(
  ids: string[]
): Promise<Record<string, CoinGeckoUsdQuote>> {
  const unique = [...new Set(ids.map((id) => id.toLowerCase()).filter(Boolean))];
  if (unique.length === 0) {
    return {};
  }

  const url = `${COINGECKO_BASE}/simple/price?ids=${unique.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status}`);
  }
  return (await res.json()) as Record<string, CoinGeckoUsdQuote>;
}

export type CoinGeckoMarketRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap?: number;
  total_volume?: number;
};

export async function fetchUsdMarketsBy24hChange(
  order: 'asc' | 'desc',
  perPage: number
): Promise<CoinGeckoMarketRow[]> {
  const orderParam = order === 'desc' ? 'percent_change_24h_desc' : 'percent_change_24h_asc';
  const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=${orderParam}&per_page=${perPage}&page=1&sparkline=false`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`CoinGecko markets request failed: ${res.status}`);
  }
  return (await res.json()) as CoinGeckoMarketRow[];
}
