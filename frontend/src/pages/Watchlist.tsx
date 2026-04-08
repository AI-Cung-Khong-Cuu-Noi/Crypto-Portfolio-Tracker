import { useWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from '../hooks/useWatchlist';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency, getColorClass } from '../utils/format';
import { useState } from 'react';

export default function Watchlist() {
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: watchlist, isLoading } = useWatchlist();
  const { mutate: addToWatchlist, isPending: isAdding } = useAddToWatchlist();
  const { mutate: removeFromWatchlist, isPending: isRemoving } = useRemoveFromWatchlist();

  const handleAdd = () => {
    if (symbol.trim()) {
      addToWatchlist(symbol.toUpperCase(), {
        onSuccess: () => {
          setSymbol('');
          setIsOpen(false);
        },
      });
    }
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Đang tải danh sách theo dõi...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>Danh sách theo dõi</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus size={20} />
              Thêm coin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm vào danh sách theo dõi</DialogTitle>
              <DialogDescription>Nhập mã coin bạn muốn theo dõi</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <Input
                placeholder='BTC, ETH, SOL...'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} className='w-full' disabled={isAdding || !symbol.trim()}>
                Thêm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách coin</CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist && watchlist.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-semibold text-gray-900'>Mã</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Giá</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Biến động 24h</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Vốn hóa</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((coin) => (
                    <tr key={coin.id} className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='py-3 px-4 font-medium text-gray-900'>{coin.symbol}</td>
                      <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(coin.price)}</td>
                      <td className={`text-right py-3 px-4 font-semibold ${getColorClass(coin.change24h)}`}>
                        {coin.change24h.toFixed(2)}%
                      </td>
                      <td className='text-right py-3 px-4 text-gray-600'>
                        {coin.marketCap ? formatCurrency(coin.marketCap) : 'Không có'}
                      </td>
                      <td className='text-right py-3 px-4'>
                        <button
                          onClick={() => setDeletingId(coin.id)}
                          disabled={isRemoving}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-gray-500 mb-4'>Chưa có coin trong danh sách theo dõi</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className='flex items-center gap-2 mx-auto'>
                    <Plus size={20} />
                    Thêm coin
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa khỏi danh sách theo dõi?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa coin này khỏi danh sách theo dõi không?
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeletingId(null)} disabled={isRemoving}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              disabled={!deletingId || isRemoving}
              onClick={() => {
                if (!deletingId) return;
                removeFromWatchlist(deletingId, {
                  onSuccess: () => setDeletingId(null),
                });
              }}
            >
              {isRemoving ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
