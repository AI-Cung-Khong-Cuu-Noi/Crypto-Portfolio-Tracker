import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from '../hooks/useAlert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const alertSchema = z.object({
  symbol: z.string().min(1, 'Vui lòng nhập mã coin'),
  type: z.enum(['PRICE_ABOVE', 'PRICE_BELOW', 'CHANGE_ABOVE', 'CHANGE_BELOW']),
  threshold: z.coerce.number(),
});

type AlertForm = z.infer<typeof alertSchema>;

export default function Alerts() {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingAlertId, setDeletingAlertId] = useState<string | null>(null);
  const { data: alerts, isLoading } = useAlerts();
  const { mutate: createAlert, isPending: isCreating } = useCreateAlert();
  const { mutate: updateAlert, isPending: isUpdating } = useUpdateAlert();
  const { mutate: deleteAlert, isPending: isDeleting } = useDeleteAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
  });

  const onSubmit = (data: AlertForm) => {
    createAlert(data, {
      onSuccess: () => {
        reset();
        setIsOpen(false);
      },
    });
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Đang tải cảnh báo...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>Cảnh báo</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus size={20} />
              Tạo cảnh báo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo cảnh báo giá</DialogTitle>
              <DialogDescription>Nhận thông báo khi giá hoặc biến động đạt ngưỡng bạn đặt</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
                <Label htmlFor='type'>Loại cảnh báo</Label>
                <select
                  id='type'
                  {...register('type')}
                  className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg'
                >
                  <option value='PRICE_ABOVE'>Giá vượt ngưỡng</option>
                  <option value='PRICE_BELOW'>Giá dưới ngưỡng</option>
                  <option value='CHANGE_ABOVE'>Biến động % vượt ngưỡng</option>
                  <option value='CHANGE_BELOW'>Biến động % dưới ngưỡng</option>
                </select>
              </div>

              <div>
                <Label htmlFor='threshold'>Ngưỡng</Label>
                <Input
                  id='threshold'
                  type='number'
                  step='0.01'
                  placeholder='50000'
                  {...register('threshold')}
                  className='mt-1'
                />
                {errors.threshold && <p className='text-red-600 text-sm mt-1'>{errors.threshold.message}</p>}
              </div>

              <Button type='submit' className='w-full' disabled={isCreating}>
                Tạo cảnh báo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cảnh báo của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts && alerts.length > 0 ? (
            <div className='space-y-3'>
              {alerts.map((alert) => (
                <div key={alert.id} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='font-semibold text-gray-900'>{alert.symbol}</h3>
                    </div>
                    <p className='text-sm text-gray-600'>
                      {alert.type === 'PRICE_ABOVE' && `Thông báo khi giá trên $${alert.threshold}`}
                      {alert.type === 'PRICE_BELOW' && `Thông báo khi giá dưới $${alert.threshold}`}
                      {alert.type === 'CHANGE_ABOVE' && `Thông báo khi biến động 24h trên ${alert.threshold}%`}
                      {alert.type === 'CHANGE_BELOW' && `Thông báo khi biến động 24h dưới ${alert.threshold}%`}
                    </p>
                    {alert.triggeredAt && (
                      <p className='text-xs text-blue-600 mt-1'>
                        Lần kích hoạt gần nhất: {new Date(alert.triggeredAt).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>

                  <div className='flex flex-wrap items-center justify-end gap-3'>
                    <button
                      type='button'
                      role='switch'
                      aria-checked={alert.isActive}
                      aria-label={alert.isActive ? 'Tắt cảnh báo' : 'Bật cảnh báo'}
                      disabled={isUpdating}
                      onClick={() =>
                        updateAlert({
                          id: alert.id,
                          data: { isActive: !alert.isActive },
                        })
                      }
                      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full p-1 shadow-inner transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        alert.isActive
                          ? 'bg-emerald-500 focus-visible:ring-emerald-500'
                          : 'bg-red-500 focus-visible:ring-red-500'
                      }`}
                    >
                      <span
                        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out ${
                          alert.isActive ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <Button
                      type='button'
                      size='icon'
                      variant='ghost'
                      className='text-red-600 hover:text-red-700 hover:bg-red-50'
                      onClick={() => setDeletingAlertId(alert.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-gray-500 mb-4'>Chưa có cảnh báo</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className='flex items-center gap-2 mx-auto'>
                    <Plus size={20} />
                    Tạo cảnh báo
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!deletingAlertId} onOpenChange={(open) => !open && setDeletingAlertId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa cảnh báo?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa cảnh báo này không?
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeletingAlertId(null)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button
              variant='destructive'
              disabled={!deletingAlertId || isDeleting}
              onClick={() => {
                if (!deletingAlertId) return;
                deleteAlert(deletingAlertId, {
                  onSuccess: () => setDeletingAlertId(null),
                });
              }}
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
