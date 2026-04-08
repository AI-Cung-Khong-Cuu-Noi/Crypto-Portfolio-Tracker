import { Alert, AlertKind, IAlert } from '../models/alert.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import {
  CoinGeckoUsdQuote,
  fetchUsdQuotesByCoinIds,
  resolveCoinGeckoId,
} from '../utils/coingecko.util';
import { sendMail } from '../utils/mailer.util';

function isAlertTriggered(alert: IAlert, quote: CoinGeckoUsdQuote): boolean {
  const usd = quote.usd;
  const chg = quote.usd_24h_change;
  const t = alert.threshold;

  switch (alert.kind as AlertKind) {
    case 'PRICE_ABOVE':
      return usd != null && usd >= t;
    case 'PRICE_BELOW':
      return usd != null && usd <= t;
    case 'CHANGE_24H_ABOVE':
      return chg != null && chg >= t;
    case 'CHANGE_24H_BELOW':
      return chg != null && chg <= -t;
    default:
      return false;
  }
}

function buildAlertMessage(alert: IAlert, quote: CoinGeckoUsdQuote): string {
  const usd = quote.usd;
  const chg = quote.usd_24h_change;
  const lines = [
    `Mã: ${alert.symbol}`,
    `Loại: ${alert.kind}`,
    `Ngưỡng: ${alert.threshold}`,
    usd != null ? `Giá hiện tại (USD): ${usd}` : 'Giá hiện tại: không lấy được',
    chg != null ? `Thay đổi 24h: ${chg.toFixed(2)}%` : 'Thay đổi 24h: không có',
  ];
  return lines.join('\n');
}

function buildAlertEmailHtml(alert: IAlert, quote: CoinGeckoUsdQuote): string {
  const usd = quote.usd;
  const chg = quote.usd_24h_change;
  const kindLabelMap: Record<AlertKind, string> = {
    PRICE_ABOVE: 'Giá vượt ngưỡng',
    PRICE_BELOW: 'Giá giảm dưới ngưỡng',
    CHANGE_24H_ABOVE: 'Biến động 24h tăng mạnh',
    CHANGE_24H_BELOW: 'Biến động 24h giảm mạnh',
  };

  const kindLabel = kindLabelMap[alert.kind as AlertKind] ?? alert.kind;
  const currentYear = new Date().getFullYear();
  const thresholdText = `${alert.threshold}${String(alert.kind).includes('CHANGE_24H') ? '%' : ' USD'}`;
  const currentPriceText = usd != null ? `${usd.toLocaleString()} USD` : 'Không lấy được dữ liệu';
  const changeText = chg != null ? `${chg.toFixed(2)}%` : 'Không có dữ liệu';

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f6fb;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="padding: 20px 24px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px;">Cảnh báo giá ${alert.symbol}</h2>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">${kindLabel}</p>
        </div>

        <div style="padding: 20px 24px;">
          <p style="margin: 0 0 16px; color: #374151; font-size: 14px;">
            Điều kiện cảnh báo của bạn vừa được kích hoạt. Chi tiết bên dưới:
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; color: #6b7280;">Ma coin</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827; font-weight: 600;">${alert.symbol}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; color: #6b7280;">Loại cảnh báo</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">${kindLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; color: #6b7280;">Ngưỡng</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">${thresholdText}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; color: #6b7280;">Giá hiện tại</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">${currentPriceText}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; color: #6b7280;">Thay đổi 24h</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; color: #111827;">${changeText}</td>
            </tr>
          </table>

          <p style="margin: 16px 0 0; color: #6b7280; font-size: 12px;">
            Đây là email tự động từ hệ thống Crypto Portfolio Tracker. Vui lòng không trả lời email này.
          </p>
        </div>

        <div style="padding: 12px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
          © ${currentYear} Crypto Portfolio Tracker
        </div>
      </div>
    </div>
  `;
}

export async function evaluateAlertsAndNotify(): Promise<void> {
  const alerts = await Alert.find({ isActive: true });
  if (alerts.length === 0) {
    return;
  }

  const idByAlertKey = new Map<string, string | null>();
  for (const a of alerts) {
    const id = await resolveCoinGeckoId(a.symbol, a.coinGeckoId);
    idByAlertKey.set(String(a._id), id);
  }

  const uniqueIds = [...new Set([...idByAlertKey.values()].filter(Boolean))] as string[];
  const quotes = uniqueIds.length > 0 ? await fetchUsdQuotesByCoinIds(uniqueIds) : {};

  for (const alert of alerts) {
    const id = idByAlertKey.get(String(alert._id));
    if (!id) {
      continue;
    }

    const q = quotes[id];
    if (!q) {
      continue;
    }

    if (!isAlertTriggered(alert, q)) {
      continue;
    }

    const cooldownMs = (alert.cooldownMinutes ?? 60) * 60 * 1000;
    if (alert.lastTriggeredAt) {
      const elapsed = Date.now() - new Date(alert.lastTriggeredAt).getTime();
      if (elapsed < cooldownMs) {
        continue;
      }
    }

    await Alert.findByIdAndUpdate(alert._id, { lastTriggeredAt: new Date() });

    const user = await User.findById(alert.userId);
    if (!user) {
      continue;
    }

    const title = `[Crypto Tracker] Cảnh báo ${alert.symbol}`;
    const body = buildAlertMessage(alert, q);

    await Notification.create({
      userId: alert.userId,
      alertId: alert._id,
      title,
      body,
      read: false,
    });

    try {
      const htmlBody = buildAlertEmailHtml(alert, q);
      await sendMail(user.email, title, body, htmlBody);
    } catch (err) {
      console.error('Gửi email cảnh báo thất bại:', err);
    }
  }
}
