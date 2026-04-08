import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotification';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export default function Notifications() {
  const [page, setPage] = useState(1);
  const { data: notificationsData, isLoading } = useNotifications(page, 10);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  if (isLoading) {
    return <div className='p-6 text-center'>Đang tải thông báo...</div>;
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-gray-900'>Thông báo</h1>
        <Button
          onClick={() => markAllAsRead()}
          disabled={isMarkingAll}
          variant='outline'
        >
          Đánh dấu đã đọc tất cả
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trung tâm thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsData && notificationsData.data && notificationsData.data.length > 0 ? (
            <>
              <div className='space-y-2'>
                {notificationsData.data.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      notification.isRead
                        ? 'bg-white border-gray-200 hover:bg-gray-50'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-semibold text-gray-900'>{notification.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            notification.type === 'ALERT'
                              ? 'bg-red-100 text-red-700'
                              : notification.type === 'TRANSACTION'
                              ? 'bg-green-100 text-green-700'
                              : notification.type === 'PORTFOLIO'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {notification.type === 'ALERT'
                              ? 'Cảnh báo'
                              : notification.type === 'TRANSACTION'
                                ? 'Giao dịch'
                                : notification.type === 'PORTFOLIO'
                                  ? 'Danh mục'
                                  : 'Hệ thống'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mt-1'>{notification.message}</p>
                        <p className='text-xs text-gray-500 mt-2'>
                          {new Date(notification.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className='ml-4 w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2' />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {notificationsData.pagination.total > 10 && (
                <div className='mt-6 flex items-center justify-between'>
                  <p className='text-sm text-gray-600'>
                    Hiển thị {((page - 1) * 10) + 1}–{Math.min(page * 10, notificationsData.pagination.total)} / {notificationsData.pagination.total} thông báo
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Trước
                    </Button>
                    <Button
                      variant='outline'
                      disabled={page >= Math.ceil(notificationsData.pagination.total / 10)}
                      onClick={() => setPage(page + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-12'>
              <Bell size={48} className='mx-auto mb-4 text-gray-300' />
              <p className='text-gray-500'>Chưa có thông báo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
