import { Response, NextFunction } from 'express';
import { Portfolio } from '../models/portfolio.model';
import { ITransaction, Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  buildPeriodReport,
  defaultReportDateRange,
  filterSellLedgerByRange,
  runTransactionLedgerAnalysis,
  buildCoinPerformanceRows,
} from '../services/reports.service';

async function loadTransactionsForScope(
  userId: string | undefined,
  portfolioId?: string
): Promise<{ transactions: ITransaction[]; portfolioMissing: boolean }> {
  if (portfolioId) {
    const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
    if (!portfolio) {
      return { transactions: [], portfolioMissing: true };
    }
    const transactions = await Transaction.find({ userId, portfolioId }).sort({ date: 1 });
    return { transactions: transactions as ITransaction[], portfolioMissing: false };
  }

  const transactions = await Transaction.find({ userId }).sort({ date: 1 });
  return { transactions: transactions as ITransaction[], portfolioMissing: false };
}

function resolveDateRange(from?: Date, to?: Date): { from: Date; to: Date } {
  if (!from && !to) {
    return defaultReportDateRange();
  }
  const now = new Date();
  const start = from ?? new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
  const end = to ?? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  if (start > end) {
    return { from: end, to: start };
  }
  return { from: start, to: end };
}

export const getReportsSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const granularity = (req.query.granularity as 'day' | 'month' | 'year') || 'month';
    const { from: fromRaw, to: toRaw } = req.query as { from?: string; to?: string };
    const fromDate = fromRaw ? new Date(fromRaw) : undefined;
    const toDate = toRaw ? new Date(toRaw) : undefined;
    const { from, to } = resolveDateRange(fromDate, toDate);

    const { transactions, portfolioMissing } = await loadTransactionsForScope(
      req.user?.userId,
      portfolioId
    );
    if (portfolioMissing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const buckets = buildPeriodReport(transactions, granularity, from, to);
    const totals = buckets.reduce(
      (acc, b) => {
        acc.tradeCount += b.tradeCount;
        acc.buyVolumeUsd += b.buyVolumeUsd;
        acc.sellVolumeUsd += b.sellVolumeUsd;
        acc.realizedPnlUsd += b.realizedPnlUsd;
        return acc;
      },
      { tradeCount: 0, buyVolumeUsd: 0, sellVolumeUsd: 0, realizedPnlUsd: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolioId ?? null,
        granularity,
        from: from.toISOString(),
        to: to.toISOString(),
        buckets,
        totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsTaxRealized = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const { from: fromRaw, to: toRaw } = req.query as { from?: string; to?: string };
    const fromDate = fromRaw ? new Date(fromRaw) : undefined;
    const toDate = toRaw ? new Date(toRaw) : undefined;
    const { from, to } = resolveDateRange(fromDate, toDate);

    const { transactions, portfolioMissing } = await loadTransactionsForScope(
      req.user?.userId,
      portfolioId
    );
    if (portfolioMissing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const { sellLedger } = runTransactionLedgerAnalysis(transactions);
    const lines = filterSellLedgerByRange(sellLedger, from, to);
    const totalRealizedPnlUsd = lines.reduce((s, l) => s + l.realizedPnlUsd, 0);

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolioId ?? null,
        from: from.toISOString(),
        to: to.toISOString(),
        description:
          'Realized P&L theo từng lệnh SELL (FIFO cost trung bình). Dùng cho báo cáo thuế — vui lòng xác minh với kế toán.',
        totalRealizedPnlUsd,
        lines,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReportsByCoin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const includeMarket = req.query.includeMarket === 'true';
    const { from: fromRaw, to: toRaw } = req.query as { from?: string; to?: string };
    const fromDate = fromRaw ? new Date(fromRaw) : undefined;
    const toDate = toRaw ? new Date(toRaw) : undefined;
    const range =
      fromDate || toDate ? resolveDateRange(fromDate, toDate) : { from: undefined, to: undefined };

    const { transactions, portfolioMissing } = await loadTransactionsForScope(
      req.user?.userId,
      portfolioId
    );
    if (portfolioMissing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const rows = await buildCoinPerformanceRows(transactions, {
      from: range.from,
      to: range.to,
      includeMarket,
    });

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolioId ?? null,
        from: range.from?.toISOString() ?? null,
        to: range.to?.toISOString() ?? null,
        includeMarket,
        coins: rows,
      },
    });
  } catch (error) {
    next(error);
  }
};
