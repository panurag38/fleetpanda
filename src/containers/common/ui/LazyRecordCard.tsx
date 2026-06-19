import type { ReactNode } from 'react';
import { Button } from './Button';
import { CloseIcon, RefreshIcon } from './icons';
import './LazyRecordCard.css';

interface LazyRecordCardProps {
  title: string;
  count: number;
  emptyMessage: string;
  icon?: ReactNode;
  expanded: boolean;
  loading: boolean;
  error: string | null;
  onOpen: () => void;
  onRefresh: () => void;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const LazyRecordCard = ({
  title,
  count,
  emptyMessage,
  icon,
  expanded,
  loading,
  error,
  onOpen,
  onRefresh,
  onClose,
  children,
  footer
}: LazyRecordCardProps) => {
  if (!expanded) {
    return (
      <button
        type="button"
        className={`lazy-record-card page-card ${count > 0 ? 'lazy-record-card--interactive' : 'lazy-record-card--empty'}`}
        onClick={count > 0 ? onOpen : undefined}
        disabled={count <= 0}
      >
        <div className="lazy-record-card__top">
          {icon ? <span className="lazy-record-card__icon">{icon}</span> : null}
          <div className="lazy-record-card__content">
            <div className="lazy-record-card__header">
              <h5>{title}</h5>
              <span className="lazy-record-card__count">{count}</span>
            </div>
            <p className="lazy-record-card__hint">
              {count > 0 ? 'View records' : emptyMessage}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <section
      className="lazy-record-card page-card lazy-record-card--expanded"
      aria-busy={loading || undefined}
      aria-live="polite"
    >
      <div className="lazy-record-card__toolbar">
        <div className="lazy-record-card__title-group">
          {icon ? <span className="lazy-record-card__icon">{icon}</span> : null}
          <div>
            <h5>{title}</h5>
            <p className="muted lazy-record-card__subtitle">{count} total records</p>
          </div>
        </div>
        <div className="lazy-record-card__actions">
          <Button variant="ghost" leadingIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
          <Button variant="danger" leadingIcon={<CloseIcon />} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {error ? <p className="form-field__error" role="alert">{error}</p> : null}
      <div className={`lazy-record-card__body${loading ? ' lazy-record-card__body--loading' : ''}`}>
        {children}
      </div>
      {loading ? <p className="muted lazy-record-card__status" aria-live="polite">Loading records…</p> : null}
      {!loading && !error ? footer : null}
    </section>
  );
};
