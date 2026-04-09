import { ITransaction } from '../models/transaction.model';
import { buyCost, sellProceedsUsd, aggregatePositionsAndRealized, enrichHoldingsWithMarket } from './holdings.service';
import { binanceRealtimeService } from './binanceRealtime.service';

export type SellLedgerLine = {
  transactionId: string;
  portfolioId: string;
  date: Date;
  symbol: string;
  amountSold: number;
  proceedsUsd: number;
  costBasisUsd: number;
  realizedPnlUsd: number;
  exchange: string;
};

export type SymbolLedgerStats = {
  symbol: string;
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  realizedPnlUsd: number;
  buyCount: number;
  sellCount: number;
  transferInCount: number;
  transferOutCount: number;
};

export type OpenPositionRow = {
  symbol: string;
  coinGeckoId?: string;
  quantity: number;
  costBasisUsd: number;
  averageCostUsd: number;
};

export type LedgerAnalysis = {
  sellLedger: SellLedgerLine[];
  perSymbol: Record<string, SymbolLedgerStats>;
  openPositions: OpenPositionRow[];
};

function ensureSymbolStats(map: Map<string, SymbolLedgerStats>, symbol: string): SymbolLedgerStats {
  if (!map.has(symbol)) {
    map.set(symbol, {
      symbol,
      buyVolumeUsd: 0,
      sellVolumeUsd: 0,
      realizedPnlUsd: 0,
      buyCount: 0,
      sellCount: 0,
      transferInCount: 0,
      transferOutCount: 0,
    });
  }
  return map.get(symbol)!;
}

export function runTransactionLedgerAnalysis(transactions: ITransaction[]): LedgerAnalysis {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const pos = new Map<string, { qty: number; cost: number; coinGeckoId?: string }>();
  const stats = new Map<string, SymbolLedgerStats>();
  const sellLedger: SellLedgerLine[] = [];

  for (const tx of sorted) {
    const symbol = String(tx.symbol).toUpperCase();
    if (!pos.has(symbol)) {
      pos.set(symbol, { qty: 0, cost: 0, coinGeckoId: tx.coinGeckoId });
    }
    const p = pos.get(symbol)!;
    if (tx.coinGeckoId && !p.coinGeckoId) {
      p.coinGeckoId = tx.coinGeckoId;
    }
    const symStats = ensureSymbolStats(stats, symbol);

    if (tx.type === 'BUY') {
      const cost = buyCost(tx);
      p.qty += tx.amount;
      p.cost += cost;
      symStats.buyVolumeUsd += cost;
      symStats.buyCount += 1;
    } else if (tx.type === 'SELL') {
      if (p.qty <= 0) {
        continue;
      }
      const avg = p.cost / p.qty;
      const sellQty = Math.min(tx.amount, p.qty);
      const costRemoved = sellQty * avg;
      const proceeds = sellProceedsUsd(tx);
      const realized = proceeds - costRemoved;

      sellLedger.push({
        transactionId: String(tx._id),
        portfolioId: String(tx.portfolioId),
        date: tx.date,
        symbol,
        amountSold: sellQty,
        proceedsUsd: proceeds,
        costBasisUsd: costRemoved,
        realizedPnlUsd: realized,
        exchange: tx.exchange ?? '',
      });

      symStats.sellVolumeUsd += proceeds;
      symStats.realizedPnlUsd += realized;
      symStats.sellCount += 1;

      p.cost -= costRemoved;
      p.qty -= sellQty;
      if (p.qty < 1e-16) {
        p.qty = 0;
        p.cost = 0;
      }
    } else if (tx.type === 'TRANSFER') {
      const dir = tx.transferDirection;
      if (dir === 'IN') {
        const addCost =
          tx.totalValue != null
            ? tx.totalValue
            : tx.price != null
              ? tx.amount * tx.price + (tx.fee ?? 0)
              : 0;
        p.qty += tx.amount;
        p.cost += addCost;
        symStats.transferInCount += 1;
      } else if (dir === 'OUT') {
        if (p.qty <= 0) {
          continue;
        }
        const avg = p.cost / p.qty;
        const outQty = Math.min(tx.amount, p.qty);
        p.cost -= outQty * avg;
        p.qty -= outQty;
        if (p.qty < 1e-16) {
          p.qty = 0;
          p.cost = 0;
        }
        symStats.transferOutCount += 1;
      }
    }
  }

  const perSymbol: Record<string, SymbolLedgerStats> = {};
  for (const [k, v] of stats) {
    perSymbol[k] = v;
  }

  const openPositions: OpenPositionRow[] = [...pos.entries()]
    .filter(([, p]) => p.qty > 0)
    .map(([symbol, p]) => ({
      symbol,
      coinGeckoId: p.coinGeckoId,
      quantity: p.qty,
      costBasisUsd: p.cost,
      averageCostUsd: p.qty > 0 ? p.cost / p.qty : 0,
    }));

  return { sellLedger, perSymbol, openPositions };
}

export function periodKey(date: Date, granularity: 'day' | 'month' | 'year'): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  if (granularity === 'day') {
    return `${y}-${m}-${d}`;
  }
  if (granularity === 'month') {
    return `${y}-${m}`;
  }
  return `${y}`;
}

