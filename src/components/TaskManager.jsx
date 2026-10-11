import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import taskService from '../services/taskService.js';
import { parseApiError } from '../utils/helpers.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import FilterBar from './FilterBar.jsx';
import Icon from './Icon.jsx';
import SearchBar from './SearchBar.jsx';
import TaskForm from './TaskForm.jsx';
import TaskList from './TaskList.jsx';

/**
 * The whole "manage my tasks" area: search, filters, sorting, list,
 * add/edit modal and delete confirmation.
 *
 * limit           - show only the first N tasks (used on the dashboard)
 * onTasksChanged  - called after every create/update/delete so the parent can refresh its statistics
 */
export default function TaskManager({ limit, onTasksChanged }) {
  // list + query state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');

  // add/edit modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});

  // delete + row actions
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // feedback messages
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  // Used to ignore the answer of an old request when a newer one was started.
  const latestRequest = useRef(0);

  const loadTasks = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;
    setLoading(true);
    setLoadError('');
    try {
      const data = await taskService.getTasks({ search, status, priority, sortBy, direction });
      if (requestId === latestRequest.current) {
        setTasks(data);
      }
    } catch (error) {
      if (requestId === latestRequest.current) {
        setLoadError(parseApiError(error, 'Please check your connection and try again.').message);
      }
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  }, [search, status, priority, sortBy, direction]);

  // Reload whenever the search text, a filter or the sorting changes.
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Hide the success message after 3 seconds.
  useEffect(() => {
    if (!notice) {
      return undefined;
    }
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  function afterChange(message) {
    setNotice(message);
    setActionError('');
    loadTasks();
    if (onTasksChanged) {
      onTasksChanged();
    }
  }

  // ---------------------------------------------------------------- add / edit
  function openCreateForm() {
    setEditingTask(null);
    setFormError('');
    setFormFieldErrors({});
    setFormOpen(true);
  }

  function openEditForm(task) {
    setEditingTask(task);
    setFormError('');
    setFormFieldErrors({});
    setFormOpen(true);
  }

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingTask(null);
  }, []);

  async function handleSave(payload) {
    setSaving(true);
    setFormError('');
    setFormFieldErrors({});
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
      } else {
        await taskService.createTask(payload);
      }
      const wasEdit = Boolean(editingTask);
      closeForm();
      afterChange(wasEdit ? 'Task updated' : 'Task added');
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFormFieldErrors(parsed.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  // ------------------------------------------------------------- row actions
  async function runRowAction(task, action, successMessage) {
    setBusyId(task.id);
    setActionError('');
    try {
      await action();
      afterChange(successMessage);
    } catch (error) {
      setActionError(parseApiError(error).message);
    } finally {
      setBusyId(null);
    }
  }

  function handleComplete(task) {
    return runRowAction(task, () => taskService.completeTask(task.id), 'Task marked as completed');
  }

  function handleStatusChange(task, newStatus) {
    return runRowAction(task, () => taskService.updateStatus(task.id, newStatus), 'Status updated');
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      afterChange('Task deleted');
    } catch (error) {
      setDeleteTarget(null);
      setActionError(parseApiError(error).message);
    } finally {
      setDeleting(false);
    }
  }

  // --------------------------------------------------------------------- view
  const hasActiveFilters = search !== '' || status !== 'ALL' || priority !== 'ALL';
  const visibleTasks = limit ? tasks.slice(0, limit) : tasks;
  const hiddenCount = tasks.length - visibleTasks.length;

  return (
    <section className="card task-manager">
      <div className="section-header">
        <div>
          <h2 className="section-title">{limit ? 'Recent tasks' : 'Your tasks'}</h2>
          {!loading && !loadError && (
            <p className="section-subtitle">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              {hasActiveFilters ? ' match your filters' : ''}
            </p>
          )}
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreateForm}>
          <Icon name="plus" size={16} />
          <span>Add task</span>
        </button>
      </div>

      <SearchBar onSearch={setSearch} />

      <FilterBar
        status={status}
        priority={priority}
        sortBy={sortBy}
        direction={direction}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSortByChange={setSortBy}
        onDirectionChange={setDirection}
      />

      {notice && <div className="alert alert-success">{notice}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}

      <TaskList
        tasks={visibleTasks}
        loading={loading}
        error={loadError}
        busyId={busyId}
        hasActiveFilters={hasActiveFilters}
        onRetry={loadTasks}
        onCreate={openCreateForm}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        onComplete={handleComplete}
        onStatusChange={handleStatusChange}
      />

      {!loading && hiddenCount > 0 && (
        <p className="view-all">
          <Link to="/tasks">View all {tasks.length} tasks</Link>
        </p>
      )}

      {formOpen && (
        <TaskForm
          task={editingTask}
          submitting={saving}
          serverError={formError}
          serverFieldErrors={formFieldErrors}
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this task?"
        message={deleteTarget ? `"${deleteTarget.title}" will be permanently deleted. This cannot be undone.` : ''}
        confirmLabel="Delete task"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
