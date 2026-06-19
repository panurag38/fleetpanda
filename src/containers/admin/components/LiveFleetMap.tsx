import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { fetchFleetLocationsApi } from '../../../lib/api';
import { fetchFleetLocations } from '../../../lib/adminData';
import { BANGALORE_CENTER, BANGALORE_CITY_ZOOM, BANGALORE_MAX_BOUNDS, collectMapPositions } from '../../../lib/mapBounds';
import type { LeafletMarkerDef } from '../../../lib/leafletMap';
import type { VehicleLocation } from '../../../types';
import { RefreshIcon } from '../../common/ui/icons';
import { Button, EmptyState, LeafletMapView, SelectField } from '../../common/ui';
import './LiveFleetMap.css';

const REFRESH_INTERVAL_MS = 30000;

type StatusFilter = VehicleLocation['status'] | 'all';

interface FleetMapFilters {
  driverId: string;
  vehicleId: string;
  status: StatusFilter;
}

const DEFAULT_FILTERS: FleetMapFilters = {
  driverId: 'all',
  vehicleId: 'all',
  status: 'all'
};

const toSearchParams = (filters: FleetMapFilters) => ({
  driverId: filters.driverId === 'all' ? undefined : filters.driverId,
  vehicleId: filters.vehicleId === 'all' ? undefined : filters.vehicleId,
  status: filters.status === 'all' ? undefined : filters.status
});

const hasActiveFilters = (filters: FleetMapFilters) =>
  filters.driverId !== 'all' || filters.vehicleId !== 'all' || filters.status !== 'all';

