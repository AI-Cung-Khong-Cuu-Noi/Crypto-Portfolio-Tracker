import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useAuthStore } from './store/authStore';

// Hydrate token/user before any route/hook runs so Socket.IO connects on first paint.
useAuthStore.getState().initialize();

// Không bọc StrictMode: trong dev nó gọi effect mount → unmount → mount, cleanup gọi
// socket.disconnect() khi handshake WS chưa xong → cảnh báo "WebSocket is closed before established".

createRoot(document.getElementById('root')!).render(<App />);
