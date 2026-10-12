// Options used by dropdowns, filters and badges. The values match the backend enums exactly.
export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' }
];

export const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }
];

export const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'OVERDUE', label: 'Overdue' }
];

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created date' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'title', label: 'Title' },
  { value: 'priority', label: 'Priority' }
];

export function getLabel(options, value) {
  const found = options.find((option) => option.value === value);
  return found ? found.label : value;
}

/** "2026-03-15" -> "15 Mar 2026". Works on "2026-03-15T10:20:30" too. */
export function formatDate(isoString) {
  if (!isoString) {
    return '-';
  }
  const [year, month, day] = isoString.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/** Today's date as yyyy-MM-dd in the user's own time zone (what <input type="date"> uses). */
export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function getInitials(name) {
  if (!name) {
    return '?';
  }
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/**
 * Turns an Axios error into { message, fieldErrors }.
 * The backend sends: { status, message, errors: { fieldName: "text" } }
 */
export function parseApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error && error.response) {
    const data = error.response.data || {};
    return {
      message: data.message || fallback,
      fieldErrors: data.errors || {}
    };
  }
  if (error && error.request) {
    return {
      message: 'Cannot reach the server. Please check your connection or try again in a moment.',
      fieldErrors: {}
    };
  }
  return { message: fallback, fieldErrors: {} };
}