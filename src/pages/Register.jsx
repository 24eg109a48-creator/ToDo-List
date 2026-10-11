import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import useAuth from '../hooks/useAuth.js';
import { parseApiError } from '../utils/helpers.js';

export default function Register() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  // Same rules as the backend (RegisterRequest) for instant feedback.
  function validate() {
    const found = {};
    const name = form.name.trim();
    if (!name) {
      found.name = 'Name is required';
    } else if (name.length < 2 || name.length > 50) {
      found.name = 'Name must be between 2 and 50 characters';
    }
    if (!form.email.trim()) {
      found.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      found.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      found.password = 'Password is required';
    } else if (form.password.length < 6) {
      found.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      found.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      found.confirmPassword = 'Passwords do not match';
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      navigate('/login', { replace: true, state: { registered: true } });
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
        <h1>Start organising in a minute.</h1>
        <p>Create a free account and add your first task. Your tasks are private to you.</p>
      </aside>

      <main className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h2>Create your account</h2>
          <p className="auth-subtitle">It only takes a few seconds.</p>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Asha Rao"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
