import { useCallback, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { fetchDriverShiftsApi } from '../../../lib/api';
import { resolveDriverId } from '../../../lib/driverData';
import type { DriverShiftListItem } from '../../../lib/driverData';
import { AsyncPanel, DataTable, Pagination, StatusBadge, type DataTableColumn } from '../../common/ui';
import './ShiftView.css';

const PAGE_SIZE = 5;

const ShiftHistory = () => {
  const { data, user } = useAppContext();
  const driverId = resolveDriverId(user, data);

  const fetchPage = useCallback(
    (page: number, signal?: AbortSignal) => {
      if (!driverId) {
        return Promise.resolve({
          data: null,
          error: 'No driver profile linked to this account.',
          status: 404
        });
      }

      return fetchDriverShiftsApi(data, driverId, { page, pageSize: PAGE_SIZE, historyOnly: true }, { signal });
    },
    [data, driverId]
  );

  const { page, setPage, items: records, total, totalPages, loading, error } = usePaginatedQuery(fetchPage, [
    driverId
  ]);

  const columns = useMemo<Array<DataTableColumn<DriverShiftListItem>>>(
    () => [
      { key: 'id', header: 'Shift ID', render: (row) => row.id },
      { key: 'date', header: 'Date', render: (row) => row.date },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
      { key: 'vehicle', header: 'Vehicle', render: (row) => row.vehicleRegistration },
      { key: 'orders', header: 'Deliveries', render: (row) => row.orderCount },
      { key: 'summary', header: 'Completed Orders', render: (row) => row.orderSummary }
    ],
    []
  );

  return (
    <div className="shift-view">
      <h1>Shift History</h1>
      <p className="muted">Past completed shifts and linked deliveries.</p>

      <div className="page-card page-card--flush">
        <AsyncPanel loading={loading} error={error}>
          <DataTable
            columns={columns}
            rows={records}
            rowKey={(row) => row.id}
            emptyTitle="No completed shifts"
            emptyMessage="Completed shifts will appear here after you end a shift."
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </AsyncPanel>
      </div>
    </div>
  );
};

export default ShiftHistory;
