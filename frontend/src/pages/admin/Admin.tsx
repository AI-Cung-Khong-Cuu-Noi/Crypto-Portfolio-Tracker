import { useAdminUsers, useAdminUpdateUser, useAdminDeleteUser, useAdminResetPassword, useAdminUpdateStatus } from '../../hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useState } from 'react';
import { Trash2, RefreshCw, Shield } from 'lucide-react';

export default function Admin() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: usersData, isLoading } = useAdminUsers(page, 10, search);
  const { mutate: updateUser } = useAdminUpdateUser();
  const { mutate: deleteUser } = useAdminDeleteUser();
  const { mutate: resetPassword } = useAdminResetPassword();
  const { mutate: updateStatus } = useAdminUpdateStatus();

  if (isLoading) {
    return <div className='p-6 text-center'>Loading users...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder='Search by name or email...'
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
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {usersData && usersData.data && usersData.data.length > 0 ? (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Name</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Email</th>
                      <th className='text-center py-3 px-4 font-semibold text-gray-900'>Role</th>
                      <th className='text-center py-3 px-4 font-semibold text-gray-900'>Status</th>
                      <th className='text-left py-3 px-4 font-semibold text-gray-900'>Created</th>
                      <th className='text-center py-3 px-4 font-semibold text-gray-900'>Actions</th>
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
                            className='px-2 py-1 border border-gray-300 rounded text-sm'
                          >
                            <option value='USER'>USER</option>
                            <option value='ADMIN'>ADMIN</option>
                          </select>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <select
                            value={user.status}
                            onChange={(e) =>
                              updateStatus({
                                id: user.id,
                                status: e.target.value as 'ACTIVE' | 'INACTIVE',
                              })
                            }
                            className={`px-2 py-1 border border-gray-300 rounded text-sm ${
                              user.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <option value='ACTIVE'>ACTIVE</option>
                            <option value='INACTIVE'>INACTIVE</option>
                          </select>
                        </td>
                        <td className='py-3 px-4 text-gray-600'>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              onClick={() => resetPassword(user.id)}
                              className='p-1 hover:bg-blue-50 rounded transition-colors'
                              title='Reset Password'
                            >
                              <RefreshCw size={16} className='text-blue-600' />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className='p-1 hover:bg-red-50 rounded transition-colors'
                              title='Delete User'
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
                  Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, usersData.pagination.total)} of {usersData.pagination.total} users
                </p>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    disabled={page >= Math.ceil(usersData.pagination.total / 10)}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className='text-center py-12 text-gray-500'>
              <Shield size={48} className='mx-auto mb-4 opacity-50' />
              <p>No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
