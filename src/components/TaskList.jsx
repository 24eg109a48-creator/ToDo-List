import Icon from './Icon.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import TaskCard from './TaskCard.jsx';

/** Shows the loading, error, empty or normal state of the task list. */
export default function TaskList({
  tasks,
  loading,
  error,
  busyId,
  hasActiveFilters,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  onComplete,
  onStatusChange
}) {
  if (loading) {
    return <LoadingSpinner label="Loading your tasks..." />;
  }

  if (error) {
    return (
      <div className="state-box state-error">
        <Icon name="alert" size={32} />
        <h3>Could not load your tasks</h3>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="state-box">
        <Icon name="inbox" size={32} />
        {hasActiveFilters ? (
          <>
            <h3>No tasks match your search</h3>
            <p>Try a different keyword or clear the filters.</p>
          </>
        ) : (
          <>
            <h3>You have no tasks yet</h3>
            <p>Create your first task to start planning your work.</p>
            <button type="button" className="btn btn-primary" onClick={onCreate}>
              <Icon name="plus" size={16} />
              <span>Add task</span>
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="task-grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          busy={busyId === task.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
