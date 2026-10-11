import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/**
 * Wrap any page that needs a logged-in user.
 * Visitors without a session are sent to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
