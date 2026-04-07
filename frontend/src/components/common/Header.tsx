import { Bell, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className='h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6'>
      <div className='flex-1' />

      <div className='flex items-center gap-4'>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className='relative p-2 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <Bell size={20} className='text-gray-600' />
          <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full' />
        </button>

        <div className='h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold'>
          {user?.name.charAt(0).toUpperCase()}
        </div>

        <div className='flex flex-col'>
          <p className='text-sm font-medium text-gray-900'>{user?.name}</p>
          <p className='text-xs text-gray-500'>{user?.role}</p>
        </div>
      </div>
    </div>
  );
}
