import Icon from './Icon.jsx';

const CARDS = [
  { key: 'total', label: 'Total tasks', icon: 'list', tone: 'primary' },
  { key: 'completed', label: 'Completed', icon: 'check', tone: 'success' },
  { key: 'pending', label: 'Pending', icon: 'clock', tone: 'warning' },
  { key: 'inProgress', label: 'In progress', icon: 'tasks', tone: 'info' },
  { key: 'overdue', label: 'Overdue', icon: 'alert', tone: 'danger' }
];

/** Row of statistic cards. Pass stats = null while the numbers are still loading. */
export default function DashboardStats({ stats }) {
  return (
    <div className="stats-grid">
      {CARDS.map((card) => (
        <div key={card.key} className={`stat-card tone-${card.tone}`}>
          <span className="stat-icon">
            <Icon name={card.icon} size={20} />
          </span>
          <div>
            <p className="stat-value">{stats ? stats[card.key] : '-'}</p>
            <p className="stat-label">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
