import type { Response } from 'express';

export type PriceMeta = {
  priceSource: 'binance';
  pricedAt: string;
};

/**
 * Thời điểm snapshot giá (Binance spot / cache WS). Dùng cho body JSON.
 */
export function priceMeta(pricedAt: string): PriceMeta {
  return { priceSource: 'binance', pricedAt };
}

/**
 * REST không cache — tránh CDN/trình duyệt trả số giá cũ khi client poll.
 */
export function attachRealtimePriceHeaders(res: Response, pricedAt: string): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Price-Source', 'binance');
  res.setHeader('X-Priced-At', pricedAt);
}
