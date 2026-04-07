import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { usePortfolios } from '../hooks/usePortfolio';
import { useReportsByCoin, useReportsSummary, useReportsTaxRealized } from '../hooks/useReports';
import { formatCurrency, getColorClass } from '../utils/format';

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
  const { data: portfolios } = usePortfolios();
  const portfolioId = selectedPortfolio === 'all' ? undefined : selectedPortfolio;
  const { data: summary } = useReportsSummary(period, portfolioId);
  const { data: taxRealized } = useReportsTaxRealized(portfolioId);
  const { data: byCoin } = useReportsByCoin(portfolioId);

  const handleExportCsv = () => {
    const rows: string[] = [];
    const now = new Date();

    rows.push('Report Summary');
    rows.push(`Generated At,${toCsvCell(now.toISOString())}`);
    rows.push(`Period,${toCsvCell(period)}`);
    rows.push(`Portfolio,${toCsvCell(selectedPortfolio === 'all' ? 'All' : selectedPortfolio)}`);
    rows.push(`Total Trades,${toCsvCell(summary?.totals.tradeCount ?? 0)}`);
    rows.push(`Realized PnL USD,${toCsvCell(summary?.totals.realizedPnlUsd ?? 0)}`);
    rows.push(`Buy Volume USD,${toCsvCell(summary?.totals.buyVolumeUsd ?? 0)}`);
    rows.push(`Sell Volume USD,${toCsvCell(summary?.totals.sellVolumeUsd ?? 0)}`);
    rows.push('');

    rows.push('Summary Buckets');
    rows.push('Period,Trade Count,Buy Volume USD,Sell Volume USD,Realized PnL USD');
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

    rows.push('Tax Realized');
    rows.push('Date,Symbol,Amount Sold,Proceeds USD,Cost Basis USD,Realized PnL USD,Exchange');
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

    rows.push('Performance By Coin');
    rows.push('Symbol,Trades,Cost Basis USD,Realized PnL Lifetime USD,Current Quantity');
    (byCoin?.coins ?? []).forEach((coin) => {
      rows.push(
        [
          toCsvCell(coin.symbol),
          toCsvCell(coin.buyCount + coin.sellCount),
          toCsvCell(coin.costBasisUsd),
          toCsvCell(coin.realizedPnlUsdLifetime),
          toCsvCell(coin.currentQuantity),
        ].join(',')
      );
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
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
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Reports & Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Period</label>
              <div className='flex gap-2'>
                {['DAY', 'MONTH', 'YEAR'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setPeriod(p as 'DAY' | 'MONTH' | 'YEAR')}
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Portfolio</label>
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              >
                <option value='all'>All Portfolios</option>
                {portfolios?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex items-end'>
              <Button className='w-full' onClick={handleExportCsv}>Export CSV</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Realized Gains/Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-12'>
              <p className='text-gray-500 mb-4'>From selected period</p>
              <p className={`text-3xl font-bold ${getColorClass(summary?.totals.realizedPnlUsd || 0)}`}>
                {formatCurrency(summary?.totals.realizedPnlUsd || 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-12'>
              <p className='text-3xl font-bold text-gray-900'>{summary?.totals.tradeCount || 0}</p>
              <p className='text-gray-500 mt-2'>trades</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <p className='text-sm text-gray-500'>{taxRealized?.description}</p>
            <p className={`text-xl font-semibold ${getColorClass(taxRealized?.totalRealizedPnlUsd || 0)}`}>
              {formatCurrency(taxRealized?.totalRealizedPnlUsd || 0)}
            </p>
            <p className='text-xs text-gray-500'>
              {taxRealized?.from ? new Date(taxRealized.from).toLocaleDateString() : '-'} -{' '}
              {taxRealized?.to ? new Date(taxRealized.to).toLocaleDateString() : '-'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Coin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-gray-200'>
                  <th className='text-left py-3 px-4 font-semibold text-gray-900'>Symbol</th>
                  <th className='text-right py-3 px-4 font-semibold text-gray-900'>Trades</th>
                  <th className='text-right py-3 px-4 font-semibold text-gray-900'>Cost Basis</th>
                  <th className='text-right py-3 px-4 font-semibold text-gray-900'>Realized P&L</th>
                </tr>
              </thead>
              <tbody>
                {byCoin?.coins && byCoin.coins.length > 0 ? (
                  byCoin.coins.map((coin) => (
                    <tr key={coin.symbol} className='border-b border-gray-100'>
                      <td className='py-3 px-4 font-medium text-gray-900'>{coin.symbol}</td>
                      <td className='text-right py-3 px-4 text-gray-600'>{coin.buyCount + coin.sellCount}</td>
                      <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(coin.costBasisUsd)}</td>
                      <td className={`text-right py-3 px-4 font-semibold ${getColorClass(coin.realizedPnlUsdLifetime)}`}>
                        {formatCurrency(coin.realizedPnlUsdLifetime)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className='border-b border-gray-100'>
                    <td colSpan={4} className='text-center py-8 text-gray-500'>
                      No data available
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
