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
      await sendMail(user.email, title, body);
    } catch (err) {
      console.error('Gửi email cảnh báo thất bại:', err);
    }
  }
}
