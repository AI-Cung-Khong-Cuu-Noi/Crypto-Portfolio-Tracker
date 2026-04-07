import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { usePortfolios } from '../hooks/usePortfolio';

export default function Reports() {
  const [period, setPeriod] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');
  const { data: portfolios } = usePortfolios();

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
              <Button className='w-full'>Export PDF</Button>
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
              <p className='text-gray-500 mb-4'>Report data will load based on filters</p>
              <p className='text-3xl font-bold text-gray-900'>$0.00</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-center py-12'>
              <p className='text-3xl font-bold text-gray-900'>0</p>
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
          <div className='text-center py-12 text-gray-500'>
            <p>Tax report will display realized P&L by coin for tax purposes</p>
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
                <tr className='border-b border-gray-100'>
                  <td colSpan={4} className='text-center py-8 text-gray-500'>
                    No data available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
