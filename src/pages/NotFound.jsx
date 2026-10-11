import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="notfound-page">
      <p className="notfound-code">404</p>
      <h1>This page does not exist</h1>
      <p>The address may be mistyped, or the page may have moved.</p>
      <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary">
        {isAuthenticated ? 'Back to dashboard' : 'Go to login'}
      </Link>
    </div>
  );
}
