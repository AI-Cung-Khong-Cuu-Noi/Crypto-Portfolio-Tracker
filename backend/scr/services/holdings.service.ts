import { ITransaction } from '../models/transaction.model';

export type MarketQuote = {
  usd: number | null;
  usd_24h_change: number | null;
};

export type AggregatedPosition = {
  symbol: string;
  coinGeckoId?: string;
  quantity: number;
  costBasisUsd: number;
  averageCostUsd: number;
};

export function buyCost(tx: ITransaction): number {
  const fee = tx.fee ?? 0;
  if (tx.totalValue != null && !Number.isNaN(tx.totalValue)) {
    return tx.totalValue;
  }
  const price = tx.price ?? 0;
  return tx.amount * price + fee;
}

export function sellProceedsUsd(tx: ITransaction): number {
  const fee = tx.fee ?? 0;
  if (tx.totalValue != null && !Number.isNaN(tx.totalValue)) {
    return tx.totalValue;
  }
  const price = tx.price ?? 0;
  return tx.amount * price - fee;
}

export function aggregatePositionsAndRealized(transactions: ITransaction[]): {
  positions: AggregatedPosition[];
  totalRealizedPnlUsd: number;
} {
  let totalRealizedPnlUsd = 0;
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const map = new Map<
    string,
    { qty: number; cost: number; coinGeckoId?: string }
  >();

  for (const tx of sorted) {
    const symbol = String(tx.symbol).toUpperCase();
    if (!map.has(symbol)) {
      map.set(symbol, { qty: 0, cost: 0, coinGeckoId: tx.coinGeckoId });
    }
    const pos = map.get(symbol)!;
    if (tx.coinGeckoId && !pos.coinGeckoId) {
      pos.coinGeckoId = tx.coinGeckoId;
    }

    if (tx.type === 'BUY') {
      pos.qty += tx.amount;
      pos.cost += buyCost(tx);
    } else if (tx.type === 'SELL') {
      if (pos.qty <= 0) continue;
      const avg = pos.cost / pos.qty;
      const sellQty = Math.min(tx.amount, pos.qty);
      const costRemoved = sellQty * avg;
      const proceeds = sellProceedsUsd(tx);
      totalRealizedPnlUsd += proceeds - costRemoved;
      pos.cost -= costRemoved;
      pos.qty -= sellQty;
      if (pos.qty < 1e-16) {
        pos.qty = 0;
        pos.cost = 0;
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
        pos.qty += tx.amount;
        pos.cost += addCost;
      } else if (dir === 'OUT') {
        if (pos.qty <= 0) continue;
        const avg = pos.cost / pos.qty;
        const outQty = Math.min(tx.amount, pos.qty);
        pos.cost -= outQty * avg;
        pos.qty -= outQty;
        if (pos.qty < 1e-16) {
          pos.qty = 0;
          pos.cost = 0;
        }
      }
    }
  }

  const positions = [...map.entries()]
    .filter(([, p]) => p.qty > 0)
    .map(([symbol, p]) => ({
      symbol,
      coinGeckoId: p.coinGeckoId,
      quantity: p.qty,
      costBasisUsd: p.cost,
      averageCostUsd: p.qty > 0 ? p.cost / p.qty : 0,
    }));

  return { positions, totalRealizedPnlUsd };
}

export function aggregateHoldingsFromTransactions(transactions: ITransaction[]): AggregatedPosition[] {
  return aggregatePositionsAndRealized(transactions).positions;
}

export type HoldingWithMarket = AggregatedPosition & {
  currentPriceUsd: number | null;
  change24hPercent: number | null;
  valueUsd: number | null;
  unrealizedPnlUsd: number | null;
  /** Giữ tên field cũ; giá lấy từ Binance, không còn map CoinGecko */
  resolvedCoinGeckoId: string | null;
};

export function enrichHoldingsWithMarket(
  positions: AggregatedPosition[],
  priceBySymbolOverride: Map<string, MarketQuote> = new Map()
): HoldingWithMarket[] {
  return positions.map((position) => {
    const symbol = String(position.symbol).toUpperCase();
    const quote = priceBySymbolOverride.get(symbol) ?? { usd: null, usd_24h_change: null };
    const price = quote.usd ?? null;
    const change24h = quote.usd_24h_change ?? null;
    const valueUsd = price != null ? position.quantity * price : null;
    const unrealizedPnlUsd = valueUsd != null ? valueUsd - position.costBasisUsd : null;

    return {
      ...position,
      currentPriceUsd: price,
      change24hPercent: change24h,
      valueUsd,
      unrealizedPnlUsd,
      resolvedCoinGeckoId: null,
    };
  });
}
