import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import PortfolioList from '../pages/portfolio/PortfolioList';
import PortfolioDetail from '../pages/portfolio/PortfolioDetail';
import Watchlist from '../pages/Watchlist';
import Alerts from '../pages/Alerts';
import Notifications from '../pages/Notifications';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Admin from '../pages/admin/Admin';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOTP from '../pages/auth/VerifyOTP';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/portfolios', element: <PortfolioList /> },
      { path: '/portfolios/:id', element: <PortfolioDetail /> },
      { path: '/watchlist', element: <Watchlist /> },
      { path: '/alerts', element: <Alerts /> },
      { path: '/notifications', element: <Notifications /> },
      { path: '/reports', element: <Reports /> },
      { path: '/profile', element: <Profile /> },
      { path: '/admin', element: <Admin /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/verify-otp', element: <VerifyOTP /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
    ],
  },
]);
