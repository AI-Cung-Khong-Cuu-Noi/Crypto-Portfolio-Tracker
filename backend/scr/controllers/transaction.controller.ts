import { Response, NextFunction } from 'express';
import { Portfolio } from '../models/portfolio.model';
import { Transaction } from '../models/transaction.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { events, TRANSACTION_EVENTS } from '../utils/events';

async function assertPortfolioOwnedByUser(portfolioId: string, userId: string | undefined) {
  const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
  return portfolio;
}

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      portfolioId,
      type,
      transferDirection,
      symbol,
      coinGeckoId,
      amount,
      price,
      fee,
      totalValue,
      exchange,
      date,
      note,
    } = req.body;

    const portfolio = await assertPortfolioOwnedByUser(portfolioId, req.user?.userId);
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const doc = await Transaction.create({
      userId: req.user?.userId,
      portfolioId,
      type,
      transferDirection: type === 'TRANSFER' ? transferDirection : undefined,
      symbol: String(symbol).toUpperCase(),
      coinGeckoId: coinGeckoId?.toLowerCase(),
      amount,
      price,
      fee: fee ?? 0,
      totalValue,
      exchange: exchange ?? '',
      date,
      note: note ?? '',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công',
      data: doc,
    });

    // Notify realtime layer
    if (req.user?.userId) {
      events.emit(TRANSACTION_EVENTS.CHANGED, {
        userId: req.user.userId,
        portfolioId: portfolioId,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolioId = req.query.portfolioId as string | undefined;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId: req.user?.userId };
    if (portfolioId) {
      const portfolio = await assertPortfolioOwnedByUser(portfolioId, req.user?.userId);
      if (!portfolio) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
      }
      filter.portfolioId = portfolioId;
    }

    const [items, total] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    const portfolio = await assertPortfolioOwnedByUser(String(tx.portfolioId), req.user?.userId);
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    const body = req.body as Record<string, unknown>;
    const nextType = (body.type as string | undefined) ?? tx.type;

    if (body.symbol !== undefined) tx.symbol = String(body.symbol).toUpperCase();
    if (body.amount !== undefined) tx.amount = body.amount as number;
    if (body.price !== undefined) tx.price = body.price as number;
    if (body.fee !== undefined) tx.fee = body.fee as number;
    if (body.totalValue !== undefined) tx.totalValue = body.totalValue as number;
    if (body.exchange !== undefined) tx.exchange = body.exchange as string;
    if (body.date !== undefined) tx.date = body.date as Date;
    if (body.note !== undefined) tx.note = body.note as string;
    if (body.coinGeckoId !== undefined) {
      tx.coinGeckoId = body.coinGeckoId ? String(body.coinGeckoId).toLowerCase() : undefined;
    }
    if (body.type !== undefined) tx.type = body.type as typeof tx.type;
    if (nextType === 'TRANSFER') {
      if (body.transferDirection !== undefined) {
        tx.transferDirection = body.transferDirection as typeof tx.transferDirection;
      }
    } else {
      tx.transferDirection = undefined;
    }

    if (tx.type === 'TRANSFER' && !tx.transferDirection) {
      return res.status(400).json({
        success: false,
        message: 'transferDirection is required when type is TRANSFER',
      });
    }

    await tx.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật giao dịch thành công',
      data: tx,
    });

    // Notify realtime layer
    if (req.user?.userId) {
      events.emit(TRANSACTION_EVENTS.CHANGED, {
        userId: req.user.userId,
        portfolioId: String(tx.portfolioId),
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy giao dịch' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa giao dịch thành công',
    });

    // Notify realtime layer
    if (req.user?.userId) {
      events.emit(TRANSACTION_EVENTS.CHANGED, {
        userId: req.user.userId,
        portfolioId: String(tx.portfolioId),
      });
    }
  } catch (error) {
    next(error);
  }
};
