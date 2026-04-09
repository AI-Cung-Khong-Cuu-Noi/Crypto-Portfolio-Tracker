import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect, useRef } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

function App() {
  const { initialize, user, token } = useAuthStore();
  const previousAuthKeyRef = useRef<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const currentAuthKey = token && user?.id ? `${user.id}:${token}` : null;
    const previousAuthKey = previousAuthKeyRef.current;

    // Khi đổi tài khoản/đăng xuất, xoá toàn bộ cache để không lộ dữ liệu user trước.
    if (previousAuthKey !== null && previousAuthKey !== currentAuthKey) {
      queryClient.clear();
    }

    previousAuthKeyRef.current = currentAuthKey;
  }, [token, user?.id]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position='top-right' />
    </QueryClientProvider>
  );
}

export default App;
