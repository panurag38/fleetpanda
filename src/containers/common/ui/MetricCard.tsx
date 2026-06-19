import type { ReactNode } from 'react';
import './MetricCard.css';

interface MetricCardProps {
  title: string;
  count: number;
  hint: string;
  selected?: boolean;
  interactive?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

export const MetricCard = ({
  title,
  count,
  hint,
  selected = false,
  interactive = false,
  icon,
  onClick
}: MetricCardProps) => {
  const className = [
    'metric-card',
    'page-card',
    interactive ? 'metric-card--interactive' : 'metric-card--empty',
    selected ? 'metric-card--selected' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className="metric-card__top">
        {icon ? <span className="metric-card__icon">{icon}</span> : null}
        <div className="metric-card__content">
          <h4>{title}</h4>
          <p className="metric-card__count">{count}</p>
        </div>
      </div>
      <span className="metric-card__hint">{hint}</span>
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={className} onClick={onClick} aria-pressed={selected}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};
