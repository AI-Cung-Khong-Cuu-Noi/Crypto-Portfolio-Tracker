import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolioDetail, usePortfolioHoldings, useUpdatePortfolio, useDeletePortfolio } from '../../hooks/usePortfolio';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../../hooks/useTransaction';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { ArrowLeft, CreditCard as Edit2, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatCurrency, getColorClass } from '../../utils/format';
import { useState } from 'react';

const transactionSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['BUY', 'SELL', 'TRANSFER']),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  price: z.coerce.number().positive('Price must be positive'),
  fee: z.coerce.number().optional(),
  date: z.string(),
  notes: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioDetail(id);
  const { data: holdingsData, isLoading: holdingsLoading } = usePortfolioHoldings(id);
  const holdings = holdingsData?.holdings;
  const holdingsSummary = holdingsData?.summary;
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(1, 10, id);
  const { mutate: updatePortfolio, isPending: isUpdating } = useUpdatePortfolio();
  const { mutate: deletePortfolio, isPending: isDeleting } = useDeletePortfolio();
  const { mutate: createTransaction, isPending: isCreatingTx } = useCreateTransaction();
  const { mutate: deleteTransaction, isPending: isDeletingTx } = useDeleteTransaction();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleDelete = () => {
    if (!id) return;
    deletePortfolio(id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        navigate('/portfolios');
      },
    });
  };

  const onSubmit = (data: TransactionForm) => {
    if (!id) return;
    createTransaction(
      {
        ...data,
        portfolioId: id,
      },
      {
        onSuccess: () => {
          reset();
          setIsTransactionOpen(false);
        },
      }
    );
  };

  if (portfolioLoading) {
    return <div className='p-6 text-center'>Loading portfolio...</div>;
  }

  if (!portfolio) {
    return <div className='p-6 text-center'>Portfolio not found</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate('/portfolios')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} className='text-gray-600' />
          </button>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>{portfolio.name}</h1>
            {portfolio.description && (
              <p className='text-gray-600 mt-1'>{portfolio.description}</p>
            )}
          </div>
        </div>

        <div className='flex gap-2'>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant='outline' className='flex items-center gap-2'>
                <Edit2 size={18} />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Portfolio</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updatePortfolio({
                    id: portfolio.id,
                    data: {
                      name: (formData.get('name') as string) || portfolio.name,
                      description: (formData.get('description') as string) ?? '',
                    },
                  }, {
                    onSuccess: () => setIsEditOpen(false),
                  });
                }}
                className='space-y-4'
              >
                <div>
                  <Label htmlFor='edit-name'>Portfolio Name</Label>
                  <Input
                    id='edit-name'
                    name='name'
                    defaultValue={portfolio.name}
                    className='mt-1'
                  />
                </div>
                <div>
                  <Label htmlFor='edit-description'>Description</Label>
                  <Input
                    id='edit-description'
                    name='description'
                    defaultValue={portfolio.description || ''}
                    className='mt-1'
                  />
                </div>
                <Button type='submit' className='w-full' disabled={isUpdating}>
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant='destructive' className='flex items-center gap-2'>
                <Trash2 size={18} />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Portfolio?</DialogTitle>
              </DialogHeader>
              <p className='text-sm text-gray-500'>
                Bạn có chắc chắn muốn xóa portfolio này không? Hành động này không thể hoàn tác.
              </p>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-500'>Total Value</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {formatCurrency(holdingsSummary?.totalMarketValueUsd ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-500'>Total Cost</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {formatCurrency(holdingsSummary?.totalCostBasisUsd ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-500'>Unrealized P&L</p>
            <p className={`text-2xl font-bold mt-1 ${getColorClass(holdingsSummary?.totalUnrealizedPnlUsd ?? 0)}`}>
              {formatCurrency(holdingsSummary?.totalUnrealizedPnlUsd ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='holdings' className='w-full'>
        <TabsList>
          <TabsTrigger value='holdings'>Holdings</TabsTrigger>
          <TabsTrigger value='transactions'>Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value='holdings'>
          <Card>
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              {holdingsLoading ? (
                <div className='text-center py-8'>Loading holdings...</div>
              ) : holdings && holdings.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Symbol</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Quantity</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Avg Cost</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Current Price</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Total Value</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Unrealized P&L</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>24h Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding) => (
                        <tr key={holding.symbol} className='border-b border-gray-100 hover:bg-gray-50'>
                          <td className='py-3 px-4 font-medium text-gray-900'>{holding.symbol}</td>
                          <td className='text-right py-3 px-4 text-gray-600'>{holding.quantity.toFixed(4)}</td>
                          <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(holding.avgCost)}</td>
                          <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(holding.currentPrice)}</td>
                          <td className='text-right py-3 px-4 font-semibold text-gray-900'>{formatCurrency(holding.totalValue)}</td>
                          <td className={`text-right py-3 px-4 font-semibold ${getColorClass(holding.unrealizedPnL)}`}>
                            {formatCurrency(holding.unrealizedPnL)}
                          </td>
                          <td className={`text-right py-3 px-4 font-semibold ${getColorClass(holding.change24h)}`}>
                            {(holding.change24h * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>No holdings yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='transactions'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Transactions</CardTitle>
                <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button size='sm' className='flex items-center gap-2'>
                      <Plus size={18} />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Transaction</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label htmlFor='symbol'>Symbol</Label>
                          <Input
                            id='symbol'
                            placeholder='BTC'
                            {...register('symbol')}
                            className='mt-1'
                          />
                          {errors.symbol && <p className='text-red-600 text-sm mt-1'>{errors.symbol.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor='type'>Type</Label>
                          <select
                            id='type'
                            {...register('type')}
                            className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg'
                          >
                            <option value='BUY'>BUY</option>
                            <option value='SELL'>SELL</option>
                            <option value='TRANSFER'>TRANSFER</option>
                          </select>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label htmlFor='quantity'>Quantity</Label>
                          <Input
                            id='quantity'
                            type='number'
                            step='0.00000001'
                            {...register('quantity')}
                            className='mt-1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='price'>Price</Label>
                          <Input
                            id='price'
                            type='number'
                            step='0.01'
                            {...register('price')}
                            className='mt-1'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label htmlFor='fee'>Fee (optional)</Label>
                          <Input
                            id='fee'
                            type='number'
                            step='0.01'
                            {...register('fee')}
                            className='mt-1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='date'>Date</Label>
                          <Input
                            id='date'
                            type='date'
                            {...register('date')}
                            className='mt-1'
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor='notes'>Notes (optional)</Label>
                        <Input
                          id='notes'
                          placeholder='Additional notes'
                          {...register('notes')}
                          className='mt-1'
                        />
                      </div>

                      <Button type='submit' className='w-full' disabled={isCreatingTx}>
                        Add Transaction
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className='text-center py-8'>Loading transactions...</div>
              ) : transactions && transactions.data && transactions.data.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Symbol</th>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Type</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Quantity</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Price</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Total</th>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Date</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.data.map((tx) => (
                        <tr key={tx.id} className='border-b border-gray-100 hover:bg-gray-50'>
                          <td className='py-3 px-4 font-medium text-gray-900'>{tx.symbol}</td>
                          <td className='py-3 px-4'>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              tx.type === 'BUY'
                                ? 'bg-green-100 text-green-700'
                                : tx.type === 'SELL'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className='text-right py-3 px-4 text-gray-600'>{tx.quantity.toFixed(4)}</td>
                          <td className='text-right py-3 px-4 text-gray-600'>{formatCurrency(tx.price)}</td>
                          <td className='text-right py-3 px-4 font-semibold text-gray-900'>
                            {formatCurrency(
                              tx.totalValue != null
                                ? tx.totalValue
                                : tx.quantity * tx.price
                            )}
                          </td>
                          <td className='py-3 px-4 text-gray-600'>{new Date(tx.date).toLocaleDateString()}</td>
                          <td className='text-right py-3 px-4'>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              disabled={isDeletingTx}
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
                <div className='text-center py-8 text-gray-500'>No transactions yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
