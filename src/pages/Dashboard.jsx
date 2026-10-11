import { useCallback, useEffect, useState } from 'react';
import DashboardStats from '../components/DashboardStats.jsx';
import TaskManager from '../components/TaskManager.jsx';
import useAuth from '../hooks/useAuth.js';
import taskService from '../services/taskService.js';
import { parseApiError } from '../utils/helpers.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setStats(await taskService.getStats());
      setStatsError('');
    } catch (error) {
      setStatsError(parseApiError(error).message);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <>
      <div className="page-header">
        <h1>Welcome back, {user?.name}</h1>
        <p>Here is where your work stands today.</p>
      </div>

      {statsError && <div className="alert alert-error">Could not load statistics: {statsError}</div>}
      <DashboardStats stats={stats} />

      <TaskManager limit={6} onTasksChanged={loadStats} />
    </>
  );
}
