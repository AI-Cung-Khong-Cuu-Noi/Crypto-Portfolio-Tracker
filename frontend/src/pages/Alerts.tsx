import { useAlerts, useCreateAlert, useUpdateAlert, useDeleteAlert } from '../hooks/useAlert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Trash2, CreditCard as Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const alertSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['PRICE_ABOVE', 'PRICE_BELOW', 'CHANGE_ABOVE', 'CHANGE_BELOW']),
  threshold: z.coerce.number(),
});

type AlertForm = z.infer<typeof alertSchema>;

export default function Alerts() {
  const [isOpen, setIsOpen] = useState(false);
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
    return <div className='p-6 text-center'>Loading alerts...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>Alerts</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus size={20} />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>Get notified when price or change reaches a threshold</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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
                <Label htmlFor='type'>Alert Type</Label>
                <select
                  id='type'
                  {...register('type')}
                  className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg'
                >
                  <option value='PRICE_ABOVE'>Price Above</option>
                  <option value='PRICE_BELOW'>Price Below</option>
                  <option value='CHANGE_ABOVE'>Change % Above</option>
                  <option value='CHANGE_BELOW'>Change % Below</option>
                </select>
              </div>

              <div>
                <Label htmlFor='threshold'>Threshold Value</Label>
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
                Create Alert
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts && alerts.length > 0 ? (
            <div className='space-y-3'>
              {alerts.map((alert) => (
                <div key={alert.id} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='font-semibold text-gray-900'>{alert.symbol}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        alert.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      {alert.type === 'PRICE_ABOVE' && `Notify when price above $${alert.threshold}`}
                      {alert.type === 'PRICE_BELOW' && `Notify when price below $${alert.threshold}`}
                      {alert.type === 'CHANGE_ABOVE' && `Notify when 24h change above ${alert.threshold}%`}
                      {alert.type === 'CHANGE_BELOW' && `Notify when 24h change below ${alert.threshold}%`}
                    </p>
                    {alert.triggeredAt && (
                      <p className='text-xs text-blue-600 mt-1'>
                        Last triggered: {new Date(alert.triggeredAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        updateAlert({
                          id: alert.id,
                          data: { isActive: !alert.isActive },
                        });
                      }}
                      disabled={isUpdating}
                      className='px-3 py-1 text-sm rounded-lg hover:bg-gray-100 transition-colors'
                    >
                      {alert.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      disabled={isDeleting}
                      className='p-2 hover:bg-red-50 rounded-lg transition-colors'
                    >
                      <Trash2 size={16} className='text-red-600' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <p className='text-gray-500 mb-4'>No alerts yet</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className='flex items-center gap-2 mx-auto'>
                    <Plus size={20} />
                    Create Alert
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
