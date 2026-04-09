import { useDashboardSummary, useDashboardAllocation, useDashboardPerformance, useDashboardTrend } from '../hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency, getColorClass } from '../utils/format';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { useRealtimeDashboard } from '../hooks/useRealtimeDashboard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard() {
  const [performanceDays, setPerformanceDays] = useState(7);
  const { realtimeSummary, realtimeAllocation } = useRealtimeDashboard();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useDashboardSummary();
  const { data: allocation, isLoading: allocationLoading, refetch: refetchAllocation } = useDashboardAllocation();
  const {
    data: performance,
    isLoading: performanceLoading,
    refetch: refetchPerformance,
  } = useDashboardPerformance(performanceDays);
  const { data: trend, refetch: refetchTrend } = useDashboardTrend();

  useEffect(() => {
    refetchSummary();
    refetchAllocation();
    refetchPerformance();
    refetchTrend();
  }, [refetchSummary, refetchAllocation, refetchPerformance, refetchTrend]);

  const currentSummary = realtimeSummary ?? summary;
  const currentAllocation = realtimeAllocation ?? allocation;

  // Cho phép hiển thị ngay khi WebSocket đã gửi snapshot (không chờ REST)
  const summaryBlocking = summaryLoading && realtimeSummary === null && summary === undefined;
  if (summaryBlocking) {
    return <div className='p-6 text-center'>Đang tải bảng điều khiển...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Tổng giá trị danh mục</p>
                <p className='text-2xl font-bold text-gray-900 mt-1'>
                  {formatCurrency(currentSummary?.totalMarketValueUsd || 0)}
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
                <p className='text-sm text-gray-500'>Lãi/lỗ</p>
                <p className={`text-2xl font-bold mt-1 ${getColorClass(currentSummary?.totalUnrealizedPnlUsd || 0)}`}>
                  {formatCurrency(currentSummary?.totalUnrealizedPnlUsd || 0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                (currentSummary?.totalUnrealizedPnlUsd || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {(currentSummary?.totalUnrealizedPnlUsd || 0) >= 0 ? (
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
                <p className='text-2xl font-bold text-gray-900 mt-1'>{currentSummary?.portfolioCount || 0}</p>
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
              <CardTitle>Hiệu suất</CardTitle>
              <div className='flex gap-2'>
                {[
                  { days: 7, label: '7 ngày' },
                  { days: 30, label: '30 ngày' },
                  { days: 90, label: '90 ngày' },
                  { days: 365, label: '1 năm' },
                ].map(({ days, label }) => (
                  <Button
                    key={days}
                    variant={performanceDays === days ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setPerformanceDays(days)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <div className='h-80 flex items-center justify-center text-gray-500'>Đang tải biểu đồ...</div>
            ) : performance && performance.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type='monotone' dataKey='totalMarketValueUsd' stroke='#3b82f6' name='Giá trị thị trường' />
                  <Line type='monotone' dataKey='totalCostBasisUsd' stroke='#10b981' name='Giá vốn' />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-80 flex items-center justify-center text-gray-500'>Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bổ</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationLoading && !currentAllocation ? (
              <div className='h-80 flex items-center justify-center text-gray-500'>Đang tải biểu đồ...</div>
            ) : currentAllocation && currentAllocation.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={currentAllocation}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ symbol, percent }) => `${symbol} ${(percent || 0).toFixed(1)}%`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='valueUsd'
                  >
                    {currentAllocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-80 flex items-center justify-center text-gray-500'>Chưa có dữ liệu</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Tăng mạnh nhất</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSummary && currentSummary.topGainers && currentSummary.topGainers.length > 0 ? (
              <div className='space-y-3'>
                {currentSummary.topGainers.map((coin) => (
                  <div key={coin.symbol} className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{coin.symbol}</p>
                      <p className='text-sm text-gray-600'>
                        {coin.quantity} • {formatCurrency(coin.valueUsd || 0)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-green-600'>{(coin.change24hPercent || 0).toFixed(2)}%</p>
                      <p className='text-sm text-green-600'>{formatCurrency(coin.unrealizedPnlUsd || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>Chưa có dữ liệu tăng</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giảm mạnh nhất</CardTitle>
          </CardHeader>
          <CardContent>
            {currentSummary && currentSummary.topLosers && currentSummary.topLosers.length > 0 ? (
              <div className='space-y-3'>
                {currentSummary.topLosers.map((coin) => (
                  <div key={coin.symbol} className='flex items-center justify-between p-3 bg-red-50 rounded-lg'>
                    <div>
                      <p className='font-medium text-gray-900'>{coin.symbol}</p>
                      <p className='text-sm text-gray-600'>
                        {coin.quantity} • {formatCurrency(coin.valueUsd || 0)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-medium text-red-600'>{(coin.change24hPercent || 0).toFixed(2)}%</p>
                      <p className='text-sm text-red-600'>{formatCurrency(coin.unrealizedPnlUsd || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>Chưa có dữ liệu giảm</p>
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
                Top tăng giá thị trường
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {trend.gainers && trend.gainers.length > 0 ? (
                  trend.gainers.slice(0, 5).map((coin) => (
                    <div key={coin.symbol} className='flex items-center justify-between p-2'>
                      <span className='font-medium'>{coin.symbol}</span>
                      <span className='text-green-600 font-medium'>+{(coin.change24h || 0).toFixed(2)}%</span>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-500 text-center py-4'>Không có dữ liệu</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingDown className='text-red-600' size={20} />
                Top giảm giá thị trường
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {trend.losers && trend.losers.length > 0 ? (
                  trend.losers.slice(0, 5).map((coin) => (
                    <div key={coin.symbol} className='flex items-center justify-between p-2'>
                      <span className='font-medium'>{coin.symbol}</span>
                      <span className='text-red-600 font-medium'>{(coin.change24h || 0).toFixed(2)}%</span>
                    </div>
                  ))
                ) : (
                  <p className='text-gray-500 text-center py-4'>Không có dữ liệu</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
