import { Response, NextFunction } from 'express';
import { Portfolio } from '../models/portfolio.model';
import { Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  aggregateHoldingsFromTransactions,
  enrichHoldingsWithMarket,
} from '../services/holdings.service';

export const getHoldingsByPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const transactions = await Transaction.find({ portfolioId: portfolio._id }).sort({ date: 1 });
    const positions = aggregateHoldingsFromTransactions(transactions);
    const holdings = await enrichHoldingsWithMarket(positions);

    const symbolsMissingPrice = holdings
      .filter((h) => h.currentPriceUsd == null)
      .map((h) => h.symbol);

    const totalCostBasisUsd = holdings.reduce((sum, h) => sum + h.costBasisUsd, 0);
    const totalMarketValueUsd = holdings.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0);
    const totalUnrealizedPnlUsd = holdings.reduce((sum, h) => sum + (h.unrealizedPnlUsd ?? 0), 0);

    res.status(200).json({
      success: true,
      data: {
        portfolioId: portfolio._id,
        holdings,
        summary: {
          totalCostBasisUsd,
          totalMarketValueUsd,
          totalUnrealizedPnlUsd,
          symbolsMissingPrice,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
