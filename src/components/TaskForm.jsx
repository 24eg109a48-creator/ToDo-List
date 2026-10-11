import { useEffect, useState } from 'react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, todayISO } from '../utils/helpers.js';

function buildInitialForm(task) {
  if (task) {
    return {
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status
    };
  }
  return { title: '', description: '', dueDate: todayISO(), priority: 'MEDIUM', status: 'PENDING' };
}

/** Same checks as the backend, so the user gets instant feedback. */
function validate(form) {
  const errors = {};
  const title = form.title.trim();
  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 3 || title.length > 100) {
    errors.title = 'Title must be between 3 and 100 characters';
  }
  if (form.description.length > 500) {
    errors.description = 'Description must be at most 500 characters';
  }
  if (!form.dueDate) {
    errors.dueDate = 'Due date is required';
  }
  return errors;
}

/**
 * Modal form used for both "Add task" (task = null) and "Edit task" (task = existing task).
 * serverError / serverFieldErrors are the messages returned by the backend validation.
 */
export default function TaskForm({ task, submitting, serverError, serverFieldErrors, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => buildInitialForm(task));
  const [clientErrors, setClientErrors] = useState({});
  const isEdit = Boolean(task);
  const errors = { ...serverFieldErrors, ...clientErrors };

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape' && !submitting) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [submitting, onCancel]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setClientErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const found = validate(form);
    setClientErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status
    });
  }

  return (
    <div className="modal-backdrop" onClick={submitting ? undefined : onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="task-form-title" className="modal-title">
          {isEdit ? 'Edit task' : 'Add a new task'}
        </h2>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Finish DBMS assignment"
              className={errors.title ? 'input-error' : ''}
              autoFocus
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="optional">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Add a few details"
              className={errors.description ? 'input-error' : ''}
            />
            <p className="field-hint">{form.description.length}/500</p>
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={form.dueDate}
                onChange={handleChange}
                className={errors.dueDate ? 'input-error' : ''}
              />
              {errors.dueDate && <p className="field-error">{errors.dueDate}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className={errors.priority ? 'input-error' : ''}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.priority && <p className="field-error">{errors.priority}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className={errors.status ? 'input-error' : ''}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="field-error">{errors.status}</p>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
