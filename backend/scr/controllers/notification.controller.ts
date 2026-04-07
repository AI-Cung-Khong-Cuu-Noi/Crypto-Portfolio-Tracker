import { Response, NextFunction } from 'express';
import { Notification } from '../models/notification.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const filter: Record<string, unknown> = { userId: req.user?.userId };
    if (unreadOnly) {
      filter.read = false;
    }

    const [items, total] = await Promise.all([
      Notification.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
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

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.status(200).json({ success: true, message: 'Đã đánh dấu đã đọc', data: doc });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user?.userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả là đã đọc',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