export type PeriodBucket = {
  period: string;
  tradeCount: number;
  buyVolumeUsd: number;
  sellVolumeUsd: number;
  realizedPnlUsd: number;
};

export function buildPeriodReport(
  allTransactions: ITransaction[],
  granularity: 'day' | 'month' | 'year',
  from: Date,
  to: Date
): PeriodBucket[] {
  const { sellLedger } = runTransactionLedgerAnalysis(allTransactions);
  const buckets = new Map<string, PeriodBucket>();

  const touch = (key: string) => {
    if (!buckets.has(key)) {
      buckets.set(key, {
        period: key,
        tradeCount: 0,
        buyVolumeUsd: 0,
        sellVolumeUsd: 0,
        realizedPnlUsd: 0,
      });
    }
    return buckets.get(key)!;
  };

  const inRange = allTransactions.filter((t) => {
    const d = new Date(t.date);
    return d >= from && d <= to;
  });

  for (const tx of inRange) {
    const key = periodKey(new Date(tx.date), granularity);
    const b = touch(key);
    b.tradeCount += 1;
    if (tx.type === 'BUY') {
      b.buyVolumeUsd += buyCost(tx);
    }
    if (tx.type === 'SELL') {
      b.sellVolumeUsd += sellProceedsUsd(tx);
    }
  }

  for (const line of sellLedger) {
    const d = new Date(line.date);
    if (d < from || d > to) {
      continue;
    }
    const key = periodKey(d, granularity);
    touch(key).realizedPnlUsd += line.realizedPnlUsd;
  }

  return [...buckets.values()].sort((a, b) => a.period.localeCompare(b.period));
}

export function filterSellLedgerByRange(
  sellLedger: SellLedgerLine[],
  from: Date,
  to: Date
): SellLedgerLine[] {
  return sellLedger.filter((line) => {
    const d = new Date(line.date);
    return d >= from && d <= to;
  });
}

export function defaultReportDateRange(): { from: Date; to: Date } {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { from, to };
}

export async function buildCoinPerformanceRows(
  transactions: ITransaction[],
  options: { from?: Date; to?: Date; includeMarket?: boolean }
) {
  const analysis = runTransactionLedgerAnalysis(transactions);
  const symbols = new Set<string>([
    ...Object.keys(analysis.perSymbol),
    ...analysis.openPositions.map((p) => p.symbol),
  ]);

  const rangeRealized = new Map<string, number>();
  if (options.from && options.to) {
    for (const line of analysis.sellLedger) {
      const d = new Date(line.date);
      if (d < options.from || d > options.to) {
        continue;
      }
      rangeRealized.set(line.symbol, (rangeRealized.get(line.symbol) ?? 0) + line.realizedPnlUsd);
    }
  }

  const positions = aggregatePositionsAndRealized(transactions).positions;
  let withMarket: ReturnType<typeof enrichHoldingsWithMarket> | null = null;
  if (options.includeMarket && positions.length > 0) {
    const quotes = await binanceRealtimeService.getQuotesForSymbols(positions.map((p) => p.symbol));
    withMarket = enrichHoldingsWithMarket(positions, quotes);
  }
  const marketBySymbol = new Map(
    (withMarket ?? []).map((h) => [
      h.symbol,
      {
        currentPriceUsd: h.currentPriceUsd,
        change24hPercent: h.change24hPercent,
        valueUsd: h.valueUsd,
        unrealizedPnlUsd: h.unrealizedPnlUsd,
        resolvedCoinGeckoId: h.resolvedCoinGeckoId,
      },
    ])
  );

  const openBySymbol = new Map(analysis.openPositions.map((p) => [p.symbol, p]));

  return [...symbols].sort().map((symbol) => {
    const stats = analysis.perSymbol[symbol] ?? {
      symbol,
      buyVolumeUsd: 0,
      sellVolumeUsd: 0,
      realizedPnlUsd: 0,
      buyCount: 0,
      sellCount: 0,
      transferInCount: 0,
      transferOutCount: 0,
    };
    const open = openBySymbol.get(symbol);
    const m = marketBySymbol.get(symbol);
    return {
      symbol,
      buyVolumeUsd: stats.buyVolumeUsd,
      sellVolumeUsd: stats.sellVolumeUsd,
      realizedPnlUsdLifetime: stats.realizedPnlUsd,
      realizedPnlUsdInRange:
        options.from && options.to ? (rangeRealized.get(symbol) ?? 0) : undefined,
      buyCount: stats.buyCount,
      sellCount: stats.sellCount,
      transferInCount: stats.transferInCount,
      transferOutCount: stats.transferOutCount,
      currentQuantity: open?.quantity ?? 0,
      costBasisUsd: open?.costBasisUsd ?? 0,
      averageCostUsd: open?.averageCostUsd ?? 0,
      ...(options.includeMarket
        ? {
            currentPriceUsd: m?.currentPriceUsd ?? null,
            change24hPercent: m?.change24hPercent ?? null,
            valueUsd: m?.valueUsd ?? null,
            unrealizedPnlUsd: m?.unrealizedPnlUsd ?? null,
            coinGeckoId: m?.resolvedCoinGeckoId ?? open?.coinGeckoId ?? null,
          }
        : {}),
    };
  });
}
