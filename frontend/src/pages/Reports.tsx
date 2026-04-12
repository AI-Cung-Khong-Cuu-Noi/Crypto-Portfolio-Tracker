import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useEffect, useMemo, useState } from 'react';
import { usePortfolios } from '../hooks/usePortfolio';
import { useReportsByCoin, useReportsSummary, useReportsTaxRealized } from '../hooks/useReports';
import { useRealtimeDashboard } from '../hooks/useRealtimeDashboard';
import { useRealtimePortfolioHoldings } from '../hooks/useRealtimePortfolioHoldings';
import { formatCurrency, formatUsdOrDash, getColorClass } from '../utils/format';

const toCsvCell = (value: string | number | null | undefined) => {
  const text = value === null || value === undefined ? '' : String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export default function Reports() {
  const [period, setPeriod] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
  const { data: portfolios, refetch: refetchPortfolios } = usePortfolios();
  const portfolioId = selectedPortfolio === 'all' ? undefined : selectedPortfolio;
  const { data: summary, refetch: refetchSummary } = useReportsSummary(period, portfolioId);
  const { data: taxRealized, refetch: refetchTaxRealized } = useReportsTaxRealized(portfolioId);
  const { data: byCoin, isLoading: byCoinLoading, refetch: refetchByCoin } = useReportsByCoin(portfolioId);
  const { realtimeSummary, realtimeHoldings } = useRealtimeDashboard();
  const realtimePortfolioHoldings = useRealtimePortfolioHoldings(portfolioId);

  useEffect(() => {
    refetchPortfolios();
    refetchSummary();
    refetchTaxRealized();
    refetchByCoin();
  }, [refetchPortfolios, refetchSummary, refetchTaxRealized, refetchByCoin]);

  const totalUnrealizedPnlUsd = useMemo(() => {
    const coins = byCoin?.coins;
    if (!coins) return null;
    return coins.reduce((sum, c) => sum + (c.unrealizedPnlUsd ?? 0), 0);
  }, [byCoin?.coins]);

  const realtimeUnrealizedPnlUsd = useMemo(() => {
    if (portfolioId) {
      return realtimePortfolioHoldings?.summary?.totalUnrealizedPnlUsd ?? null;
    }
    return realtimeSummary?.totalUnrealizedPnlUsd ?? null;
  }, [portfolioId, realtimePortfolioHoldings?.summary?.totalUnrealizedPnlUsd, realtimeSummary?.totalUnrealizedPnlUsd]);

  const displayTotalUnrealizedPnlUsd = realtimeUnrealizedPnlUsd ?? totalUnrealizedPnlUsd;

  const realtimeUnrealizedBySymbol = useMemo(() => {
    const out: Record<string, number | null> = {};
    const rows = portfolioId ? (realtimePortfolioHoldings?.holdings ?? []) : (realtimeHoldings ?? []);
    for (const row of rows) {
      const symbol = String(row.symbol).trim().toUpperCase();
      if (!symbol) continue;
      const unrealized = 'unrealizedPnL' in row ? row.unrealizedPnL : row.unrealizedPnlUsd;
      out[symbol] = unrealized ?? null;
    }
    return out;
  }, [portfolioId, realtimePortfolioHoldings?.holdings, realtimeHoldings]);

  const handleExportCsv = () => {
    const rows: string[] = [];
    const now = new Date();
    const periodLabelVi = period === 'DAY' ? 'Ngày' : period === 'MONTH' ? 'Tháng' : 'Năm';

    rows.push('Tóm tắt báo cáo');
    rows.push(`Tạo lúc,${toCsvCell(now.toISOString())}`);
    rows.push(`Kỳ,${toCsvCell(periodLabelVi)}`);
    rows.push(`Danh mục,${toCsvCell(selectedPortfolio === 'all' ? 'Tất cả' : selectedPortfolio)}`);
    rows.push(`Tổng giao dịch,${toCsvCell(summary?.totals.tradeCount ?? 0)}`);
    rows.push(`Lãi lỗ đã thực hiện USD,${toCsvCell(summary?.totals.realizedPnlUsd ?? 0)}`);
    rows.push(
      `Tổng lãi lỗ chưa thực hiện USD (vị thế mở),${toCsvCell(
        displayTotalUnrealizedPnlUsd == null ? '' : displayTotalUnrealizedPnlUsd
      )}`
    );
    rows.push(`Khối lượng mua USD,${toCsvCell(summary?.totals.buyVolumeUsd ?? 0)}`);
    rows.push(`Khối lượng bán USD,${toCsvCell(summary?.totals.sellVolumeUsd ?? 0)}`);
    rows.push('');

    rows.push('Chi tiết theo kỳ');
    rows.push('Kỳ,Số giao dịch,Khối lượng mua USD,Khối lượng bán USD,Lãi lỗ đã thực hiện USD');
    (summary?.buckets ?? []).forEach((bucket) => {
      rows.push(
        [
          toCsvCell(bucket.period),
          toCsvCell(bucket.tradeCount),
          toCsvCell(bucket.buyVolumeUsd),
          toCsvCell(bucket.sellVolumeUsd),
          toCsvCell(bucket.realizedPnlUsd),
        ].join(',')
      );
    });
    rows.push('');

    rows.push('Thuế (lãi lỗ đã thực hiện)');
    rows.push('Ngày,Mã,Số lượng bán,Thu USD,Giá vốn USD,Lãi lỗ đã thực hiện USD,Sàn');
    (taxRealized?.lines ?? []).forEach((line) => {
      rows.push(
        [
          toCsvCell(line.date),
          toCsvCell(line.symbol),
          toCsvCell(line.amountSold),
          toCsvCell(line.proceedsUsd),
          toCsvCell(line.costBasisUsd),
          toCsvCell(line.realizedPnlUsd),
          toCsvCell(line.exchange),
        ].join(',')
      );
    });
    rows.push('');

    rows.push('Hiệu suất theo coin');
    rows.push(
      'Mã,Số giao dịch,Giá vốn USD,Lãi lỗ đã thực hiện (cộng dồn) USD,Lãi lỗ chưa thực hiện USD,Số lượng hiện tại'
    );
    (byCoin?.coins ?? []).forEach((coin) => {
      rows.push(
        [
          toCsvCell(coin.symbol),
          toCsvCell(coin.buyCount + coin.sellCount),
          toCsvCell(coin.costBasisUsd),
          toCsvCell(coin.realizedPnlUsdLifetime),
          toCsvCell(coin.unrealizedPnlUsd ?? ''),
          toCsvCell(coin.currentQuantity),
        ].join(',')
      );
    });

    // UTF-8 BOM + CRLF: Excel (Windows) nhận đúng tiếng Việt; không BOM thường bị đọc sai encoding.
    const csvBody = rows.join('\r\n');
    const blob = new Blob([`\uFEFF${csvBody}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-${now.toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Báo cáo & phân tích</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <div className='flex gap-2'>
                {(
                  [
                    { key: 'DAY' as const, label: 'Ngày' },
                    { key: 'MONTH' as const, label: 'Tháng' },
                    { key: 'YEAR' as const, label: 'Năm' },
                  ] as const
                ).map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={period === key ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setPeriod(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Danh mục</label>
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              >
                <option value='all'>Tất cả danh mục</option>
                {portfolios?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-end'>
              <Button className='w-full' onClick={handleExportCsv}>
                Xuất CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Tổng lãi/lỗ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              {byCoinLoading ? (
                <p className='text-3xl font-bold text-gray-400'>Đang tải...</p>
              ) : (
                <p className={`text-3xl font-bold ${getColorClass(displayTotalUnrealizedPnlUsd ?? 0)}`}>
                  {formatCurrency(displayTotalUnrealizedPnlUsd ?? 0)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tổng giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8'>
              <p className='text-sm text-gray-500 mb-2'>Trong kỳ đã chọn</p>
              <p className='text-3xl font-bold text-gray-900'>{summary?.totals.tradeCount || 0}</p>
              <p className='text-gray-500 mt-2'>giao dịch</p>
            </div>
          </CardContent>
        </Card>
      </div>

      

      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất theo coin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 font-semibold text-gray-900'>Mã</th>
                  <th className='text-right py-3 px-4 font-semibold text-gray-900'>Giao dịch</th>
                  <th className='text-right py-3 px-4 font-semibold text-gray-900'>Giá vốn</th>
                  <th className='text-right py-3 px-4 font-semibold text-gray-900'>Lãi/lỗ</th>
                </tr>
              </thead>
              <tbody>
                {byCoin?.coins && byCoin.coins.length > 0 ? (
                  byCoin.coins.map((coin) => {
                    const symbol = String(coin.symbol).trim().toUpperCase();
                    const realtimeUnrealized = realtimeUnrealizedBySymbol[symbol];
                    const displayUnrealized = realtimeUnrealized ?? coin.unrealizedPnlUsd ?? null;

                    return (
                      <tr key={coin.symbol} className='border-b border-gray-100'>
                        <td className='py-3 px-4 font-medium text-gray-900'>{coin.symbol}</td>
                        <td className='text-right py-3 px-4 text-gray-600'>{coin.buyCount + coin.sellCount}</td>
                        <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(coin.costBasisUsd)}</td>
                        <td
                          className={`text-right py-3 px-4 font-semibold ${
                            displayUnrealized != null ? getColorClass(displayUnrealized) : 'text-gray-500'
                          }`}
                        >
                          {formatUsdOrDash(displayUnrealized)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className='border-b border-gray-100'>
                    <td colSpan={5} className='text-center py-8 text-gray-500'>
                      Chưa có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
