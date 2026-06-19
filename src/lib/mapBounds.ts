export const BANGALORE_CENTER: [number, number] = [12.9716, 77.5946];

/** Zoom level that keeps the view on Bengaluru city rather than the wider metro. */
export const BANGALORE_CITY_ZOOM = 13;

/** Rough bounding box around Bengaluru city limits. */
export const BANGALORE_MAX_BOUNDS: [[number, number], [number, number]] = [
  [12.79, 77.42],
  [13.05, 77.78]
];

export const collectMapPositions = (points: Array<{ lat: number; lng: number }>): [number, number][] =>
  points.map((point) => [point.lat, point.lng]);
