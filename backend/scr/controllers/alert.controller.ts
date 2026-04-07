import { Response, NextFunction } from 'express';
import { Alert } from '../models/alert.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { symbol, coinGeckoId, kind, threshold, isActive, cooldownMinutes } = req.body;

    const alert = await Alert.create({
      userId: req.user?.userId,
      symbol: String(symbol).toUpperCase(),
      coinGeckoId: coinGeckoId?.toLowerCase(),
      kind,
      threshold,
      isActive: isActive ?? true,
      cooldownMinutes: cooldownMinutes ?? 60,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo cảnh báo thành công',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alerts = await Alert.find({ userId: req.user?.userId }).sort({ created_at: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

export const updateAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cảnh báo' });
    }

    const body = req.body as Record<string, unknown>;
    if (body.symbol !== undefined) alert.symbol = String(body.symbol).toUpperCase();
    if (body.coinGeckoId !== undefined) {
      alert.coinGeckoId = body.coinGeckoId ? String(body.coinGeckoId).toLowerCase() : undefined;
    }
    if (body.kind !== undefined) alert.kind = body.kind as typeof alert.kind;
    if (body.threshold !== undefined) alert.threshold = body.threshold as number;
    if (body.isActive !== undefined) alert.isActive = Boolean(body.isActive);
    if (body.cooldownMinutes !== undefined) alert.cooldownMinutes = body.cooldownMinutes as number;

    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật cảnh báo thành công',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cảnh báo' });
    }

    res.status(200).json({ success: true, message: 'Đã xóa cảnh báo' });
  } catch (error) {
    next(error);
  }
};
