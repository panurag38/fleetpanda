import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => (
  <span className={`status-badge status-badge--${status} ${className}`.trim()}>{status.replace(/_/g, ' ')}</span>
);