const LiveFleetMap = () => {
  const { data } = useAppContext();
  const [draftFilters, setDraftFilters] = useState<FleetMapFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<FleetMapFilters>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(() => new Date());
  const [mapEpoch, setMapEpoch] = useState(0);
  const refreshAbortRef = useRef<AbortController | null>(null);
  const refreshIdRef = useRef(0);

  const { driverId, vehicleId, status } = appliedFilters;

  const locations = useMemo(
    () => fetchFleetLocations(data, toSearchParams(appliedFilters)),
    [data.vehicleLocations, data.vehicles, data.drivers, driverId, vehicleId, status]
  );

  const filtersActive = hasActiveFilters(appliedFilters);

  const refreshFleetMap = useCallback(
    async (filters: FleetMapFilters) => {
      refreshAbortRef.current?.abort();
      const controller = new AbortController();
      refreshAbortRef.current = controller;
      const refreshId = ++refreshIdRef.current;

      setIsRefreshing(true);
      setError(null);

      try {
        const response = await fetchFleetLocationsApi(data, toSearchParams(filters), { signal: controller.signal });

        if (refreshId !== refreshIdRef.current) {
          return;
        }

        if (response.error || !response.data) {
          setError(response.error ?? 'Unable to load fleet locations.');
          return;
        }

        setLastRefreshed(new Date());
      } catch (caught) {
        if (refreshId !== refreshIdRef.current) {
          return;
        }

        if (caught instanceof DOMException && caught.name === 'AbortError') {
          return;
        }

        setError('Unable to load fleet locations.');
      } finally {
        if (refreshId === refreshIdRef.current) {
          setIsRefreshing(false);
        }
      }
    },
    [data]
  );

  useEffect(
    () => () => {
      refreshAbortRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    void refreshFleetMap(appliedFilters);
  }, [appliedFilters, refreshFleetMap]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLastRefreshed(new Date());
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setLastRefreshed(new Date());
  }, [data.vehicleLocations]);

  const hasPendingFilters =
    draftFilters.driverId !== appliedFilters.driverId ||
    draftFilters.vehicleId !== appliedFilters.vehicleId ||
    draftFilters.status !== appliedFilters.status;

  const hubMarkers = useMemo<LeafletMarkerDef[]>(
    () =>
      data.hubs.map((hub) => ({
        id: `hub-${hub.id}`,
        position: [hub.coordinates.lat, hub.coordinates.lng] as [number, number],
        popupHtml: `Hub: ${hub.name}<br />${hub.address}`
      })),
    [data.hubs]
  );

  const terminalMarkers = useMemo<LeafletMarkerDef[]>(
    () =>
      data.terminals.map((terminal) => ({
        id: `terminal-${terminal.id}`,
        position: [terminal.coordinates.lat, terminal.coordinates.lng] as [number, number],
        popupHtml: `Terminal: ${terminal.name}<br />${terminal.address}`
      })),
    [data.terminals]
  );

  const vehicleMarkers = useMemo<LeafletMarkerDef[]>(
    () =>
      locations.map((location) => ({
        id: `vehicle-${location.vehicleId}`,
        position: [location.lat, location.lng] as [number, number],
        popupHtml: `Vehicle ${location.vehicleRegistration}<br />Driver ${
          location.driverName ?? location.driverId ?? 'Unassigned'
        }<br />Status ${location.status}`
      })),
    [locations]
  );

  const markers = useMemo<LeafletMarkerDef[]>(
    () => (filtersActive ? vehicleMarkers : [...hubMarkers, ...terminalMarkers, ...vehicleMarkers]),
    [filtersActive, hubMarkers, terminalMarkers, vehicleMarkers]
  );

  const mapPositions = useMemo(
    () =>
      filtersActive
        ? collectMapPositions(locations)
        : collectMapPositions([
            ...locations,
            ...data.hubs.map((hub) => hub.coordinates),
            ...data.terminals.map((terminal) => terminal.coordinates)
          ]),
    [data.hubs, data.terminals, filtersActive, locations]
  );

  const mapInstanceKey = `${mapEpoch}-${driverId}-${vehicleId}-${status}`;

  const driverOptions = useMemo(
    () => [{ value: 'all', label: 'All drivers' }, ...data.drivers.map((driver) => ({ value: driver.id, label: driver.name }))],
    [data.drivers]
  );

  const vehicleOptions = useMemo(
    () => [
      { value: 'all', label: 'All vehicles' },
      ...data.vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.registration }))
    ],
    [data.vehicles]
  );

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'idle', label: 'Idle' },
    { value: 'en_route', label: 'En route' },
    { value: 'delivering', label: 'Delivering' }
  ];

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setMapEpoch((value) => value + 1);
    setError(null);
  };

  const handleResetFilters = () => {
    setDraftFilters({ ...DEFAULT_FILTERS });
    setAppliedFilters({ ...DEFAULT_FILTERS });
    setMapEpoch((value) => value + 1);
    setError(null);
  };

  const handleRefresh = () => {
    void refreshFleetMap(appliedFilters);
  };

  const refreshLabel = lastRefreshed ? lastRefreshed.toLocaleTimeString() : '-';

  return (
    <div className="live-fleet-map">
      <div className="live-map-header">
        <div>
          <h1>Live Fleet Map</h1>
          <p className="muted live-map-subtitle">
            Showing {locations.length} vehicle{locations.length === 1 ? '' : 's'}
            {filtersActive ? ' (filtered)' : ''}
            {isRefreshing ? ' · Updating…' : ` · Last refreshed ${refreshLabel}`}
          </p>
        </div>
        <Button variant="ghost" leadingIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isRefreshing}>
          Refresh
        </Button>
      </div>

      <div className="live-map-filters page-card">
        <SelectField
          label="Driver"
          value={draftFilters.driverId}
          onChange={(value) => setDraftFilters((current) => ({ ...current, driverId: value }))}
          options={driverOptions}
        />
        <SelectField
          label="Vehicle"
          value={draftFilters.vehicleId}
          onChange={(value) => setDraftFilters((current) => ({ ...current, vehicleId: value }))}
          options={vehicleOptions}
        />
        <SelectField
          label="Status"
          value={draftFilters.status}
          onChange={(value) => setDraftFilters((current) => ({ ...current, status: value as StatusFilter }))}
          options={statusOptions}
        />
        <div className="live-map-filter-actions">
          <Button variant="primary" onClick={handleApplyFilters} disabled={isRefreshing || !hasPendingFilters}>
            Apply filters
          </Button>
          <Button variant="ghost" onClick={handleResetFilters} disabled={isRefreshing}>
            Reset
          </Button>
        </div>
      </div>

      <div className="page-card live-map-panel" aria-busy={isRefreshing || undefined} aria-live="polite">
        {error && locations.length === 0 ? (
          <EmptyState title="Unable to load fleet map" message={error} />
        ) : (
          <LeafletMapView
            key={mapInstanceKey}
            containerClassName="live-map-container"
            center={BANGALORE_CENTER}
            zoom={BANGALORE_CITY_ZOOM}
            minZoom={11}
            maxBounds={BANGALORE_MAX_BOUNDS}
            maxBoundsViscosity={0.85}
            scrollWheelZoom
            positions={mapPositions}
            markers={markers}
          />
        )}
      </div>
    </div>
  );
};

export default LiveFleetMap;
