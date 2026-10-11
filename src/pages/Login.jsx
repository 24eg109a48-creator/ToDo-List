import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import useAuth from '../hooks/useAuth.js';
import { parseApiError } from '../utils/helpers.js';

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go straight to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const justRegistered = Boolean(location.state && location.state.registered);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function validate() {
    const found = {};
    if (!form.email.trim()) {
      found.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      found.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      found.password = 'Password is required';
    }
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      const parsed = parseApiError(error);
      setServerError(parsed.message);
      setErrors(parsed.fieldErrors);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-brand">
          <span className="brand-mark brand-mark-lg">
            <Icon name="check" size={24} />
          </span>
          <span className="auth-brand-name">SmartTask</span>
        </div>
        <h1>Plan the work. Finish the work.</h1>
        <p>
          Keep every assignment, deadline and project task in one place, with priorities, filters and
          overdue alerts.
        </p>
      </aside>

      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Log in to see your tasks.</p>

          {justRegistered && (
            <div className="alert alert-success">Account created. You can log in now.</div>
          )}
          {serverError && <div className="alert alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Log in'}
          </button>

          <p className="auth-switch">
            New to SmartTask? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
