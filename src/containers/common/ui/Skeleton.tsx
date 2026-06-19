import './Skeleton.css';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton = ({ className = '', width, height }: SkeletonProps) => (
  <span
    className={`skeleton ${className}`.trim()}
    style={{ width, height }}
    aria-hidden="true"
  />
);

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
  <div className="table-skeleton" role="status" aria-live="polite" aria-label="Loading table data">
    <div className="table-skeleton__head">
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={`head-${index}`} height="1rem" />
      ))}
    </div>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="table-skeleton__row">
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="0.9rem" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="card-skeleton page-card" role="status" aria-live="polite" aria-label="Loading content">
    <Skeleton height="1.25rem" width="40%" />
    <Skeleton height="0.9rem" width="70%" />
    <Skeleton height="0.9rem" width="55%" />
    <Skeleton height="0.9rem" width="62%" />
  </div>
);
