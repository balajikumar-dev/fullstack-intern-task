import { createContext, useContext } from 'react';
export const AuthState = createContext(null);
export function useAuth() {
  const value = useContext(AuthState);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
