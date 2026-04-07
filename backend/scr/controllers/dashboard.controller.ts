import { Response, NextFunction } from 'express';
import { Portfolio } from '../models/portfolio.model';
import { ITransaction, Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  aggregatePositionsAndRealized,
  enrichHoldingsWithMarket,
} from '../services/holdings.service';
import {
  buildAllocationSegments,
  computePerformanceSeries,
  splitTopGainersLosers,
} from '../services/dashboard.service';
import { fetchUsdMarketsBy24hChange } from '../utils/coingecko.util';

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

export const getDashboardSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const { transactions, portfolioMissing } = await loadTransactionsForScope(
      req.user?.userId,
      portfolioId
    );

    if (portfolioMissing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const { positions, totalRealizedPnlUsd } = aggregatePositionsAndRealized(transactions);
    const holdings = await enrichHoldingsWithMarket(positions);

    const totalCostBasisUsd = holdings.reduce((sum, h) => sum + h.costBasisUsd, 0);
    const totalMarketValueUsd = holdings.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0);
    const totalUnrealizedPnlUsd = holdings.reduce((sum, h) => sum + (h.unrealizedPnlUsd ?? 0), 0);
    const totalPnlUsd = totalUnrealizedPnlUsd + totalRealizedPnlUsd;

    const portfolioCount = await Portfolio.countDocuments({ userId: req.user?.userId });
    const { topGainers, topLosers } = splitTopGainersLosers(holdings, 5);

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolioId ?? null,
        totalMarketValueUsd,
        totalCostBasisUsd,
        totalUnrealizedPnlUsd,
        totalRealizedPnlUsd,
        totalPnlUsd,
        portfolioCount,
        holdingsCount: holdings.length,
        topGainers,
        topLosers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardAllocation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const { transactions, portfolioMissing } = await loadTransactionsForScope(
      req.user?.userId,
      portfolioId
    );

    if (portfolioMissing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const { positions } = aggregatePositionsAndRealized(transactions);
    const holdings = await enrichHoldingsWithMarket(positions);
    const segments = buildAllocationSegments(holdings);

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolioId ?? null,
        segments,
        totalMarketValueUsd: segments.reduce((s, x) => s + x.valueUsd, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30));

    const { transactions, portfolioMissing } = await loadTransactionsForScope(
      req.user?.userId,
      portfolioId
    );

    if (portfolioMissing) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const { points, note } = await computePerformanceSeries(transactions, days);

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolioId ?? null,
        days,
        points,
        note,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardTrend = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const perPage = Math.min(100, Math.max(1, Number(req.query.perPage) || 10));

    const [topGainers, topLosers] = await Promise.all([
      fetchUsdMarketsBy24hChange('desc', perPage),
      fetchUsdMarketsBy24hChange('asc', perPage),
    ]);

    res.status(200).json({
      success: true,
      data: {
        topGainers,
        topLosers,
      },
    });
  } catch (error) {
    next(error);
  }
};
