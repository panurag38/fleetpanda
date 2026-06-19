import { useCallback, useMemo, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import { fetchAllocationsApi } from '../../../lib/api';
import { fetchAllocationsByMonth, type AllocationListItem } from '../../../lib/adminData';
import type { Allocation } from '../../../types';
import {
  AsyncPanel,
  Button,
  ConfirmDialog,
  DataTable,
  DateField,
  EmptyState,
  InfoDialog,
  Pagination,
  SelectField,
  type DataTableColumn
} from '../../common/ui';
import './VehicleAllocation.css';

const PAGE_SIZE = 5;

const VehicleAllocation = () => {
  const { data, addAllocation } = useAppContext();
  const { showToast } = useToast();
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [allocation, setAllocation] = useState<Partial<Allocation>>({
    vehicleId: '',
    driverId: '',
    date: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAllocation, setPendingAllocation] = useState<Allocation | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<AllocationListItem | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const vehicleOptions = useMemo(
    () => data.vehicles.map((vehicle) => ({ value: vehicle.id, label: `${vehicle.registration} (${vehicle.type})` })),
    [data.vehicles]
  );
  const driverOptions = useMemo(
    () => data.drivers.map((driver) => ({ value: driver.id, label: driver.name })),
    [data.drivers]
  );

  const fetchPage = useCallback(
    (page: number, signal?: AbortSignal) => fetchAllocationsApi(data, { page, pageSize: PAGE_SIZE }, { signal }),
    [data]
  );

  const { page, setPage, items: records, total, totalPages, loading, error: listError, reload } = usePaginatedQuery(
    fetchPage,
    [data.allocations.length]
  );

  const validateAllocation = () => {
    if (vehicleOptions.length === 0) {
      setFormError('Add at least one vehicle before allocating.');
      return false;
    }

    if (driverOptions.length === 0) {
      setFormError('Add at least one driver before allocating.');
      return false;
    }

    if (!allocation.vehicleId) {
      setFormError('Select a vehicle.');
      return false;
    }

    if (!allocation.driverId) {
      setFormError('Select a driver.');
      return false;
    }

    if (!allocation.date) {
      setFormError('Choose an allocation date.');
      return false;
    }

    const alreadyBooked = data.allocations.some(
      (item) => item.vehicleId === allocation.vehicleId && item.date === allocation.date
    );

    if (alreadyBooked) {
      setFormError('This vehicle is already allocated for the selected date.');
      return false;
    }

    const driverBooked = data.allocations.some(
      (item) => item.driverId === allocation.driverId && item.date === allocation.date
    );

    if (driverBooked) {
      setFormError('This driver is already allocated for the selected date.');
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleAllocateClick = () => {
    if (!validateAllocation()) {
      return;
    }

    setPendingAllocation({
      id: `alloc-${Date.now()}`,
      vehicleId: allocation.vehicleId!,
      driverId: allocation.driverId!,
      date: allocation.date!
    });
    setConfirmOpen(true);
  };

  const handleConfirmAllocate = () => {
    if (!pendingAllocation) {
      return;
    }

    addAllocation(pendingAllocation);
    setAllocation({ vehicleId: '', driverId: '', date: '' });
    setPendingAllocation(null);
    setConfirmOpen(false);
    showToast('Vehicle allocated successfully.', 'success');
    reload();
  };

  const calendarAllocations = useMemo(
    () => fetchAllocationsByMonth(data, calendarMonth),
    [calendarMonth, data]
  );

  const selectedDriver = selectedAllocation
    ? data.drivers.find((driver) => driver.id === selectedAllocation.driverId)
    : undefined;
  const selectedVehicleDetails = selectedAllocation
    ? data.vehicles.find((vehicle) => vehicle.id === selectedAllocation.vehicleId)
    : undefined;

  const handleCalendarChipClick = (item: AllocationListItem) => {
    setSelectedAllocation(item);
    setDetailDialogOpen(true);
  };

  const calendarDays = useMemo(() => {
    const [year, month] = calendarMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return `${calendarMonth}-${day}`;
    });
  }, [calendarMonth]);

  const columns = useMemo<Array<DataTableColumn<AllocationListItem>>>(
    () => [
      { key: 'id', header: 'Allocation ID', render: (row) => row.id },
      { key: 'vehicle', header: 'Vehicle', render: (row) => row.vehicleRegistration },
      { key: 'type', header: 'Vehicle Type', render: (row) => row.vehicleType },
      { key: 'driver', header: 'Driver', render: (row) => row.driverName },
      { key: 'date', header: 'Date', render: (row) => row.date }
    ],
    []
  );

  const selectedVehicle = data.vehicles.find((vehicle) => vehicle.id === pendingAllocation?.vehicleId);
  const selectedDriverForConfirm = data.drivers.find((driver) => driver.id === pendingAllocation?.driverId);

  return (
    <div className="vehicle-allocation">
      <h1>Vehicle Allocation</h1>

      <section className="page-card vehicle-allocation__section">
        <h4>Allocate Vehicle</h4>

        {vehicleOptions.length === 0 || driverOptions.length === 0 ? (
          <EmptyState
            title="Setup required"
            message="Add drivers and vehicles in Master Data before creating allocations."
          />
        ) : (
          <>
            <div className="vehicle-allocation__form">
              <SelectField
                label="Vehicle"
                value={allocation.vehicleId ?? ''}
                onChange={(value) => setAllocation({ ...allocation, vehicleId: value })}
                options={vehicleOptions}
                placeholder="Select vehicle"
              />
              <SelectField
                label="Driver"
                value={allocation.driverId ?? ''}
                onChange={(value) => setAllocation({ ...allocation, driverId: value })}
                options={driverOptions}
                placeholder="Select driver"
              />
              <DateField
                label="Date"
                value={allocation.date ?? ''}
                onChange={(value) => setAllocation({ ...allocation, date: value })}
              />
              <div className="vehicle-allocation__submit">
                <Button variant="primary" onClick={handleAllocateClick}>
                  Allocate
                </Button>
              </div>
            </div>
            {formError ? (
              <p className="form-field__error" role="alert">
                {formError}
              </p>
            ) : null}
          </>
        )}
      </section>

      <section className="page-card vehicle-allocation__calendar">
        <div className="section-header">
          <h4>Allocation Calendar</h4>
          <input
            className="input-control vehicle-allocation__month"
            type="month"
            value={calendarMonth}
            onChange={(event) => setCalendarMonth(event.target.value)}
            aria-label="Select calendar month"
          />
        </div>
        <div className="allocation-calendar">
          {calendarDays.map((date) => {
            const dayAllocations = calendarAllocations.filter((item) => item.date === date);
            return (
              <div
                key={date}
                className={`allocation-calendar__day${dayAllocations.length ? ' allocation-calendar__day--active' : ''}`}
              >
                <strong>{date.slice(-2)}</strong>
                {dayAllocations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="allocation-calendar__chip"
                    onClick={() => handleCalendarChipClick(item)}
                    aria-label={`View allocation for ${item.driverName} on ${item.date}`}
                  >
                    {item.vehicleRegistration} · {item.driverName}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="vehicle-allocation__list page-card page-card--flush">
        <div className="section-header vehicle-allocation__list-header">
          <h4>Allocations</h4>
        </div>

        <AsyncPanel loading={loading} error={listError}>
          <DataTable
            columns={columns}
            rows={records}
            rowKey={(row) => row.id}
            emptyTitle="No allocations yet"
            emptyMessage="Create your first vehicle allocation using the form above."
          />
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </AsyncPanel>
      </section>

      <InfoDialog
        open={detailDialogOpen}
        title={selectedDriver ? `${selectedDriver.name} - allocation details` : 'Allocation details'}
        message={
          selectedAllocation ? (
            <>
              <p>
                <strong>Date:</strong> {selectedAllocation.date}
              </p>
              <p>
                <strong>Vehicle:</strong> {selectedVehicleDetails?.registration ?? selectedAllocation.vehicleRegistration} (
                {selectedVehicleDetails?.type ?? selectedAllocation.vehicleType})
              </p>
              <p>
                <strong>License:</strong> {selectedDriver?.license ?? '-'}
              </p>
              <p>
                <strong>Phone:</strong> {selectedDriver?.phone ?? '-'}
              </p>
            </>
          ) : null
        }
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedAllocation(null);
        }}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm allocation?"
        message={
          pendingAllocation ? (
            <p>
              Assign <strong>{selectedVehicle?.registration}</strong> to <strong>{selectedDriverForConfirm?.name}</strong> on{' '}
              <strong>{pendingAllocation.date}</strong>?
            </p>
          ) : null
        }
        confirmLabel="Allocate"
        cancelLabel="Cancel"
        onConfirm={handleConfirmAllocate}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingAllocation(null);
        }}
      />
    </div>
  );
};

export default VehicleAllocation;
