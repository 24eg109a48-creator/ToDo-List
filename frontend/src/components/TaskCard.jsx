import { PRIORITY_OPTIONS, STATUS_OPTIONS, formatDate, getLabel } from '../utils/helpers.js';
import Icon from './Icon.jsx';

export default function TaskCard({ task, busy, onEdit, onDelete, onComplete, onStatusChange }) {
  const completed = task.status === 'COMPLETED';

  return (
    <article className={`task-card priority-${task.priority.toLowerCase()} ${completed ? 'task-done' : ''}`}>
      <div className="task-card-top">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge badge-priority-${task.priority.toLowerCase()}`}>
          {getLabel(PRIORITY_OPTIONS, task.priority)}
        </span>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <span className={`task-due ${task.overdue ? 'task-due-overdue' : ''}`}>
          <Icon name="calendar" size={15} />
          <span>Due {formatDate(task.dueDate)}</span>
        </span>
        {task.overdue && <span className="badge badge-overdue">Overdue</span>}
      </div>

      <div className="task-card-bottom">
        <label className="status-select">
          <span className="visually-hidden">Status</span>
          <select
            value={task.status}
            disabled={busy}
            onChange={(event) => onStatusChange(task, event.target.value)}
            className={`status-${task.status.toLowerCase()}`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="task-actions">
          {!completed && (
            <button
              type="button"
              className="icon-btn icon-btn-success"
              onClick={() => onComplete(task)}
              disabled={busy}
              title="Mark as completed"
              aria-label={`Mark ${task.title} as completed`}
            >
              <Icon name="check" size={18} />
            </button>
          )}
          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(task)}
            disabled={busy}
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            <Icon name="edit" size={18} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            onClick={() => onDelete(task)}
            disabled={busy}
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
