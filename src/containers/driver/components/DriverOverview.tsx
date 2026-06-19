import { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { fetchDriverOverviewApi } from '../../../lib/api';
import { resolveDriverId } from '../../../lib/driverData';
import type { DriverOverviewDetail } from '../../../lib/driverData';
import { AsyncPanel, Button, EmptyState, StatusBadge } from '../../common/ui';
import './DriverOverview.css';

const DriverOverview = () => {
  const { data, user, updateShiftStatus, endShift } = useAppContext();
  const { showToast } = useToast();
  const [overview, setOverview] = useState<DriverOverviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOverview = useCallback(async () => {
    const driverId = resolveDriverId(user, data);
    if (!driverId) {
      setOverview(null);
      setLoading(false);
      setError('No driver profile linked to this account.');
      return;
    }

    setLoading(true);
    setError(null);
    const response = await fetchDriverOverviewApi(data, driverId);
    setLoading(false);

    if (response.error || !response.data) {
      setOverview(null);
      setError(response.error ?? 'Unable to load driver overview.');
      return;
    }

    setOverview(response.data);
  }, [data, user]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview, refreshKey, data.shifts]);

  const handleStartShift = () => {
    if (!overview?.todaysShift) {
      showToast('No shift scheduled for today.', 'error');
      return;
    }
    if (!overview.todaysAllocationDate) {
      showToast('Vehicle allocation is required before starting a shift.', 'error');
      return;
    }

    updateShiftStatus(overview.todaysShift.id, 'in_progress');
    showToast('Shift started.', 'success');
    setRefreshKey((value) => value + 1);
  };

  const handleEndShift = () => {
    if (!overview?.todaysShift || overview.todaysShift.status !== 'in_progress') {
      showToast('Only an active shift can be ended.', 'error');
      return;
    }

    endShift(overview.todaysShift.id);
    showToast('Shift ended.', 'success');
    setRefreshKey((value) => value + 1);
  };

  return (
    <div className="driver-overview">
      <h1>Driver Overview</h1>

      <AsyncPanel
        loading={loading}
        error={error}
        skeleton="card"
        empty={!loading && !error && !overview}
        emptyTitle="Overview unavailable"
        emptyMessage="Driver details could not be loaded."
      >
        {overview ? (
          <>
            {overview.todaysShift ? (
              <section className="page-card driver-overview__shift-card">
                <h4>Today&apos;s Shift</h4>
                <p>
                  Vehicle: <strong>{overview.vehicleRegistration ?? 'Unassigned'}</strong>
                  {overview.vehicleType ? ` (${overview.vehicleType})` : ''}
                </p>
                <p>
                  Status: <StatusBadge status={overview.todaysShift.status} />
                </p>
                <p>Linked orders: {overview.todaysShift.orderCount}</p>
                <div className="button-group">
                  <Button
                    variant="primary"
                    disabled={!overview.todaysAllocationDate || overview.todaysShift.status !== 'not_started'}
                    onClick={handleStartShift}
                  >
                    Start Shift
                  </Button>
                  <Button variant="secondary" disabled={overview.todaysShift.status !== 'in_progress'} onClick={handleEndShift}>
                    End Shift
                  </Button>
                </div>
              </section>
            ) : null}

            <div className="page-card driver-overview__grid">
              <div>
                <p className="driver-overview__label">Driver</p>
                <p className="driver-overview__value">{overview.name}</p>
              </div>
              <div>
                <p className="driver-overview__label">License</p>
                <p className="driver-overview__value">{overview.license}</p>
              </div>
              <div>
                <p className="driver-overview__label">Phone</p>
                <p className="driver-overview__value">{overview.phone}</p>
              </div>
              <div>
                <p className="driver-overview__label">Assigned Vehicle</p>
                <p className="driver-overview__value">
                  {overview.vehicleRegistration ? `${overview.vehicleRegistration} (${overview.vehicleType})` : 'Not assigned'}
                </p>
              </div>
              <div>
                <p className="driver-overview__label">Shift Status</p>
                <p className="driver-overview__value">{overview.activeShiftStatus?.replace('_', ' ') ?? 'No active shift'}</p>
              </div>
              <div>
                <p className="driver-overview__label">Today&apos;s Allocation</p>
                <p className="driver-overview__value">{overview.todaysAllocationDate ?? 'None scheduled'}</p>
              </div>
              <div>
                <p className="driver-overview__label">Pending Deliveries</p>
                <p className="driver-overview__value">{overview.pendingDeliveries}</p>
              </div>
              <div>
                <p className="driver-overview__label">In Transit</p>
                <p className="driver-overview__value">{overview.inTransitDeliveries}</p>
              </div>
              <div>
                <p className="driver-overview__label">Completed Deliveries</p>
                <p className="driver-overview__value">{overview.completedDeliveries}</p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="Overview unavailable" message="Driver details could not be loaded." />
        )}
      </AsyncPanel>
    </div>
  );
};

export default DriverOverview;
