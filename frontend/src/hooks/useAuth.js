import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/** Shortcut: const { user, login, logout, isAuthenticated } = useAuth(); */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
