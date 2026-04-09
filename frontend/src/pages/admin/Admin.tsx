import {
  useAdminUsers,
  useAdminUserDetail,
  useAdminUpdateUser,
  useAdminDeleteUser,
  useAdminResetPassword,
  useAdminUpdateStatus,
} from '../../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Label } from '../../components/ui/Label';
import { useMemo, useState } from 'react';
import { Trash2, RefreshCw, Shield, Eye, Pencil } from 'lucide-react';
import type { User } from '../../types';

const statusLabel: Record<'PENDING' | 'ACTIVE' | 'BANNED', string> = {
  PENDING: 'Chưa xác thực',
  ACTIVE: 'Hoạt động',
  BANNED: 'Đã khóa',
};

const roleLabel: Record<'USER' | 'ADMIN', string> = {
  USER: 'User',
  ADMIN: 'Admin',
};

type EditDraft = Pick<User, 'id' | 'name' | 'email' | 'role'>;
type DeleteTarget = Pick<User, 'id' | 'name' | 'email'>;

export default function Admin() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const { data: usersData, isLoading } = useAdminUsers(page, 10);
  const { data: detailUser, isLoading: detailLoading } = useAdminUserDetail(detailUserId ?? undefined);
  const { mutate: updateUser, isPending: isSavingUser } = useAdminUpdateUser();
  const { mutate: deleteUser, isPending: isDeletingUser } = useAdminDeleteUser();
  const { mutate: resetPassword } = useAdminResetPassword();
  const { mutate: updateStatus } = useAdminUpdateStatus();
  const filteredUsers = useMemo(() => {
    const keyword = searchInput.trim().toLowerCase();
    const users = usersData?.data ?? [];
    if (!keyword) return users;
    return users.filter(
      (user) => user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword)
    );
  }, [searchInput, usersData?.data]);

  const openEdit = (user: Pick<User, 'id' | 'name' | 'email' | 'role'>) => {
    setEditDraft({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    const name = editDraft.name.trim();
    const email = editDraft.email.trim();
    if (!name || !email) return;
    updateUser(
      {
        id: editDraft.id,
        data: { name, email, role: editDraft.role },
      },
      { onSuccess: () => setEditDraft(null) }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  if (isLoading) {
    return <div className='p-6 text-center'>Đang tải danh sách người dùng...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Quản lý người dùng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder='Tìm theo tên hoặc email...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {usersData && usersData.data && filteredUsers.length > 0 ? (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Họ tên</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Email</th>
                      <th className='text-center py-3 px-4 font-semibold text-gray-900'>Vai trò</th>
                      <th className='text-center py-3 px-4 font-semibold text-gray-900'>Trạng thái</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Ngày tạo</th>
                      <th className='text-center py-3 px-4 font-semibold text-gray-900'>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className='border-b border-gray-100 hover:bg-gray-50'>
                        <td className='py-3 px-4 font-medium text-gray-900'>{user.name}</td>
                        <td className='py-3 px-4 text-gray-600'>{user.email}</td>
                        <td className='py-3 px-4 text-center'>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateUser({
                                id: user.id,
                                data: {
                                  name: user.name,
                                  email: user.email,
                                  role: e.target.value as 'USER' | 'ADMIN',
                                },
                              })
                            }
                            className='px-2 py-1 border border-gray-300 rounded text-sm max-w-[140px]'
                          >
                            <option value='USER'>{roleLabel.USER}</option>
                            <option value='ADMIN'>{roleLabel.ADMIN}</option>
                          </select>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <select
                            value={user.status}
                            onChange={(e) =>
                              updateStatus({
                                id: user.id,
                                status: e.target.value as 'PENDING' | 'ACTIVE' | 'BANNED',
                              })
                            }
                            className={`px-2 py-1 border border-gray-300 rounded text-sm max-w-[160px] ${
                              user.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-800'
                                : user.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-red-50 text-red-800'
                            }`}
                          >
                            <option value='PENDING'>{statusLabel.PENDING}</option>
                            <option value='ACTIVE'>{statusLabel.ACTIVE}</option>
                            <option value='BANNED'>{statusLabel.BANNED}</option>
                          </select>
                        </td>
                        <td className='py-3 px-4 text-gray-600'>
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <div className='flex items-center justify-center gap-1'>
                            <button
                              type='button'
                              onClick={() => setDetailUserId(user.id)}
                              className='p-1.5 hover:bg-gray-100 rounded transition-colors'
                              title='Xem chi tiết'
                            >
                              <Eye size={16} className='text-gray-700' />
                            </button>
                            <button
                              type='button'
                              onClick={() => openEdit(user)}
                              className='p-1.5 hover:bg-amber-50 rounded transition-colors'
                              title='Chỉnh sửa họ tên / email'
                            >
                              <Pencil size={16} className='text-amber-700' />
                            </button>
                            <button
                              type='button'
                              onClick={() => resetPassword(user.id)}
                              className='p-1.5 hover:bg-blue-50 rounded transition-colors'
                              title='Đặt lại mật khẩu'
                            >
                              <RefreshCw size={16} className='text-blue-600' />
                            </button>
                            <button
                              type='button'
                              onClick={() => setDeleteTarget({ id: user.id, name: user.name, email: user.email })}
                              className='p-1.5 hover:bg-red-50 rounded transition-colors'
                              title='Xóa mềm'
                            >
                              <Trash2 size={16} className='text-red-600' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className='mt-6 flex items-center justify-between'>
                <p className='text-sm text-gray-600'>
                  Hiển thị {filteredUsers.length} / {usersData.data.length} người dùng trong trang này
                </p>
                <div className='flex gap-2'>
                  <Button variant='outline' disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Trước
                  </Button>
                  <Button
                    variant='outline'
                    disabled={page >= Math.ceil(usersData.pagination.total / 10)}
                    onClick={() => setPage(page + 1)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='text-center py-12 text-gray-500'>
              <Shield size={48} className='mx-auto mb-4 opacity-50' />
              <p>{searchInput.trim() ? 'Không có kết quả phù hợp' : 'Không tìm thấy người dùng'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailUserId} onOpenChange={(open) => !open && setDetailUserId(null)}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <p className='text-sm text-gray-500 py-4'>Đang tải...</p>
          ) : detailUser ? (
            <div className='space-y-3 text-sm'>
              <div className='flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    openEdit(detailUser);
                    setDetailUserId(null);
                  }}
                >
                  Chỉnh sửa
                </Button>
              </div>
              <div>
                <span className='text-gray-500'>Họ tên:</span>{' '}
                <span className='font-medium text-gray-900'>{detailUser.name}</span>
              </div>
              <div>
                <span className='text-gray-500'>Email:</span>{' '}
                <span className='font-medium text-gray-900'>{detailUser.email}</span>
              </div>
              <div>
                <span className='text-gray-500'>Vai trò:</span>{' '}
                <span className='font-medium text-gray-900'>{roleLabel[detailUser.role]}</span>
              </div>
              <div>
                <span className='text-gray-500'>Trạng thái:</span>{' '}
                <span className='font-medium text-gray-900'>{statusLabel[detailUser.status]}</span>
              </div>
              <div>
                <span className='text-gray-500'>Ngày tạo:</span>{' '}
                <span className='text-gray-900'>
                  {new Date(detailUser.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div>
                <span className='text-gray-500'>Cập nhật lần cuối:</span>{' '}
                <span className='text-gray-900'>
                  {new Date(detailUser.updatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          ) : (
            <p className='text-sm text-red-600'>Không tải được chi tiết.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDraft} onOpenChange={(open) => !open && setEditDraft(null)}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          </DialogHeader>
          {editDraft ? (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='admin-edit-name'>Họ tên</Label>
                <Input
                  id='admin-edit-name'
                  value={editDraft.name}
                  onChange={(e) => setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                  autoComplete='name'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='admin-edit-email'>Email</Label>
                <Input
                  id='admin-edit-email'
                  type='email'
                  value={editDraft.email}
                  onChange={(e) => setEditDraft((d) => (d ? { ...d, email: e.target.value } : d))}
                  autoComplete='email'
                />
              </div>
              <div className='flex justify-end gap-2 pt-2'>
                <Button type='button' variant='outline' onClick={() => setEditDraft(null)} disabled={isSavingUser}>
                  Hủy
                </Button>
                <Button
                  type='button'
                  onClick={saveEdit}
                  disabled={isSavingUser || !editDraft.name.trim() || !editDraft.email.trim()}
                >
                  {isSavingUser ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
          </DialogHeader>
          {deleteTarget ? (
            <div className='space-y-4'>
              <p className='text-sm text-gray-700'>
                Bạn có chắc chắn muốn xóa mềm người dùng <span className='font-semibold'>{deleteTarget.name}</span> (
                {deleteTarget.email})?
              </p>
              <p className='text-xs text-gray-500'>
                Người dùng sẽ bị chuyển trạng thái khóa và không còn hiển thị trong danh sách mặc định.
              </p>
              <div className='flex justify-end gap-2 pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeletingUser}
                >
                  Hủy
                </Button>
                <Button type='button' variant='destructive' onClick={confirmDelete} disabled={isDeletingUser}>
                  {isDeletingUser ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
