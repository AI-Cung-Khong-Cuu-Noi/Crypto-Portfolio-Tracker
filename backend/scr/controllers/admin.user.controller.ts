import { NextFunction, Request, Response } from 'express';
import { User } from '../models/user.model';

const parsePagination = (req: Request) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
};

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req);
    const { email, name, role, status } = req.query;

    const filter: Record<string, any> = { deleted_at: null };

    if (typeof email === 'string' && email.trim()) {
      filter.email = { $regex: email.trim(), $options: 'i' };
    }

    if (typeof name === 'string' && name.trim()) {
      filter.name = { $regex: name.trim(), $options: 'i' };
    }

    if (typeof role === 'string' && ['USER', 'ADMIN'].includes(role)) {
      filter.role = role;
    }

    if (typeof status === 'string' && ['PENDING', 'ACTIVE', 'BANNED'].includes(status)) {
      filter.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ created_at: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: req.params.id, deleted_at: null });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findOne({ _id: req.params.id, deleted_at: null });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id }, deleted_at: null });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const resetAdminUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findOne({ _id: req.params.id, deleted_at: null }).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Reset mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;

    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, deleted_at: null },
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const softDeleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, deleted_at: null },
      { $set: { deleted_at: new Date(), status: 'BANNED' } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công',
    });
  } catch (error) {
    next(error);
  }
};
