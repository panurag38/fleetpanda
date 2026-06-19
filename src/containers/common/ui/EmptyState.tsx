import type { ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, message, action }: EmptyStateProps) => (
  <div className="empty-state">
    <h4>{title}</h4>
    <p>{message}</p>
    {action}
  </div>
);
