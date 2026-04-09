import { Response, NextFunction } from 'express';
import { WatchlistItem } from '../models/watchlistItem.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { binanceRealtimeService } from '../services/binanceRealtime.service';
import { attachRealtimePriceHeaders } from '../utils/realtimeMeta.util';

export const addWatchlistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { symbol, coinGeckoId } = req.body;
    const sym = String(symbol).toUpperCase();

    try {
      const item = await WatchlistItem.create({
        userId: req.user?.userId,
        symbol: sym,
        coinGeckoId: coinGeckoId?.toLowerCase(),
      });

      const pricedAt = new Date().toISOString();
      attachRealtimePriceHeaders(res, pricedAt);
      const priceMap = await binanceRealtimeService.getQuotesForSymbols([sym]);
      const q = priceMap.get(sym) ?? { usd: null, usd_24h_change: null };

      return res.status(201).json({
        success: true,
        message: 'Đã thêm vào watchlist',
        data: {
          _id: item._id,
          symbol: item.symbol,
          coinGeckoId: item.coinGeckoId,
          currentPriceUsd: q.usd,
          change24hPercent: q.usd_24h_change,
          created_at: item.created_at,
        },
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code?: number }).code === 11000) {
        return res.status(409).json({ success: false, message: 'Coin đã có trong watchlist' });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const getWatchlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pricedAt = new Date().toISOString();
    attachRealtimePriceHeaders(res, pricedAt);

    const items = await WatchlistItem.find({ userId: req.user?.userId }).sort({ created_at: -1 });
    const symbols = items.map((i) => String(i.symbol).trim().toUpperCase());
    const priceMap = await binanceRealtimeService.getQuotesForSymbols(symbols);

    const data = items.map((i) => {
      const sym = String(i.symbol).trim().toUpperCase();
      const q = priceMap.get(sym) ?? { usd: null, usd_24h_change: null };
      return {
        _id: i._id,
        symbol: sym,
        coinGeckoId: i.coinGeckoId,
        currentPriceUsd: q.usd,
        change24hPercent: q.usd_24h_change,
        created_at: i.created_at,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const removeWatchlistItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const item = await WatchlistItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mục watchlist' });
    }

    res.status(200).json({ success: true, message: 'Đã xóa khỏi watchlist' });
  } catch (error) {
    next(error);
  }
};
