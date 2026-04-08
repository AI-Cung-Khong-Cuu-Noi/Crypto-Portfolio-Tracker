import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useRef, useState } from 'react';
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '../../hooks/useNotification';

export default function Header() {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { data: notificationsData } = useNotifications(1, 5);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const notifications = notificationsData?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showNotifications) return;
      if (!dropdownRef.current) return;
      const target = event.target as Node;
      if (!dropdownRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  return (
    <div className='h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6'>
      <div className='flex-1' />

      <div ref={dropdownRef} className='flex items-center gap-4 relative'>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className='relative p-2 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <Bell size={20} className='text-gray-600' />
          {unreadCount > 0 && <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full' />}
        </button>

        {showNotifications && (
          <div className='absolute right-0 top-12 w-96 rounded-xl border border-gray-200 bg-white shadow-lg z-50'>
            <div className='px-4 py-3 border-b border-gray-100 flex items-center justify-between'>
              <p className='text-sm font-semibold text-gray-900'>Notifications</p>
              <div className='flex items-center gap-3'>
                {unreadCount > 0 && (
                  <span className='text-xs text-blue-600 font-medium'>{unreadCount} unread</span>
                )}
                <button
                  className='text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400'
                  disabled={unreadCount === 0 || isMarkingAll}
                  onClick={() => markAllAsRead()}
                >
                  {isMarkingAll ? 'Đang đọc...' : 'Đọc tất cả'}
                </button>
              </div>
            </div>
            <div className='max-h-80 overflow-y-auto'>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                      notification.isRead ? 'bg-white' : 'bg-blue-50'
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <p className='text-sm font-medium text-gray-900'>{notification.title}</p>
                    <p className='text-xs text-gray-600 mt-1 line-clamp-2'>{notification.message}</p>
                    <p className='text-xs text-gray-400 mt-1'>
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))
              ) : (
                <p className='px-4 py-6 text-sm text-gray-500 text-center'>No notifications</p>
              )}
            </div>
          </div>
        )}

        {user?.avatar && !avatarError ? (
          <img
            src={user.avatar}
            alt={user.name}
            className='h-8 w-8 rounded-full object-cover border border-gray-200'
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className='h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
            {user?.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className='flex flex-col'>
          <p className='text-sm font-medium text-gray-900'>{user?.name}</p>
        </div>
      </div>
    </div>
  );
}
