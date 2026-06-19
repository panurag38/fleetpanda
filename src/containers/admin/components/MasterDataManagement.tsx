import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { fetchMasterDataRecordsApi } from '../../../lib/api';
import type { MasterDataRecord, MasterDataRecordKey } from '../../../lib/adminData';
import { validateName } from '../../../lib/validation';
import type { Driver, Hub, Terminal, Vehicle } from '../../../types';
import {
  Button,
  ConfirmDialog,
  DataTable,
  LazyRecordCard,
  Pagination,
  SearchInput,
  TextField,
  type DataTableColumn
} from '../../common/ui';
import { PlusIcon, ShieldIcon, TruckIcon, UserIcon } from '../../common/ui/icons';
import './MasterDataManagement.css';

const PAGE_SIZE = 5;

const emptyHub: Hub = {
  id: '',
  name: '',
  type: 'hub',
  address: '',
  coordinates: { lat: 0, lng: 0 },
  inventory: { diesel: 0, petrol: 0 }
};

const emptyTerminal: Terminal = {
  id: '',
  name: '',
  type: 'terminal',
  address: '',
  coordinates: { lat: 0, lng: 0 },
  inventory: { diesel: 0, petrol: 0 }
};

const emptyDriver: Driver = { id: '', name: '', license: '', phone: '' };
const emptyVehicle: Vehicle = { id: '', registration: '', capacity: 0, type: 'Tanker' };

type SubmitType = 'hub' | 'terminal' | 'driver' | 'vehicle';

interface RecordPanelState {
  expanded: boolean;
  loading: boolean;
  error: string | null;
  page: number;
  total: number;
  totalPages: number;
  rows: MasterDataRecord[];
}

const initialPanelState = (): RecordPanelState => ({
  expanded: false,
  loading: false,
  error: null,
  page: 1,
  total: 0,
  totalPages: 1,
  rows: []
});

