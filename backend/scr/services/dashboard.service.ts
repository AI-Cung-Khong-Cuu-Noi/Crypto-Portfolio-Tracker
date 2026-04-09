import { ITransaction } from '../models/transaction.model';
import { aggregatePositionsAndRealized, HoldingWithMarket } from './holdings.service';
import { binanceRealtimeService } from './binanceRealtime.service';

export async function buildSymbolPriceLookup(symbols: string[]): Promise<Map<string, number | null>> {
  if (symbols.length === 0) {
    return new Map();
  }
  const quotes = await binanceRealtimeService.getQuotesForSymbols(symbols);
  const priceBySymbol = new Map<string, number | null>();
  for (const sym of symbols) {
    priceBySymbol.set(sym, quotes.get(sym)?.usd ?? null);
  }
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
  const priceBySymbol = await buildSymbolPriceLookup(uniqueSymbols);

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
      'totalMarketValueUsd uses Binance spot prices at request time applied to historical quantities (approximation).',
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
