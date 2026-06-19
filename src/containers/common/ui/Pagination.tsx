import { Button } from './Button';
import './Pagination.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) => {
  if (total === 0) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span className="pagination__summary">
        Showing {start}-{end} of {total}
      </span>
      <div className="pagination__controls">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <span className="pagination__page">
          Page {page} of {totalPages}
        </span>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};
