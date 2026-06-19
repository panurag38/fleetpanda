import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { CardSkeleton, TableSkeleton } from './Skeleton';

interface AsyncPanelProps {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  skeleton?: 'table' | 'card';
  children: ReactNode;
}

export const AsyncPanel = ({
  loading,
  error,
  empty = false,
  emptyTitle = 'Nothing to show',
  emptyMessage = 'No records are available yet.',
  skeleton = 'table',
  children
}: AsyncPanelProps) => {
  if (loading) {
    return (
      <div aria-busy="true" aria-live="polite">
        {skeleton === 'card' ? <CardSkeleton /> : <TableSkeleton />}
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Unable to load data" message={error} />;
  }

  if (empty) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return <>{children}</>;
};
