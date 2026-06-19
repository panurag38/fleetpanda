import { useCallback, useMemo } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { fetchDriverShiftsApi } from '../../../lib/api';
import { resolveDriverId } from '../../../lib/driverData';
import type { DriverShiftListItem } from '../../../lib/driverData';
import { AsyncPanel, Button, DataTable, Pagination, StatusBadge, type DataTableColumn } from '../../common/ui';
import './ShiftView.css';

const PAGE_SIZE = 5;

const ShiftView = () => {
  const { data, user, updateShiftStatus, endShift } = useAppContext();
  const { showToast } = useToast();
  const driverId = resolveDriverId(user, data);

  const today = new Date().toISOString().slice(0, 10);
  const todaysShift = useMemo(
    () => data.shifts.find((shift) => shift.driverId === driverId && shift.date === today),
    [data.shifts, driverId, today]
  );
  const todaysAllocation = useMemo(
    () => data.allocations.find((allocation) => allocation.driverId === driverId && allocation.date === today),
    [data.allocations, driverId, today]
  );
  const todaysVehicle = useMemo(
    () => data.vehicles.find((vehicle) => vehicle.id === todaysShift?.vehicleId || vehicle.id === todaysAllocation?.vehicleId),
    [data.vehicles, todaysAllocation?.vehicleId, todaysShift?.vehicleId]
  );
  const todaysOrders = useMemo(
    () =>
      (todaysShift?.orderIds ?? [])
        .map((orderId) => data.orders.find((order) => order.id === orderId))
        .filter(Boolean),
    [data.orders, todaysShift?.orderIds]
  );

  const fetchPage = useCallback(
    (page: number, signal?: AbortSignal) => {
      if (!driverId) {
        return Promise.resolve({
          data: null,
          error: 'No driver profile linked to this account.',
          status: 404
        });
      }

      return fetchDriverShiftsApi(data, driverId, { page, pageSize: PAGE_SIZE, historyOnly: false }, { signal });
    },
    [data, driverId]
  );

  const { page, setPage, items: records, total, totalPages, loading, error, reload } = usePaginatedQuery(fetchPage, [
    driverId,
    data.shifts.length
  ]);

  const handleStartShift = () => {
    if (!todaysShift) {
      showToast('No shift scheduled for today.', 'error');
      return;
    }
    if (!todaysAllocation) {
      showToast('Start shift is disabled until a vehicle is allocated for today.', 'error');
      return;
    }

    updateShiftStatus(todaysShift.id, 'in_progress');
    showToast('Shift started successfully.', 'success');
    reload();
  };

  const handleEndShift = () => {
    if (!todaysShift || todaysShift.status !== 'in_progress') {
      showToast('Only an in-progress shift can be ended.', 'error');
      return;
    }

    endShift(todaysShift.id);
    showToast('Shift ended successfully.', 'success');
    reload();
  };

  const columns = useMemo<Array<DataTableColumn<DriverShiftListItem>>>(
    () => [
      { key: 'id', header: 'Shift ID', render: (row) => row.id },
      { key: 'date', header: 'Date', render: (row) => row.date },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
      { key: 'vehicle', header: 'Vehicle', render: (row) => row.vehicleRegistration },
      { key: 'type', header: 'Vehicle Type', render: (row) => row.vehicleType },
      { key: 'orders', header: 'Orders', render: (row) => row.orderCount },
      { key: 'summary', header: 'Linked Orders', render: (row) => row.orderSummary }
    ],
    []
  );

  return (
    <div className="shift-view">
      <h1>Shift View</h1>

      <section className="page-card shift-view__today">
        <h4>Today&apos;s Shift</h4>
        {todaysShift ? (
          <>
            <p>
              Vehicle: <strong>{todaysVehicle?.registration ?? 'Unassigned'}</strong> ({todaysVehicle?.type ?? 'N/A'})
            </p>
            <p>
              Status: <StatusBadge status={todaysShift.status} />
            </p>
            <p>Orders: {todaysOrders.length > 0 ? todaysOrders.map((order) => order!.id).join(', ') : 'None linked'}</p>
            <div className="button-group shift-view__today-actions">
              <Button
                variant="primary"
                disabled={!todaysAllocation || todaysShift.status !== 'not_started'}
                onClick={handleStartShift}
              >
                Start Shift
              </Button>
              <Button variant="secondary" disabled={todaysShift.status !== 'in_progress'} onClick={handleEndShift}>
                End Shift
              </Button>
            </div>
            {!todaysAllocation ? (
              <p className="muted">Vehicle allocation required before starting today&apos;s shift.</p>
            ) : null}
          </>
        ) : (
          <p className="muted">No shift scheduled for today.</p>
        )}
      </section>

      <div className="page-card page-card--flush">
        <AsyncPanel loading={loading} error={error}>
          <DataTable
            columns={columns}
            rows={records}
            rowKey={(row) => row.id}
            emptyTitle="No shifts assigned"
            emptyMessage="You do not have any shifts assigned yet."
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </AsyncPanel>
      </div>
    </div>
  );
};

export default ShiftView;
