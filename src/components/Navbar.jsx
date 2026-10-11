import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { getInitials } from '../utils/helpers.js';
import Icon from './Icon.jsx';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button type="button" className="icon-btn menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Icon name="menu" size={22} />
        </button>
        <span className="navbar-title">SmartTask</span>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="avatar" aria-hidden="true">
            {getInitials(user?.name)}
          </span>
          <span className="navbar-username">{user?.name}</span>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleLogout}>
          <Icon name="logout" size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
