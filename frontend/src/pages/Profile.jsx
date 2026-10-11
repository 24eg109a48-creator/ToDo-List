import { useEffect, useState } from 'react';
import DashboardStats from '../components/DashboardStats.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import useAuth from '../hooks/useAuth.js';
import taskService from '../services/taskService.js';
import userService from '../services/userService.js';
import { formatDate, getInitials, parseApiError } from '../utils/helpers.js';

export default function Profile() {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profileData, statsData] = await Promise.all([userService.getProfile(), taskService.getStats()]);
        if (!cancelled) {
          setProfile(profileData);
          setStats(statsData);
          setName(profileData.name);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(parseApiError(error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setSaveError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 50) {
      setNameError('Name must be between 2 and 50 characters');
      return;
    }
    setNameError('');

    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name: trimmed });
      setProfile(updated);
      setName(updated.name);
      updateUser(updated); // keeps the name in the top bar in sync
      setMessage('Your name has been updated.');
    } catch (error) {
      const parsed = parseApiError(error);
      setSaveError(parsed.message);
      if (parsed.fieldErrors.name) {
        setNameError(parsed.fieldErrors.name);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading your profile..." />;
  }

  if (loadError) {
    return <div className="alert alert-error">Could not load your profile: {loadError}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your account details and task summary.</p>
      </div>

      <div className="profile-grid">
        <section className="card profile-card">
          <div className="profile-identity">
            <span className="avatar avatar-lg" aria-hidden="true">
              {getInitials(profile.name)}
            </span>
            <div>
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
            </div>
          </div>

          <dl className="profile-details">
            <div>
              <dt>Name</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Account created</dt>
              <dd>{formatDate(profile.createdAt)}</dd>
            </div>
          </dl>
        </section>

        <section className="card">
          <h2 className="section-title">Update your name</h2>
          <form onSubmit={handleSubmit} noValidate>
            {message && <div className="alert alert-success">{message}</div>}
            {saveError && <div className="alert alert-error">{saveError}</div>}

            <div className="form-group">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                }}
                className={nameError ? 'input-error' : ''}
              />
              {nameError && <p className="field-error">{nameError}</p>}
            </div>

            <p className="field-hint">Your email address cannot be changed.</p>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>
      </div>

      <h2 className="section-title section-gap">Task summary</h2>
      <DashboardStats stats={stats} />
    </>
  );
}
