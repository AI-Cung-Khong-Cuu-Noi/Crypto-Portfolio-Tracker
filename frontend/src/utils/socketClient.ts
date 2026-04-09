import { io } from 'socket.io-client';

type IoClientOptions = NonNullable<Parameters<typeof io>[1]>;

/**
 * Cấu hình Socket.IO dùng chung.
 * - `polling` trước `websocket`: kết nối HTTP ổn định rồi upgrade, giảm cảnh báo
 *   "WebSocket is closed before the connection is established" khi handshake bị hủy sớm (vd. Strict Mode).
 */
export function getSocketIoOptions(token: string): IoClientOptions {
  return {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  };
}
