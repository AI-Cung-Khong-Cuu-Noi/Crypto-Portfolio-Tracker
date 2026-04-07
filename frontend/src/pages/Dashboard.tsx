import { useDashboardSummary, useDashboardAllocation, useDashboardPerformance, useDashboardTrend } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency, getColorClass } from '../utils/format';
import { useState } from 'react';
import { Button } from '../components/ui/Button';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const [performanceDays, setPerformanceDays] = useState(30);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: allocation, isLoading: allocationLoading } = useDashboardAllocation();
  const { data: performance, isLoading: performanceLoading } = useDashboardPerformance(performanceDays);
  const { data: trend, isLoading: trendLoading } = useDashboardTrend();

  if (summaryLoading) {
    return <div className='p-6 text-center'>Loading dashboard...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Total Portfolio Value</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>
                  {formatCurrency(summary?.totalPortfolioValue || 0)}
                </p>
              </div>
              <div className='w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center'>
                <Wallet className='text-blue-600' size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Unrealized P&L</p>
                <p className={`text-2xl font-bold mt-1 ${getColorClass(summary?.totalUnrealizedPnL || 0)}`}>
                  {formatCurrency(summary?.totalUnrealizedPnL || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                (summary?.totalUnrealizedPnL || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {(summary?.totalUnrealizedPnL || 0) >= 0 ? (
                  <TrendingUp className='text-green-600' size={24} />
                ) : (
                  <TrendingDown className='text-red-600' size={24} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Realized P&L</p>
                <p className={`text-2xl font-bold mt-1 ${getColorClass(summary?.totalRealizedPnL || 0)}`}>
                  {formatCurrency(summary?.totalRealizedPnL || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                (summary?.totalRealizedPnL || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {(summary?.totalRealizedPnL || 0) >= 0 ? (
                  <TrendingUp className='text-green-600' size={24} />
                ) : (
                  <TrendingDown className='text-red-600' size={24} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Portfolios</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>{summary?.portfolioCount || 0}</p>
              </div>
              <div className='w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center'>
                <span className='text-purple-600 text-lg font-bold'>📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Performance</CardTitle>
              <div className='flex gap-2'>
                {[7, 30, 90, 365].map((days) => (
                  <Button
                    key={days}
                    variant={performanceDays === days ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setPerformanceDays(days)}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <div className='h-80 flex items-center justify-center text-gray-500'>Loading chart...</div>
            ) : performance && performance.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type='monotone' dataKey='marketValue' stroke='#3b82f6' name='Market Value' />
                  <Line type='monotone' dataKey='costBasis' stroke='#10b981' name='Cost Basis' />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-80 flex items-center justify-center text-gray-500'>No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationLoading ? (
              <div className='h-80 flex items-center justify-center text-gray-500'>Loading chart...</div>
            ) : allocation && allocation.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={allocation}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ symbol, percentage }) => `${symbol} ${(percentage * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-80 flex items-center justify-center text-gray-500'>No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.topGainers && summary.topGainers.length > 0 ? (
              <div className='space-y-3'>
                {summary.topGainers.map((coin) => (
                  <div key={coin.symbol} className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{coin.symbol}</p>
                      <p className='text-sm text-gray-600'>
                        {coin.quantity} • {formatCurrency(coin.totalValue)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-green-600'>+{(coin.unrealizedPnLPercent * 100).toFixed(2)}%</p>
                      <p className='text-sm text-green-600'>{formatCurrency(coin.unrealizedPnL)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>No gainers yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Losers</CardTitle>
          </CardHeader>
          <CardContent>
            {summary && summary.topLosers && summary.topLosers.length > 0 ? (
              <div className='space-y-3'>
                {summary.topLosers.map((coin) => (
                  <div key={coin.symbol} className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{coin.symbol}</p>
                      <p className='text-sm text-gray-600'>
                        {coin.quantity} • {formatCurrency(coin.totalValue)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-red-600'>{(coin.unrealizedPnLPercent * 100).toFixed(2)}%</p>
                      <p className='text-sm text-red-600'>{formatCurrency(coin.unrealizedPnL)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>No losers yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {trend && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='text-green-600' size={20} />
                Market Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {trend.gainers && trend.gainers.length > 0 ? (
                  trend.gainers.slice(0, 5).map((coin) => (
                    <div key={coin.symbol} className='flex items-center justify-between p-2'>
                      <span className='font-medium'>{coin.symbol}</span>
                      <span className='text-green-600 font-medium'>+{(coin.change24h * 100).toFixed(2)}%</span>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-500 text-center py-4'>No data</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingDown className='text-red-600' size={20} />
                Market Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {trend.losers && trend.losers.length > 0 ? (
                  trend.losers.slice(0, 5).map((coin) => (
                    <div key={coin.symbol} className='flex items-center justify-between p-2'>
                      <span className='font-medium'>{coin.symbol}</span>
                      <span className='text-red-600 font-medium'>{(coin.change24h * 100).toFixed(2)}%</span>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-500 text-center py-4'>No data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
