import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Wallet,
  Eye,
  Bell,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const mainLinks = [
    { label: 'Dashboard', href: '/', icon: TrendingUp },
    { label: 'Portfolios', href: '/portfolios', icon: Wallet },
    { label: 'Watchlist', href: '/watchlist', icon: Eye },
    { label: 'Alerts', href: '/alerts', icon: Bell },
    { label: 'Notifications', href: '/notifications', icon: Bell },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const bottomLinks = [
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin', href: '/admin', icon: Users }] : []),
    { label: 'Profile', href: '/profile', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className='w-64 bg-white border-r border-gray-200 flex flex-col'>
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold'>
            CP
          </div>
          <div>
            <h1 className='font-bold text-lg text-gray-900'>Cryfo Tracker</h1>
          </div>
        </div>
      </div>

      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        {mainLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors',
              isActive(href)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className='p-4 space-y-2 border-t border-gray-200'>
        {bottomLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors',
              isActive(href)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}

        <button
          onClick={logout}
          className='w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors'
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
