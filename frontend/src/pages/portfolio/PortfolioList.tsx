import { usePortfolios, useCreatePortfolio, useDeletePortfolio } from '../../hooks/usePortfolio';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/Dialog';
import { Trash2, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required'),
  description: z.string().optional(),
});

type CreatePortfolioForm = z.infer<typeof createPortfolioSchema>;

export default function PortfolioList() {
  const [isOpen, setIsOpen] = useState(false);
  const [deletePortfolioId, setDeletePortfolioId] = useState<string | null>(null);
  const { data: portfolios, isLoading } = usePortfolios();
  const { mutate: createPortfolio, isPending: isCreating } = useCreatePortfolio();
  const { mutate: deletePortfolio, isPending: isDeleting } = useDeletePortfolio();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePortfolioForm>({
    resolver: zodResolver(createPortfolioSchema),
  });

  const onSubmit = (data: CreatePortfolioForm) => {
    createPortfolio(data, {
      onSuccess: () => {
        reset();
        setIsOpen(false);
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deletePortfolioId) return;
    deletePortfolio(deletePortfolioId, {
      onSuccess: () => setDeletePortfolioId(null),
    });
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Loading portfolios...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>Portfolios</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className='flex items-center gap-2'>
              <Plus size={20} />
              New Portfolio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Portfolio</DialogTitle>
              <DialogDescription>Add a new portfolio to start tracking your crypto holdings</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div>
                <Label htmlFor='name'>Portfolio Name</Label>
                <Input
                  id='name'
                  placeholder='My Portfolio'
                  {...register('name')}
                  className='mt-1'
                />
                {errors.name && <p className='text-red-600 text-sm mt-1'>{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor='description'>Description (optional)</Label>
                <Input
                  id='description'
                  placeholder='Short description'
                  {...register('description')}
                  className='mt-1'
                />
              </div>

              <Button type='submit' className='w-full' disabled={isCreating}>
                Create Portfolio
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {portfolios && portfolios.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className='hover:shadow-lg transition-shadow'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h3 className='font-semibold text-gray-900'>{portfolio.name}</h3>
                    {portfolio.description && (
                      <p className='text-sm text-gray-500 mt-1'>{portfolio.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeletePortfolioId(portfolio.id)}
                    disabled={isDeleting}
                    className='p-2 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <Trash2 size={18} className='text-red-600' />
                  </button>
                </div>

                <p className='text-xs text-gray-500 mb-4'>
                  Created {new Date(portfolio.createdAt).toLocaleDateString()}
                </p>

                <Link to={`/portfolios/${portfolio.id}`}>
                  <Button variant='outline' className='w-full flex items-center justify-center gap-2'>
                    <Eye size={18} />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='p-12 text-center'>
            <p className='text-gray-500 mb-4'>No portfolios yet. Create one to get started!</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className='flex items-center gap-2 mx-auto'>
                  <Plus size={20} />
                  Create Portfolio
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!deletePortfolioId} onOpenChange={(open) => !open && setDeletePortfolioId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Portfolio?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa portfolio này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeletePortfolioId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
