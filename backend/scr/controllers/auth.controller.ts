import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { OtpToken } from '../models/otpToken.model';
import { generateToken } from '../utils/jwt.util';
import { generateOTP } from '../utils/otp.util';
import { sendOtpMail } from '../utils/mailer.util';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    const newUser = new User({ email, password, name, status: 'PENDING' });
    await newUser.save();

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OtpToken.create({ userId: newUser._id, otp, expiresAt });

    await sendOtpMail({
      to: email,
      title: 'Xác thực tài khoản Crypto Portfolio Tracker',
      name,
      description: 'Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình xác thực:',
      otp
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.',
      data: {
        userId: newUser._id,
        email: newUser.email,
        status: newUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
    }

    if (user.status === 'PENDING') {
      return res.status(403).json({ success: false, message: 'Tài khoản chưa được xác thực. Vui lòng xác thực OTP trước.' });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị cấm.' });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Tài khoản đã được xác thực' });
    }

    const now = new Date();
    await OtpToken.deleteMany({ userId: user._id, expiresAt: { $lte: now } });

    const otpRecord = await OtpToken.findOne({ userId: user._id, otp, expiresAt: { $gt: now } });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Mã OTP không hợp lệ hoặc đã hết hạn' });
    }

    user.status = 'ACTIVE';
    await user.save();

    await OtpToken.deleteOne({ _id: otpRecord._id });

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      message: 'Xác thực OTP thành công. Tài khoản đã được kích hoạt.'
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.status === 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Tài khoản đã hoạt động' });
    }

    // Delete existing OTPs
    await OtpToken.deleteMany({ userId: user._id });

    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpToken.create({ userId: user._id, otp: newOtp, expiresAt });

    await sendOtpMail({
      to: email,
      title: 'Mã OTP mới cho Crypto Portfolio Tracker',
      name: user.name,
      description: 'Bạn vừa yêu cầu cấp lại mã OTP. Vui lòng sử dụng mã OTP dưới đây:',
      otp: newOtp
    });

    res.status(200).json({
      success: true,
      message: 'Mã OTP mới đã được gửi vào email',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị cấm.' });
    }

    await OtpToken.deleteMany({ userId: user._id });

    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpToken.create({ userId: user._id, otp: newOtp, expiresAt });

    await sendOtpMail({
      to: email,
      title: 'Khôi phục mật khẩu Crypto Portfolio Tracker',
      name: user.name,
      description: 'Bạn vừa yêu cầu khôi phục mật khẩu. Vui lòng sử dụng mã OTP dưới đây để thiết lập mật khẩu mới:',
      otp: newOtp
    });

    res.status(200).json({
      success: true,
      message: 'Mã OTP khôi phục mật khẩu đã được gửi vào email',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const now = new Date();
    await OtpToken.deleteMany({ userId: user._id, expiresAt: { $lte: now } });

    const otpRecord = await OtpToken.findOne({ userId: user._id, otp, expiresAt: { $gt: now } });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn' });
    }

    user.password = newPassword;
    await user.save();

    await OtpToken.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};
