import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center'>
      <div className='w-full max-w-md'>
        <Outlet />
      </div>
    </div>
  );
}
