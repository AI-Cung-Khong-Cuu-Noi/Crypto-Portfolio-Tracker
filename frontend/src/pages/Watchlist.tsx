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
    return <div className='p-6 text-center'>Loading watchlist...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>Watchlist</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus size={20} />
              Add Coin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Watchlist</DialogTitle>
              <DialogDescription>Enter the symbol of the crypto you want to watch</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <Input
                placeholder='BTC, ETH, SOL...'
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd} className='w-full' disabled={isAdding || !symbol.trim()}>
                Add to Watchlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coins</CardTitle>
        </CardHeader>
        <CardContent>
          {watchlist && watchlist.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-3 px-4 font-semibold text-gray-900'>Symbol</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Price</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>24h Change</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Market Cap</th>
                    <th className='text-right py-3 px-4 font-semibold text-gray-900'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((coin) => (
                    <tr key={coin.id} className='border-b border-gray-100 hover:bg-gray-50'>
                      <td className='py-3 px-4 font-medium text-gray-900'>{coin.symbol}</td>
                      <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(coin.price)}</td>
                      <td className={`text-right py-3 px-4 font-semibold ${getColorClass(coin.change24h)}`}>
                        {(coin.change24h * 100).toFixed(2)}%
                      </td>
                      <td className='text-right py-3 px-4 text-gray-600'>
                        {coin.marketCap ? formatCurrency(coin.marketCap) : 'N/A'}
                      </td>
                      <td className='text-right py-3 px-4'>
                        <button
                          onClick={() => removeFromWatchlist(coin.id)}
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
              <p className='text-gray-500 mb-4'>No coins in watchlist yet</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className='flex items-center gap-2 mx-auto'>
                    <Plus size={20} />
                    Add Coin
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
