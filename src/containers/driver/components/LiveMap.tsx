import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { useToast } from '../../../context/ToastContext';
import { resolveDriverId } from '../../../lib/driverData';
import { getDestinationDetails } from '../../../lib/locations';
import { BANGALORE_CENTER, BANGALORE_CITY_ZOOM, BANGALORE_MAX_BOUNDS } from '../../../lib/mapBounds';
import type { LeafletMarkerDef } from '../../../lib/leafletMap';
import { Button, LeafletMapView } from '../../common/ui';
import './LiveMap.css';

const GPS_POINTS = [
  { lat: 12.975, lng: 77.6063 },
  { lat: 12.968, lng: 77.612 },
  { lat: 12.962, lng: 77.619 },
  { lat: 12.955, lng: 77.625 }
];

const LiveMap = () => {
  const { data, user, sendGpsUpdate } = useAppContext();
  const { showToast } = useToast();
  const driverId = resolveDriverId(user, data);
  const [gpsIndex, setGpsIndex] = useState(0);
  const today = new Date().toISOString().slice(0, 10);

  const allocation = useMemo(
    () => data.allocations.find((item) => item.driverId === driverId && item.date === today),
    [data.allocations, driverId, today]
  );

  const vehicleLocation = useMemo(
    () => data.vehicleLocations.find((location) => location.vehicleId === allocation?.vehicleId),
    [allocation?.vehicleId, data.vehicleLocations]
  );

  const assignedOrders = useMemo(
    () =>
      data.orders.filter(
        (order) =>
          order.assignedDriverId === driverId &&
          order.status !== 'completed' &&
          order.status !== 'failed'
      ),
    [data.orders, driverId]
  );

  const destinations = useMemo(
    () =>
      assignedOrders
        .map((order) => {
          const details = getDestinationDetails(data, order.destinationId);
          return details.coordinates
            ? { orderId: order.id, name: details.name, address: details.address, ...details.coordinates }
            : null;
        })
        .filter((item): item is { orderId: string; name: string; address: string; lat: number; lng: number } => Boolean(item)),
    [assignedOrders, data]
  );

  const routeLine = useMemo<[number, number][]>(() => {
    if (!vehicleLocation || destinations.length === 0) {
      return [];
    }

    return [
      [vehicleLocation.lat, vehicleLocation.lng],
      [destinations[0].lat, destinations[0].lng]
    ];
  }, [destinations, vehicleLocation]);

  const mapPositions = useMemo(() => {
    const points: [number, number][] = [];
    if (vehicleLocation) {
      points.push([vehicleLocation.lat, vehicleLocation.lng]);
    }
    destinations.forEach((destination) => points.push([destination.lat, destination.lng]));
    return points.length > 0 ? points : [BANGALORE_CENTER];
  }, [destinations, vehicleLocation]);

  const markers = useMemo<LeafletMarkerDef[]>(() => {
    const nextMarkers: LeafletMarkerDef[] = [];

    if (vehicleLocation) {
      nextMarkers.push({
        id: 'driver-vehicle',
        position: [vehicleLocation.lat, vehicleLocation.lng],
        popupHtml: `Your vehicle<br />Status: ${vehicleLocation.status}`
      });
    }

    destinations.forEach((destination) => {
      nextMarkers.push({
        id: `destination-${destination.orderId}`,
        position: [destination.lat, destination.lng],
        popupHtml: `Destination: ${destination.name}<br />Order ${destination.orderId}<br />${destination.address}`
      });
    });

    return nextMarkers;
  }, [destinations, vehicleLocation]);

  useEffect(() => {
    setGpsIndex(0);
  }, [allocation?.vehicleId]);

  const handleGpsUpdate = () => {
    if (!allocation?.vehicleId) {
      showToast('No vehicle allocation found for today.', 'error');
      return;
    }

    const point = GPS_POINTS[gpsIndex % GPS_POINTS.length];
    sendGpsUpdate(allocation.vehicleId, point.lat, point.lng);
    setGpsIndex((current) => current + 1);
    showToast('GPS location updated.', 'success');
  };

  if (!driverId) {
    return (
      <div>
        <h1>Driver Live Map</h1>
        <p className="muted">No driver profile linked to this account.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Driver Live Map</h1>
      <p className="muted live-map-subtitle">Your current position and assigned delivery destinations</p>

      <div className="live-map-actions">
        <Button variant="primary" onClick={handleGpsUpdate}>
          Send GPS Update
        </Button>
      </div>

      <div className="page-card live-map-panel">
        <LeafletMapView
          containerClassName="live-map-container"
          center={BANGALORE_CENTER}
          zoom={BANGALORE_CITY_ZOOM}
          minZoom={11}
          maxBounds={BANGALORE_MAX_BOUNDS}
          maxBoundsViscosity={0.85}
          scrollWheelZoom
          positions={mapPositions}
          markers={markers}
          polyline={routeLine.length === 2 ? routeLine : undefined}
        />
      </div>
    </div>
  );
};

export default LiveMap;
