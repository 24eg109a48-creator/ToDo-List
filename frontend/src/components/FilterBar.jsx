import { PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_FILTERS } from '../utils/helpers.js';
import Icon from './Icon.jsx';

/** Status pills + priority dropdown + sort dropdown + asc/desc toggle. */
export default function FilterBar({
  status,
  priority,
  sortBy,
  direction,
  onStatusChange,
  onPriorityChange,
  onSortByChange,
  onDirectionChange
}) {
  return (
    <div className="filter-bar">
      <div className="pill-group" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`pill ${status === option.value ? 'pill-active' : ''}`}
            onClick={() => onStatusChange(option.value)}
            aria-pressed={status === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filter-selects">
        <label className="select-label">
          <span>Priority</span>
          <select value={priority} onChange={(event) => onPriorityChange(event.target.value)}>
            <option value="ALL">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="select-label">
          <span>Sort by</span>
          <select value={sortBy} onChange={(event) => onSortByChange(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="btn btn-outline btn-sm direction-btn"
          onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
          aria-label={direction === 'asc' ? 'Sorted ascending, click for descending' : 'Sorted descending, click for ascending'}
        >
          <Icon name={direction === 'asc' ? 'arrowUp' : 'arrowDown'} size={16} />
          <span>{direction === 'asc' ? 'Ascending' : 'Descending'}</span>
        </button>
      </div>
    </div>
  );
}
