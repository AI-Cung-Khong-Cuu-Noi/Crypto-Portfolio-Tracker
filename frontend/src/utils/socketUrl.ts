/**
 * Socket.IO is mounted on the HTTP server root, not under /api.
 * Prefer VITE_SOCKET_URL; otherwise strip a trailing /api from VITE_API_URL.
 */
export function getSocketBaseUrl(): string {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.replace(/\/$/, '');
  }

  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const withoutApi = api.replace(/\/?api\/?$/i, '').replace(/\/$/, '');
  return withoutApi || 'http://localhost:5000';
}
