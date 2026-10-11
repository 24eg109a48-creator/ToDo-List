import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/tasks', label: 'My tasks', icon: 'tasks' },
  { to: '/profile', label: 'Profile', icon: 'user' }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">
            <Icon name="check" size={18} />
          </span>
          <span className="brand-name">SmartTask</span>
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon name={link.icon} size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <p className="sidebar-footer">Full Stack To-Do Management System</p>
      </aside>
    </>
  );
}
