import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthState } from './authState';
import { TOKEN_KEY, readToken, errorMessage } from '../services/api';
import * as authService from '../services/authService';
import * as favoriteService from '../services/favoriteService';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(readToken()));
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState('');
  const [pending, setPending] = useState(new Set());
  const [notice, setNotice] = useState(null);
  const favoritesRequest = useRef(0);
  const notify = useCallback(
    (message, type = 'success') => setNotice({ message, type, id: Date.now() }),
    [],
  );

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5500);
    return () => clearTimeout(timer);
  }, [notice]);

  const logout = useCallback(() => {
    favoritesRequest.current += 1;
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setAuthLoading(false);
    setFavorites([]);
    setFavoritesLoading(false);
    setFavoritesError('');
    setPending(new Set());
  }, []);

  const loadFavorites = useCallback(async () => {
    const token = readToken();
    if (!token) return;
    const request = ++favoritesRequest.current;
    const isCurrent = () => readToken() === token && favoritesRequest.current === request;
    setFavoritesLoading(true);
    setFavoritesError('');
    try {
      const result = await favoriteService.getFavorites();
      if (isCurrent()) setFavorites(result);
    } catch (error) {
      if (isCurrent()) setFavoritesError(errorMessage(error));
    } finally {
      if (isCurrent()) setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const token = readToken();
    const expired = () => {
      logout();
      notify('Your session has ended. Please log in again.', 'error');
    };
    window.addEventListener('forma:unauthorized', expired);
    if (token) {
      authService
        .getCurrentUser()
        .then((result) => {
          if (active && readToken() === token) {
            setUser(result);
            loadFavorites();
          }
        })
        .catch((error) => {
          if (active && readToken() === token && error.response?.status !== 401)
            notify(errorMessage(error), 'error');
        })
        .finally(() => {
          if (active && readToken() === token) setAuthLoading(false);
        });
    }
    return () => {
      active = false;
      window.removeEventListener('forma:unauthorized', expired);
    };
  }, [logout, notify, loadFavorites]);

  async function authenticate(mode, fields) {
    const result = await authService[mode](fields);
    localStorage.setItem(TOKEN_KEY, result.token);
    setFavorites([]);
    setPending(new Set());
    setUser(result.user);
    setAuthLoading(false);
    loadFavorites();
    return result.user;
  }

  async function toggleFavorite(template) {
    const id = template.id || template._id;
    const token = readToken();
    const saved = favorites.some((item) => (item.id || item._id) === id);
    setPending((current) => new Set([...current, id]));
    try {
      if (saved) await favoriteService.removeFavorite(id);
      else await favoriteService.addFavorite(id);
      if (readToken() === token) {
        setFavorites((current) =>
          saved
            ? current.filter((item) => (item.id || item._id) !== id)
            : current.some((item) => (item.id || item._id) === id)
              ? current
              : [...current, template],
        );
        notify(saved ? 'Removed from your favorites.' : 'A good find. Saved to your favorites.');
      }
    } catch (error) {
      if (readToken() === token) notify(errorMessage(error), 'error');
    } finally {
      if (readToken() === token)
        setPending((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
    }
  }

  return (
    <AuthState.Provider
      value={{
        user,
        authLoading,
        authenticate,
        logout,
        favorites,
        favoritesLoading,
        favoritesError,
        loadFavorites,
        toggleFavorite,
        pending,
        notice,
        notify,
        dismissNotice: () => setNotice(null),
      }}
    >
      {children}
    </AuthState.Provider>
  );
}
