import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASS } from '../config/env';

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('Cảnh báo: Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS trong biến môi trường.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

export const sendMail = async (to: string, subject: string, text: string, html?: string) => {
  await transporter.sendMail({
    from: `"Crypto Portfolio Tracker" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html
  });
};

function buildOtpHtml({
  title,
  name,
  description,
  otp,
  companyName = 'Crypto Portfolio Tracker'
}: {
  title: string;
  name?: string;
  description: string;
  otp: string;
  companyName?: string;
}) {
  const currentYear = new Date().getFullYear();
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="text-align: center; color: #333; margin-bottom: 20px;">${title}</h2>
        <p style="font-size: 16px; color: #555; margin-bottom: 10px;">Xin chào ${name || 'bạn'},</p>
        <p style="font-size: 16px; color: #555; margin-bottom: 20px;">${description}</p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Mã OTP của bạn:</p>
          <span style="font-size: 36px; color: #007BFF; font-weight: bold; letter-spacing: 4px;">${otp}</span>
        </div>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="font-size: 14px; color: #856404; margin: 0;">
            <strong>⚠️ Lưu ý quan trọng:</strong>
          </p>
          <ul style="font-size: 14px; color: #856404; margin: 10px 0 0 20px; padding: 0;">
            <li>Mã OTP có hiệu lực trong 5 phút</li>
            <li>Không chia sẻ mã này với bất kỳ ai</li>
            <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này</li>
          </ul>
        </div>
        <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />
        <div style="text-align: center;">
          <p style="font-size: 12px; color: #999; margin: 0;">
            &copy; ${currentYear} ${companyName}. All rights reserved.
          </p>
          <p style="font-size: 12px; color: #999; margin: 5px 0 0 0;">
            Email này được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      </div>
    </div>
  `;
}

export const sendOtpMail = async ({
  to,
  title,
  name,
  description,
  otp,
  companyName
}: {
  to: string;
  title: string;
  name?: string;
  description: string;
  otp: string;
  companyName?: string;
}) => {
  if (!to || typeof to !== 'string' || !to.includes('@') || !to.trim()) {
    throw new Error('Email người nhận không hợp lệ');
  }
  const html = buildOtpHtml({ title, name, description, otp, companyName });
  await transporter.sendMail({
    from: `"Crypto Portfolio Tracker" <${EMAIL_USER}>`,
    to,
    subject: title,
    html
  });
};
