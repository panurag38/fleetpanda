import L from 'leaflet';
import { BANGALORE_CENTER, BANGALORE_CITY_ZOOM } from './mapBounds';

export interface LeafletMarkerDef {
  id: string;
  position: [number, number];
  popupHtml: string;
}

export interface LeafletMapOptions {
  center: [number, number];
  zoom: number;
  minZoom?: number;
  maxBounds?: L.LatLngBoundsExpression;
  maxBoundsViscosity?: number;
  scrollWheelZoom?: boolean;
}

type LeafletContainer = HTMLElement & { _leaflet_id?: number };

export const clearLeafletContainer = (container: HTMLElement) => {
  const target = container as LeafletContainer;
  container.replaceChildren();
  delete target._leaflet_id;
};

export const createLeafletMap = (container: HTMLElement, options: LeafletMapOptions): L.Map => {
  clearLeafletContainer(container);

  return L.map(container, {
    center: options.center,
    zoom: options.zoom,
    minZoom: options.minZoom,
    maxBounds: options.maxBounds,
    maxBoundsViscosity: options.maxBoundsViscosity,
    scrollWheelZoom: options.scrollWheelZoom ?? true
  });
};

export const addBaseTileLayer = (map: L.Map) => {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
};

export const destroyLeafletMap = (map: L.Map | null, container: HTMLElement | null) => {
  if (map) {
    map.remove();
  }

  if (container) {
    clearLeafletContainer(container);
  }
};

export const fitMapToPositions = (map: L.Map, positions: [number, number][]) => {
  if (positions.length === 0) {
    map.setView(BANGALORE_CENTER, BANGALORE_CITY_ZOOM);
    return;
  }

  if (positions.length === 1) {
    map.setView(positions[0], BANGALORE_CITY_ZOOM);
    return;
  }

  const bounds = L.latLngBounds(positions);
  map.fitBounds(bounds, { padding: [48, 48], maxZoom: BANGALORE_CITY_ZOOM });
};

export interface LeafletOverlayState {
  markerGroup: L.LayerGroup | null;
  polyline: L.Polyline | null;
}

export const createOverlayState = (): LeafletOverlayState => ({
  markerGroup: null,
  polyline: null
});

export const resetMapOverlays = (map: L.Map, state: LeafletOverlayState) => {
  if (state.markerGroup) {
    state.markerGroup.clearLayers();
    state.markerGroup.remove();
    state.markerGroup = null;
  }

  if (state.polyline) {
    state.polyline.remove();
    state.polyline = null;
  }
};

export const updateMapOverlays = (
  map: L.Map,
  state: LeafletOverlayState,
  markers: LeafletMarkerDef[],
  polyline?: [number, number][]
) => {
  if (!state.markerGroup) {
    state.markerGroup = L.layerGroup().addTo(map);
  }

  state.markerGroup.clearLayers();

  markers.forEach((definition) => {
    const marker = L.marker(definition.position);
    if (definition.popupHtml) {
      marker.bindPopup(definition.popupHtml);
    }
    state.markerGroup!.addLayer(marker);
  });

  if (state.polyline) {
    state.polyline.remove();
    state.polyline = null;
  }

  if (polyline && polyline.length >= 2) {
    state.polyline = L.polyline(polyline, {
      color: '#2563eb',
      weight: 4,
      dashArray: '8 8'
    }).addTo(map);
  }
};
