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
import { useState } from 'react';
import { Trash2, RefreshCw, Shield, Eye } from 'lucide-react';

const statusLabel: Record<'PENDING' | 'ACTIVE' | 'BANNED', string> = {
  PENDING: 'Chưa xác thực',
  ACTIVE: 'Hoạt động',
  BANNED: 'Đã khóa',
};

const roleLabel: Record<'USER' | 'ADMIN', string> = {
  USER: 'User',
  ADMIN: 'Admin',
};

export default function Admin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const { data: usersData, isLoading } = useAdminUsers(page, 10, search);
  const { data: detailUser, isLoading: detailLoading } = useAdminUserDetail(detailUserId ?? undefined);
  const { mutate: updateUser } = useAdminUpdateUser();
  const { mutate: deleteUser } = useAdminDeleteUser();
  const { mutate: resetPassword } = useAdminResetPassword();
  const { mutate: updateStatus } = useAdminUpdateStatus();

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
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          {usersData && usersData.data && usersData.data.length > 0 ? (
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
                    {usersData.data.map((user) => (
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
                              onClick={() => resetPassword(user.id)}
                              className='p-1.5 hover:bg-blue-50 rounded transition-colors'
                              title='Đặt lại mật khẩu'
                            >
                              <RefreshCw size={16} className='text-blue-600' />
                            </button>
                            <button
                              type='button'
                              onClick={() => {
                                if (window.confirm('Xóa mềm người dùng này?')) {
                                  deleteUser(user.id);
                                }
                              }}
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
                  Hiển thị {((page - 1) * 10) + 1}–{Math.min(page * 10, usersData.pagination.total)} /{' '}
                  {usersData.pagination.total} người dùng
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
              <p>Không tìm thấy người dùng</p>
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
    </div>
  );
}
