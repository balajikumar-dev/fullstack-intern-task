import axios from 'axios';

export const TOKEN_KEY = 'forma.accessToken';
export const readToken = () => localStorage.getItem(TOKEN_KEY);
const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
// Allow a sleeping Render Free service to wake; requests are never retried automatically.
const api = axios.create({ baseURL, timeout: 75000 });

api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const currentToken = readToken();
    const requestToken = error.config?.headers?.Authorization;
    if (
      error.response?.status === 401 &&
      currentToken &&
      requestToken === `Bearer ${currentToken}` &&
      !/\/auth\/(login|register)$/.test(error.config?.url || '')
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('forma:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error) {
  return (
    error.response?.data?.message ||
    (error.code === 'ECONNABORTED'
      ? 'That took a little too long. Please try again.'
      : 'We couldn’t reach the server. Please check your connection and try again.')
  );
}

export function assetUrl(path) {
  if (!path) return '';
  return new URL(path, new URL(baseURL, window.location.origin).origin).href;
}

export default api;
