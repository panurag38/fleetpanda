import { useEffect, useRef, type CSSProperties } from 'react';
import type L from 'leaflet';
import {
  addBaseTileLayer,
  createLeafletMap,
  createOverlayState,
  destroyLeafletMap,
  fitMapToPositions,
  resetMapOverlays,
  updateMapOverlays,
  type LeafletMapOptions,
  type LeafletMarkerDef
} from '../../../lib/leafletMap';
import '../../../lib/leafletIcon';
import 'leaflet/dist/leaflet.css';

export interface LeafletMapViewProps extends LeafletMapOptions {
  containerClassName?: string;
  positions: [number, number][];
  markers?: LeafletMarkerDef[];
  polyline?: [number, number][];
  style?: CSSProperties;
}

export const LeafletMapView = ({
  containerClassName = 'leaflet-map-shell',
  positions,
  markers = [],
  polyline,
  style,
  center,
  zoom,
  minZoom,
  maxBounds,
  maxBoundsViscosity,
  scrollWheelZoom
}: LeafletMapViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef(createOverlayState());
  const mapOptionsRef = useRef({
    center,
    zoom,
    minZoom,
    maxBounds,
    maxBoundsViscosity,
    scrollWheelZoom
  });

  mapOptionsRef.current = {
    center,
    zoom,
    minZoom,
    maxBounds,
    maxBoundsViscosity,
    scrollWheelZoom
  };

  const markersKey = markers.map((marker) => `${marker.id}:${marker.position.join(',')}`).join('|');
  const positionsKey = positions.map((point) => point.join(',')).join('|');
  const polylineKey = polyline?.map((point) => point.join(',')).join('|') ?? '';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const options = mapOptionsRef.current;
    const map = createLeafletMap(container, options);
    addBaseTileLayer(map);
    mapRef.current = map;
    overlayRef.current = createOverlayState();

    return () => {
      destroyLeafletMap(mapRef.current, container);
      mapRef.current = null;
      overlayRef.current = createOverlayState();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    resetMapOverlays(map, overlayRef.current);
    updateMapOverlays(map, overlayRef.current, markers, polyline);
    fitMapToPositions(map, positions);

    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [markers, markersKey, polyline, polylineKey, positions, positionsKey]);

  const mapStyle: CSSProperties = { height: '100%', width: '100%', ...style };

  return (
    <div className={containerClassName}>
      <div ref={containerRef} className="leaflet-map-viewport" style={mapStyle} />
    </div>
  );
};
