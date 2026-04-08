import { useParams, useNavigate } from 'react-router-dom';
import { usePortfolioDetail, usePortfolioHoldings, useUpdatePortfolio, useDeletePortfolio } from '../../hooks/usePortfolio';
import { useTransactions, useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '../../hooks/useTransaction';
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
import { useState, type FormEvent } from 'react';
import type { Transaction } from '../../types';

const transactionSchema = z.object({
  symbol: z.string().min(1, 'Vui lòng nhập mã coin'),
  type: z.enum(['BUY', 'SELL', 'TRANSFER']),
  quantity: z.coerce.number().positive('Số lượng phải lớn hơn 0'),
  price: z.coerce.number().positive('Giá phải lớn hơn 0'),
  fee: z.coerce.number().optional(),
  date: z.string(),
  notes: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

function transactionTypeLabel(type: string) {
  switch (type) {
    case 'BUY':
      return 'Mua';
    case 'SELL':
      return 'Bán';
    case 'TRANSFER':
      return 'Chuyển';
    default:
      return type;
  }
}

export default function PortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolioDetail(id);
  const { data: holdingsData, isLoading: holdingsLoading } = usePortfolioHoldings(id);
  const holdings = holdingsData?.holdings;
  const holdingsSummary = holdingsData?.summary;
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(1, 10, id);
  const { mutate: updatePortfolio, isPending: isUpdating } = useUpdatePortfolio();
  const { mutate: deletePortfolio, isPending: isDeleting } = useDeletePortfolio();
  const { mutate: createTransaction, isPending: isCreatingTx } = useCreateTransaction();
  const { mutate: deleteTransaction, isPending: isDeletingTx } = useDeleteTransaction();
  const { mutate: updateTransaction, isPending: isUpdatingTx } = useUpdateTransaction();

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

  const onSubmitUpdateTransaction = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTx) return;

    const formData = new FormData(e.currentTarget);
    const feeRaw = formData.get('fee') as string;

    updateTransaction(
      {
        id: editingTx.id,
        data: {
          symbol: (formData.get('symbol') as string).toUpperCase(),
          type: formData.get('type') as 'BUY' | 'SELL' | 'TRANSFER',
          quantity: Number(formData.get('quantity')),
          price: Number(formData.get('price')),
          fee: feeRaw ? Number(feeRaw) : undefined,
          date: formData.get('date') as string,
          notes: (formData.get('notes') as string) || '',
        },
      },
      {
        onSuccess: () => setEditingTx(null),
      }
    );
  };

  if (portfolioLoading) {
    return <div className='p-6 text-center'>Đang tải danh mục...</div>;
  }

  if (!portfolio) {
    return <div className='p-6 text-center'>Không tìm thấy danh mục</div>;
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
                Sửa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
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
                  <Label htmlFor='edit-name'>Tên danh mục</Label>
                  <Input
                    id='edit-name'
                    name='name'
                    defaultValue={portfolio.name}
                    className='mt-1'
                  />
                </div>
                <div>
                  <Label htmlFor='edit-description'>Mô tả</Label>
                  <Input
                    id='edit-description'
                    name='description'
                    defaultValue={portfolio.description || ''}
                    className='mt-1'
                  />
                </div>
                <Button type='submit' className='w-full' disabled={isUpdating}>
                  Lưu thay đổi
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant='destructive' className='flex items-center gap-2'>
                <Trash2 size={18} />
                Xóa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xóa danh mục?</DialogTitle>
              </DialogHeader>
              <p className='text-sm text-gray-500'>
                Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.
              </p>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
                  Hủy
                </Button>
                <Button variant='destructive' onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-500'>Tổng giá trị</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {formatCurrency(holdingsSummary?.totalMarketValueUsd ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-500'>Tổng giá vốn</p>
            <p className='text-2xl font-bold text-gray-900 mt-1'>
              {formatCurrency(holdingsSummary?.totalCostBasisUsd ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-sm text-gray-500'>Lãi/lỗ chưa thực hiện</p>
            <p className={`text-2xl font-bold mt-1 ${getColorClass(holdingsSummary?.totalUnrealizedPnlUsd ?? 0)}`}>
              {formatCurrency(holdingsSummary?.totalUnrealizedPnlUsd ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='holdings' className='w-full'>
        <TabsList>
          <TabsTrigger value='holdings'>Tài sản</TabsTrigger>
          <TabsTrigger value='transactions'>Giao dịch</TabsTrigger>
        </TabsList>

        <TabsContent value='holdings'>
          <Card>
            <CardHeader>
              <CardTitle>Tài sản hiện tại</CardTitle>
            </CardHeader>
            <CardContent>
              {holdingsLoading ? (
                <div className='text-center py-8'>Đang tải tài sản...</div>
              ) : holdings && holdings.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Mã</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Số lượng</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Giá vốn TB</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Giá hiện tại</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Tổng giá trị</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Lãi/lỗ chưa thực hiện</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Biến động 24h</th>
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
                            {holding.change24h.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>Chưa có tài sản</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='transactions'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Giao dịch</CardTitle>
                <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button size='sm' className='flex items-center gap-2'>
                      <Plus size={18} />
                      Thêm giao dịch
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm giao dịch</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label htmlFor='symbol'>Mã coin</Label>
                          <Input
                            id='symbol'
                            placeholder='BTC'
                            {...register('symbol')}
                            className='mt-1'
                          />
                          {errors.symbol && <p className='text-red-600 text-sm mt-1'>{errors.symbol.message}</p>}
                        </div>
                        <div>
                          <Label htmlFor='type'>Loại</Label>
                          <select
                            id='type'
                            {...register('type')}
                            className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg'
                          >
                            <option value='BUY'>Mua</option>
                            <option value='SELL'>Bán</option>
                            <option value='TRANSFER'>Chuyển</option>
                          </select>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <Label htmlFor='quantity'>Số lượng</Label>
                          <Input
                            id='quantity'
                            type='number'
                            step='0.00000001'
                            {...register('quantity')}
                            className='mt-1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='price'>Giá</Label>
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
                          <Label htmlFor='fee'>Phí (tùy chọn)</Label>
                          <Input
                            id='fee'
                            type='number'
                            step='0.01'
                            {...register('fee')}
                            className='mt-1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='date'>Ngày</Label>
                          <Input
                            id='date'
                            type='date'
                            {...register('date')}
                            className='mt-1'
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor='notes'>Ghi chú (tùy chọn)</Label>
                        <Input
                          id='notes'
                          placeholder='Ghi chú thêm'
                          {...register('notes')}
                          className='mt-1'
                        />
                      </div>

                      <Button type='submit' className='w-full' disabled={isCreatingTx}>
                        Thêm giao dịch
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className='text-center py-8'>Đang tải giao dịch...</div>
              ) : transactions && transactions.data && transactions.data.length > 0 ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Mã</th>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Loại</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Số lượng</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Giá</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Tổng</th>
                        <th className='text-left py-3 px-4 font-semibold text-gray-900'>Ngày</th>
                        <th className='text-right py-3 px-4 font-semibold text-gray-900'>Thao tác</th>
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
                              {transactionTypeLabel(tx.type)}
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
                          <td className='py-3 px-4 text-gray-600'>{new Date(tx.date).toLocaleDateString('vi-VN')}</td>
                          <td className='text-right py-3 px-4'>
                            <div className='flex items-center justify-end gap-3'>
                              <Dialog open={editingTx?.id === tx.id} onOpenChange={(open) => !open && setEditingTx(null)}>
                                <DialogTrigger asChild>
                                  <button
                                    onClick={() => setEditingTx(tx)}
                                    className='text-blue-600 hover:text-blue-700'
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cập nhật giao dịch</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={onSubmitUpdateTransaction} className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                      <div>
                                        <Label htmlFor='edit-symbol'>Mã coin</Label>
                                        <Input id='edit-symbol' name='symbol' defaultValue={tx.symbol} className='mt-1' />
                                      </div>
                                      <div>
                                        <Label htmlFor='edit-type'>Loại</Label>
                                        <select
                                          id='edit-type'
                                          name='type'
                                          defaultValue={tx.type}
                                          className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg'
                                        >
                                          <option value='BUY'>Mua</option>
                                          <option value='SELL'>Bán</option>
                                          <option value='TRANSFER'>Chuyển</option>
                                        </select>
                                      </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                      <div>
                                        <Label htmlFor='edit-quantity'>Số lượng</Label>
                                        <Input
                                          id='edit-quantity'
                                          name='quantity'
                                          type='number'
                                          step='0.00000001'
                                          defaultValue={tx.quantity}
                                          className='mt-1'
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor='edit-price'>Giá</Label>
                                        <Input
                                          id='edit-price'
                                          name='price'
                                          type='number'
                                          step='0.01'
                                          defaultValue={tx.price}
                                          className='mt-1'
                                        />
                                      </div>
                                    </div>

                                    <div className='grid grid-cols-2 gap-4'>
                                      <div>
                                        <Label htmlFor='edit-fee'>Phí</Label>
                                        <Input
                                          id='edit-fee'
                                          name='fee'
                                          type='number'
                                          step='0.01'
                                          defaultValue={tx.fee ?? 0}
                                          className='mt-1'
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor='edit-date'>Ngày</Label>
                                        <Input
                                          id='edit-date'
                                          name='date'
                                          type='date'
                                          defaultValue={new Date(tx.date).toISOString().slice(0, 10)}
                                          className='mt-1'
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor='edit-notes'>Ghi chú</Label>
                                      <Input
                                        id='edit-notes'
                                        name='notes'
                                        defaultValue={tx.notes || ''}
                                        className='mt-1'
                                      />
                                    </div>

                                    <Button type='submit' className='w-full' disabled={isUpdatingTx}>
                                      {isUpdatingTx ? 'Đang cập nhật...' : 'Cập nhật giao dịch'}
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>

                              <button
                                onClick={() => setDeletingTx(tx)}
                                disabled={isDeletingTx}
                                className='text-red-600 hover:text-red-700'
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className='text-center py-8 text-gray-500'>Chưa có giao dịch</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!deletingTx} onOpenChange={(open) => !open && setDeletingTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa giao dịch?</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-gray-500'>
            Bạn có chắc chắn muốn xóa giao dịch
            {deletingTx ? ` ${deletingTx.symbol} (${transactionTypeLabel(deletingTx.type)})` : ''} không?
          </p>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeletingTx(null)} disabled={isDeletingTx}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              disabled={isDeletingTx || !deletingTx}
              onClick={() => {
                if (!deletingTx) return;
                deleteTransaction(deletingTx.id, {
                  onSuccess: () => setDeletingTx(null),
                });
              }}
            >
              {isDeletingTx ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