const MasterDataManagement = () => {
  const {
    data,
    addHub,
    updateHub,
    addTerminal,
    updateTerminal,
    addDriver,
    updateDriver,
    addVehicle,
    updateVehicle,
    addProduct
  } = useAppContext();
  const { showToast } = useToast();
  const [productName, setProductName] = useState('');
  const [productError, setProductError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ type: SubmitType; id: string } | null>(null);
  const [hub, setHub] = useState<Hub>(emptyHub);
  const [terminal, setTerminal] = useState<Terminal>(emptyTerminal);
  const [driver, setDriver] = useState<Driver>(emptyDriver);
  const [vehicle, setVehicle] = useState<Vehicle>(emptyVehicle);
  const [formErrors, setFormErrors] = useState<Partial<Record<SubmitType, string>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<SubmitType | null>(null);
  const [panels, setPanels] = useState<Record<MasterDataRecordKey, RecordPanelState>>({
    hubs: initialPanelState(),
    terminals: initialPanelState(),
    drivers: initialPanelState(),
    vehicles: initialPanelState()
  });
  const [panelQueries, setPanelQueries] = useState<Record<MasterDataRecordKey, string>>({
    hubs: '',
    terminals: '',
    drivers: '',
    vehicles: ''
  });
  const formSectionRefs = useRef<Record<SubmitType, HTMLElement | null>>({
    hub: null,
    terminal: null,
    driver: null,
    vehicle: null
  });

  useEffect(() => {
    if (!editing) {
      return;
    }

    const target = formSectionRefs.current[editing.type];
    if (!target) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  }, [editing]);

  const counts = useMemo(
    () => ({
      hubs: data.hubs.length,
      terminals: data.terminals.length,
      drivers: data.drivers.length,
      vehicles: data.vehicles.length
    }),
    [data.drivers.length, data.hubs.length, data.terminals.length, data.vehicles.length]
  );

  const panelAbortRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      panelAbortRef.current?.abort();
    },
    []
  );

  const loadPanel = useCallback(
    async (recordType: MasterDataRecordKey, page = 1, forceExpand = true, queryOverride?: string) => {
      panelAbortRef.current?.abort();
      const controller = new AbortController();
      panelAbortRef.current = controller;

      const query = queryOverride ?? panelQueries[recordType];

      setPanels((current) => ({
        ...current,
        [recordType]: {
          ...current[recordType],
          expanded: forceExpand ? true : current[recordType].expanded,
          loading: true,
          error: null
        }
      }));

      try {
        const response = await fetchMasterDataRecordsApi(
          data,
          recordType,
          {
            page,
            pageSize: PAGE_SIZE,
            query
          },
          { signal: controller.signal }
        );

        if (controller.signal.aborted) {
          return;
        }

        if (response.error || !response.data) {
          setPanels((current) => ({
            ...current,
            [recordType]: {
              ...current[recordType],
              loading: false,
              error: response.error ?? 'Unable to load records.',
              rows: [],
              total: 0,
              totalPages: 1,
              page: 1
            }
          }));
          return;
        }

        setPanels((current) => ({
          ...current,
          [recordType]: {
            ...current[recordType],
            loading: false,
            error: null,
            rows: response.data!.items,
            total: response.data!.total,
            totalPages: response.data!.totalPages,
            page: response.data!.page
          }
        }));
      } catch (caught) {
        if (controller.signal.aborted || (caught instanceof DOMException && caught.name === 'AbortError')) {
          return;
        }

        setPanels((current) => ({
          ...current,
          [recordType]: {
            ...current[recordType],
            loading: false,
            error: 'Unable to load records.',
            rows: [],
            total: 0,
            totalPages: 1,
            page: 1
          }
        }));
      }
    },
    [data, panelQueries]
  );

  const validate = (type: SubmitType) => {
    const nextErrors: Partial<Record<SubmitType, string>> = {};

    if (type === 'hub') {
      const nameError = validateName(hub.name, 'Hub name');
      if (nameError) nextErrors.hub = nameError;
      else if (!hub.address.trim()) nextErrors.hub = 'Hub address is required.';
    }

    if (type === 'terminal') {
      const nameError = validateName(terminal.name, 'Terminal name');
      if (nameError) nextErrors.terminal = nameError;
      else if (!terminal.address.trim()) nextErrors.terminal = 'Terminal address is required.';
    }

    if (type === 'driver') {
      const nameError = validateName(driver.name, 'Driver name');
      if (nameError) nextErrors.driver = nameError;
      else if (!driver.license.trim()) nextErrors.driver = 'Driver license is required.';
      else if (!driver.phone.trim()) nextErrors.driver = 'Driver phone is required.';
    }

    if (type === 'vehicle') {
      if (!vehicle.registration.trim()) nextErrors.vehicle = 'Vehicle registration is required.';
      else if (!vehicle.type.trim()) nextErrors.vehicle = 'Vehicle type is required.';
      else if (!vehicle.capacity || vehicle.capacity <= 0) nextErrors.vehicle = 'Vehicle capacity must be greater than zero.';
    }

    setFormErrors(nextErrors);
    return !nextErrors[type];
  };

  const handleSubmitClick = (type: SubmitType) => {
    if (!validate(type)) {
      return;
    }

    setPendingSubmit(type);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!pendingSubmit) {
      return;
    }

    if (pendingSubmit === 'hub') {
      const payload = { ...hub, name: hub.name.trim(), address: hub.address.trim() };
      if (editing?.type === 'hub') {
        updateHub({ ...payload, id: editing.id });
        showToast('Hub updated.', 'success');
      } else {
        addHub({ ...payload, id: `hub-${Date.now()}` });
        showToast('Hub created.', 'success');
      }
      setHub(emptyHub);
      setEditing(null);
      void loadPanel('hubs', 1, panels.hubs.expanded);
    }

    if (pendingSubmit === 'terminal') {
      const payload = { ...terminal, name: terminal.name.trim(), address: terminal.address.trim() };
      if (editing?.type === 'terminal') {
        updateTerminal({ ...payload, id: editing.id });
        showToast('Terminal updated.', 'success');
      } else {
        addTerminal({ ...payload, id: `terminal-${Date.now()}` });
        showToast('Terminal created.', 'success');
      }
      setTerminal(emptyTerminal);
      setEditing(null);
      void loadPanel('terminals', 1, panels.terminals.expanded);
    }

    if (pendingSubmit === 'driver') {
      const payload = {
        ...driver,
        name: driver.name.trim(),
        license: driver.license.trim(),
        phone: driver.phone.trim()
      };
      if (editing?.type === 'driver') {
        updateDriver({ ...payload, id: editing.id });
        showToast('Driver updated.', 'success');
      } else {
        addDriver({ ...payload, id: `driver-${Date.now()}` });
        showToast('Driver created.', 'success');
      }
      setDriver(emptyDriver);
      setEditing(null);
      void loadPanel('drivers', 1, panels.drivers.expanded);
    }

    if (pendingSubmit === 'vehicle') {
      const payload = {
        ...vehicle,
        registration: vehicle.registration.trim(),
        type: vehicle.type.trim()
      };
      if (editing?.type === 'vehicle') {
        updateVehicle({ ...payload, id: editing.id });
        showToast('Vehicle updated.', 'success');
      } else {
        addVehicle({ ...payload, id: `vehicle-${Date.now()}` });
        showToast('Vehicle created.', 'success');
      }
      setVehicle(emptyVehicle);
      setEditing(null);
      void loadPanel('vehicles', 1, panels.vehicles.expanded);
    }

    setPendingSubmit(null);
    setConfirmOpen(false);
    setFormErrors({});
  };

  const cancelEditing = (type: SubmitType) => {
    setEditing((current) => (current?.type === type ? null : current));
    if (type === 'hub') setHub(emptyHub);
    if (type === 'terminal') setTerminal(emptyTerminal);
    if (type === 'driver') setDriver(emptyDriver);
    if (type === 'vehicle') setVehicle(emptyVehicle);
    setFormErrors((current) => ({ ...current, [type]: undefined }));
  };

  const editingBanner = (type: SubmitType) =>
    editing?.type === type ? (
      <div className="editing-banner">
        <span>
          Editing <strong>{editing.id}</strong>
        </span>
        <Button variant="ghost" onClick={() => cancelEditing(type)}>
          Cancel edit
        </Button>
      </div>
    ) : null;

  const startEditing = (type: SubmitType, record: MasterDataRecord) => {
    setEditing({ type, id: record.id });
    if (type === 'hub') setHub(record as Hub);
    if (type === 'terminal') setTerminal(record as Terminal);
    if (type === 'driver') setDriver(record as Driver);
    if (type === 'vehicle') setVehicle(record as Vehicle);
  };

  const editActions = (type: SubmitType, record: MasterDataRecord) => (
    <Button variant="ghost" onClick={() => startEditing(type, record)}>
      Edit
    </Button>
  );

  const hubColumns: Array<DataTableColumn<Hub>> = [
    { key: 'id', header: 'Hub ID', render: (row) => row.id },
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'address', header: 'Address', render: (row) => row.address },
    {
      key: 'coordinates',
      header: 'Coordinates',
      render: (row) => `${row.coordinates.lat}, ${row.coordinates.lng}`
    },
    {
      key: 'inventory',
      header: 'Inventory',
      render: (row) => `Diesel ${row.inventory.diesel?.toLocaleString() ?? 0} · Petrol ${row.inventory.petrol?.toLocaleString() ?? 0}`
    },
    { key: 'actions', header: 'Actions', render: (row) => editActions('hub', row) }
  ];

  const terminalColumns: Array<DataTableColumn<Terminal>> = [
    { key: 'id', header: 'Terminal ID', render: (row) => row.id },
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'address', header: 'Address', render: (row) => row.address },
    {
      key: 'coordinates',
      header: 'Coordinates',
      render: (row) => `${row.coordinates.lat}, ${row.coordinates.lng}`
    },
    {
      key: 'inventory',
      header: 'Inventory',
      render: (row) => `Diesel ${row.inventory.diesel?.toLocaleString() ?? 0} · Petrol ${row.inventory.petrol?.toLocaleString() ?? 0}`
    },
    { key: 'actions', header: 'Actions', render: (row) => editActions('terminal', row) }
  ];

  const driverColumns: Array<DataTableColumn<Driver>> = [
    { key: 'id', header: 'Driver ID', render: (row) => row.id },
    { key: 'name', header: 'Name', render: (row) => row.name },
    { key: 'license', header: 'License', render: (row) => row.license },
    { key: 'phone', header: 'Phone', render: (row) => row.phone },
    { key: 'actions', header: 'Actions', render: (row) => editActions('driver', row) }
  ];

  const vehicleColumns: Array<DataTableColumn<Vehicle>> = [
    { key: 'id', header: 'Vehicle ID', render: (row) => row.id },
    { key: 'registration', header: 'Registration', render: (row) => row.registration },
    { key: 'type', header: 'Type', render: (row) => row.type },
    { key: 'capacity', header: 'Capacity', render: (row) => row.capacity.toLocaleString() },
    { key: 'actions', header: 'Actions', render: (row) => editActions('vehicle', row) }
  ];

  const recordPanels = [
    {
      key: 'hubs' as const,
      title: 'Hubs',
      icon: <ShieldIcon />,
      columns: hubColumns,
      emptyMessage: 'No hubs configured yet.'
    },
    {
      key: 'terminals' as const,
      title: 'Terminals',
      icon: <ShieldIcon />,
      columns: terminalColumns,
      emptyMessage: 'No terminals configured yet.'
    },
    {
      key: 'drivers' as const,
      title: 'Drivers',
      icon: <UserIcon />,
      columns: driverColumns,
      emptyMessage: 'No drivers configured yet.'
    },
    {
      key: 'vehicles' as const,
      title: 'Vehicles',
      icon: <TruckIcon />,
      columns: vehicleColumns,
      emptyMessage: 'No vehicles configured yet.'
    }
  ];

  const confirmMessage = () => {
    const isEdit = editing?.type === pendingSubmit;

    switch (pendingSubmit) {
      case 'hub':
        return isEdit
          ? `Update hub "${hub.name.trim()}" at ${hub.address.trim()}?`
          : `Create hub "${hub.name.trim()}" at ${hub.address.trim()}?`;
      case 'terminal':
        return isEdit
          ? `Update terminal "${terminal.name.trim()}" at ${terminal.address.trim()}?`
          : `Create terminal "${terminal.name.trim()}" at ${terminal.address.trim()}?`;
      case 'driver':
        return isEdit
          ? `Update driver "${driver.name.trim()}" with license ${driver.license.trim()}?`
          : `Create driver "${driver.name.trim()}" with license ${driver.license.trim()}?`;
      case 'vehicle':
        return isEdit
          ? `Update vehicle "${vehicle.registration.trim()}" (${vehicle.type.trim()})?`
          : `Create vehicle "${vehicle.registration.trim()}" (${vehicle.type.trim()})?`;
      default:
        return '';
    }
  };

  const confirmTitle =
    editing?.type === pendingSubmit ? 'Confirm update?' : 'Confirm submission?';

  return (
    <div className="master-data">
      <h1>Master Data Management</h1>

      <section className="page-card master-data-form">
        <h4>Products</h4>
        <TextField
          label="Product name"
          value={productName}
          onChange={setProductName}
          error={productError}
          placeholder="e.g. diesel"
        />
        <div className="form-actions form-actions--end">
          <Button
            variant="primary"
            leadingIcon={<PlusIcon />}
            onClick={() => {
              const normalized = productName.trim().toLowerCase();
              if (!normalized) {
                setProductError('Product name is required.');
                return;
              }
              if (data.products.includes(normalized)) {
                setProductError('Product already exists.');
                return;
              }
              addProduct(normalized);
              setProductName('');
              setProductError(null);
              showToast(`Product "${normalized}" added.`, 'success');
            }}
          >
            Add Product
          </Button>
        </div>
        <p className="muted">Current products: {data.products.join(', ') || 'None'}</p>
      </section>

      <div className="master-data-grid">
        <section
          ref={(element) => {
            formSectionRefs.current.hub = element;
          }}
          className="page-card master-data-form"
        >
          <h4>{editing?.type === 'hub' ? 'Edit Hub' : 'New Hub'}</h4>
          {editingBanner('hub')}
          <TextField label="Name" value={hub.name} onChange={(value) => setHub({ ...hub, name: value })} error={formErrors.hub} />
          <TextField label="Address" value={hub.address} onChange={(value) => setHub({ ...hub, address: value })} />
          <div className="form-grid">
            <TextField label="Latitude" type="number" value={hub.coordinates.lat} onChange={(value) => setHub({ ...hub, coordinates: { ...hub.coordinates, lat: Number(value) } })} />
            <TextField label="Longitude" type="number" value={hub.coordinates.lng} onChange={(value) => setHub({ ...hub, coordinates: { ...hub.coordinates, lng: Number(value) } })} />
          </div>
          <div className="form-actions form-actions--end">
            <Button variant="primary" leadingIcon={<PlusIcon />} onClick={() => handleSubmitClick('hub')}>
              {editing?.type === 'hub' ? 'Update Hub' : 'Add Hub'}
            </Button>
          </div>
        </section>

        <section
          ref={(element) => {
            formSectionRefs.current.terminal = element;
          }}
          className="page-card master-data-form"
        >
          <h4>{editing?.type === 'terminal' ? 'Edit Terminal' : 'New Terminal'}</h4>
          {editingBanner('terminal')}
          <TextField label="Name" value={terminal.name} onChange={(value) => setTerminal({ ...terminal, name: value })} error={formErrors.terminal} />
          <TextField label="Address" value={terminal.address} onChange={(value) => setTerminal({ ...terminal, address: value })} />
          <div className="form-grid">
            <TextField label="Latitude" type="number" value={terminal.coordinates.lat} onChange={(value) => setTerminal({ ...terminal, coordinates: { ...terminal.coordinates, lat: Number(value) } })} />
            <TextField label="Longitude" type="number" value={terminal.coordinates.lng} onChange={(value) => setTerminal({ ...terminal, coordinates: { ...terminal.coordinates, lng: Number(value) } })} />
          </div>
          <div className="form-actions form-actions--end">
            <Button variant="primary" leadingIcon={<PlusIcon />} onClick={() => handleSubmitClick('terminal')}>
              {editing?.type === 'terminal' ? 'Update Terminal' : 'Add Terminal'}
            </Button>
          </div>
        </section>
      </div>

      <div className="master-data-grid">
        <section
          ref={(element) => {
            formSectionRefs.current.driver = element;
          }}
          className="page-card master-data-form"
        >
          <h4>{editing?.type === 'driver' ? 'Edit Driver' : 'New Driver'}</h4>
          {editingBanner('driver')}
          <TextField label="Name" value={driver.name} onChange={(value) => setDriver({ ...driver, name: value })} error={formErrors.driver} />
          <TextField label="License" value={driver.license} onChange={(value) => setDriver({ ...driver, license: value })} />
          <TextField label="Phone" value={driver.phone} onChange={(value) => setDriver({ ...driver, phone: value })} />
          <div className="form-actions form-actions--end">
            <Button variant="primary" leadingIcon={<PlusIcon />} onClick={() => handleSubmitClick('driver')}>
              {editing?.type === 'driver' ? 'Update Driver' : 'Add Driver'}
            </Button>
          </div>
        </section>

        <section
          ref={(element) => {
            formSectionRefs.current.vehicle = element;
          }}
          className="page-card master-data-form"
        >
          <h4>{editing?.type === 'vehicle' ? 'Edit Vehicle' : 'New Vehicle'}</h4>
          {editingBanner('vehicle')}
          <TextField label="Registration" value={vehicle.registration} onChange={(value) => setVehicle({ ...vehicle, registration: value })} error={formErrors.vehicle} />
          <TextField label="Capacity" type="number" min={1} value={vehicle.capacity} onChange={(value) => setVehicle({ ...vehicle, capacity: Number(value) })} />
          <TextField label="Type" value={vehicle.type} onChange={(value) => setVehicle({ ...vehicle, type: value })} />
          <div className="form-actions form-actions--end">
            <Button variant="primary" leadingIcon={<PlusIcon />} onClick={() => handleSubmitClick('vehicle')}>
              {editing?.type === 'vehicle' ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
          </div>
        </section>
      </div>

      <section className="master-data-records-section">
        <h4>Existing Records</h4>
        <div className="master-data-records">
          {recordPanels.map((panel) => {
            const state = panels[panel.key];

            return (
              <LazyRecordCard
                key={panel.key}
                title={panel.title}
                count={counts[panel.key]}
                emptyMessage={panel.emptyMessage}
                icon={panel.icon}
                expanded={state.expanded}
                loading={state.loading}
                error={state.error}
                onOpen={() => void loadPanel(panel.key, 1, true)}
                onRefresh={() => void loadPanel(panel.key, state.page, true)}
                onClose={() =>
                  setPanels((current) => ({
                    ...current,
                    [panel.key]: initialPanelState()
                  }))
                }
                footer={
                  <Pagination
                    page={state.page}
                    totalPages={state.totalPages}
                    total={state.total}
                    pageSize={PAGE_SIZE}
                    onPageChange={(nextPage) => void loadPanel(panel.key, nextPage, true)}
                  />
                }
              >
                <SearchInput
                  label={`Search ${panel.title.toLowerCase()}`}
                  value={panelQueries[panel.key]}
                  onChange={(value) =>
                    setPanelQueries((current) => ({
                      ...current,
                      [panel.key]: value
                    }))
                  }
                  onDebouncedChange={(value) => void loadPanel(panel.key, 1, true, value)}
                  placeholder={`Search ${panel.title.toLowerCase()}`}
                />
                <DataTable
                  columns={panel.columns as Array<DataTableColumn<MasterDataRecord>>}
                  rows={state.rows}
                  rowKey={(row) => row.id}
                  emptyTitle={`No ${panel.title.toLowerCase()} found`}
                  emptyMessage={panel.emptyMessage}
                />
              </LazyRecordCard>
            );
          })}
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage()}
        confirmLabel="Submit"
        cancelLabel="Cancel"
        onConfirm={handleConfirmSubmit}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingSubmit(null);
        }}
      />
    </div>
  );
};

export default MasterDataManagement;
