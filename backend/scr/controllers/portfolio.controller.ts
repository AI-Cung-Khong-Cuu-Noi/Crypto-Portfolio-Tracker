import { Response, NextFunction } from 'express';
import { Portfolio } from '../models/portfolio.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    const portfolio = await Portfolio.create({
      userId: req.user?.userId,
      name,
      description: description ?? '',
    });

    res.status(201).json({
      success: true,
      message: 'Tạo portfolio thành công',
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

export const getPortfolios = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.user?.userId }).sort({ created_at: -1 });

    res.status(200).json({
      success: true,
      data: portfolios,
    });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;

    const updateData: { name?: string; description?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật portfolio thành công',
      data: portfolio,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy portfolio' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa portfolio thành công',
    });
  } catch (error) {
    next(error);
  }
};
