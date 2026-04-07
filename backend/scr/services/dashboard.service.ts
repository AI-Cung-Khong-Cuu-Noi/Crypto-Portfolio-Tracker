import { ITransaction } from '../models/transaction.model';
import { fetchUsdQuotesByCoinIds, resolveCoinGeckoId } from '../utils/coingecko.util';
import { aggregatePositionsAndRealized, HoldingWithMarket } from './holdings.service';

export async function buildSymbolPriceLookup(
  symbols: string[],
  transactions: ITransaction[]
): Promise<Map<string, number | null>> {
  const hintBySymbol = new Map<string, string | undefined>();
  for (const tx of transactions) {
    const sym = String(tx.symbol).toUpperCase();
    if (tx.coinGeckoId) {
      hintBySymbol.set(sym, tx.coinGeckoId);
    }
  }

  const resolvedIds = await Promise.all(
    symbols.map((sym) => resolveCoinGeckoId(sym, hintBySymbol.get(sym)))
  );

  const ids = resolvedIds.filter((id): id is string => Boolean(id));
  const quotes = ids.length > 0 ? await fetchUsdQuotesByCoinIds(ids) : {};

  const priceBySymbol = new Map<string, number | null>();
  symbols.forEach((sym, i) => {
    const id = resolvedIds[i];
    priceBySymbol.set(sym, id ? quotes[id]?.usd ?? null : null);
  });

  return priceBySymbol;
}

export async function computePerformanceSeries(
  transactions: ITransaction[],
  days: number
): Promise<{
  points: Array<{ date: string; totalMarketValueUsd: number; totalCostBasisUsd: number }>;
  note: string;
}> {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const uniqueSymbols = [...new Set(sorted.map((t) => String(t.symbol).toUpperCase()))];
  const priceBySymbol = await buildSymbolPriceLookup(uniqueSymbols, sorted);

  const points: Array<{ date: string; totalMarketValueUsd: number; totalCostBasisUsd: number }> =
    [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i, 23, 59, 59, 999)
    );
    const txsUpTo = sorted.filter((t) => t.date <= end);
    const { positions } = aggregatePositionsAndRealized(txsUpTo);

    let totalMarketValueUsd = 0;
    let totalCostBasisUsd = 0;
    for (const p of positions) {
      totalCostBasisUsd += p.costBasisUsd;
      const px = priceBySymbol.get(p.symbol);
      if (px != null) {
        totalMarketValueUsd += p.quantity * px;
      }
    }

    points.push({
      date: end.toISOString().slice(0, 10),
      totalMarketValueUsd,
      totalCostBasisUsd,
    });
  }

  return {
    points,
    note:
      'totalMarketValueUsd uses spot prices at request time applied to historical quantities (approximation).',
  };
}

export function splitTopGainersLosers(holdings: HoldingWithMarket[], take: number) {
  const withChange = holdings.filter((h) => h.change24hPercent != null && !Number.isNaN(h.change24hPercent));
  const sortedDesc = [...withChange].sort(
    (a, b) => (b.change24hPercent ?? 0) - (a.change24hPercent ?? 0)
  );
  const sortedAsc = [...withChange].sort(
    (a, b) => (a.change24hPercent ?? 0) - (b.change24hPercent ?? 0)
  );
  return {
    topGainers: sortedDesc.slice(0, take),
    topLosers: sortedAsc.slice(0, take),
  };
}

export function buildAllocationSegments(holdings: HoldingWithMarket[]) {
  const valued = holdings
    .map((h) => ({
      symbol: h.symbol,
      valueUsd: h.valueUsd ?? 0,
      percent: 0,
    }))
    .filter((s) => s.valueUsd > 0);

  const total = valued.reduce((sum, s) => sum + s.valueUsd, 0);
  if (total <= 0) {
    return valued.map((s) => ({ ...s, percent: 0 }));
  }

  return valued.map((s) => ({
    ...s,
    percent: (s.valueUsd / total) * 100,
  }));
}
