# Technical Decisions

## React + TypeScript + Vite

- **React 19** for component model and ecosystem
- **TypeScript** for typed domain models (`Order`, `Hub`, `Shift`, etc.)
- **Vite** for fast HMR, simple config, and Vitest integration

## State: Context + Reducer (not Redux/Zustand)

Assignment scope is a single SPA with moderate shared state. Context keeps dependencies minimal while `useReducer` gives predictable mutations for orders, inventory, and GPS updates.

## Mock API: simulated responses (Option 3+)

No backend is provided. We use:

- In-memory reducer state as source of truth
- `simulateApiResponse` in `lib/api.ts` for realistic delays
- Query helpers in `adminData.ts` / `driverData.ts` for pagination and search

This separates **reads** (API-shaped) from **writes** (direct context actions).

## Leaflet for maps

- Open-source, no API key required
- Imperative Leaflet integration (`lib/leafletMap.ts` + `LeafletMapView`) instead of `react-leaflet`, for reliable cleanup with React 19 StrictMode
- Bengaluru coordinates in seed data
- Fixed default marker icons for Vite bundling (`lib/leafletIcon.ts`)

## Pagination over virtualization

All tables use `PAGE_SIZE = 5` with server-style pagination. Datasets are small enough that virtualization is not required; tables stay accessible and simple.

## localStorage persistence

Assignment requires session persistence, not necessarily cross-session durability. Versioned localStorage lets us ship updated seed data (e.g. Bengaluru coordinates) without manual cache clears.

## UI conventions

- Blue header with segmented Home/Admin/Driver toggle
- White login page (header stays blue)
- Shared `StatusBadge`, `ToastProvider`, `PromptDialog`
- `ConfirmDialog` for destructive/important actions

## Testing strategy

- Unit tests for `adminData`, `validation`, `authRedirect`, order filters
- Component tests for auth shell (login, header, protected routes)
- Shared `createMockAppContext` test factory
- Coverage via `npm run coverage` (install `@vitest/coverage-v8` if needed)

## Known trade-offs

| Choice | Trade-off |
|--------|-----------|
| Context for all data | Large apps would split auth/data contexts further |
| Simulated API reads | No true network error simulation on reads |
| Calendar view | Month grid, not full drag-and-drop scheduler |
| GPS simulation | Cycles through preset Bengaluru waypoints |

## Assignment coverage summary

| Requirement | Implementation |
|-------------|----------------|
| Master data CRUD | Create + edit + product management |
| Order assign + filters | Assign column + status filter |
| Double-booking | Vehicle + driver date checks |
| Fleet map filters/refresh | Driver/vehicle/status + 30s interval |
| Driver GPS + map | LiveMap with Send GPS Update |
| End shift + history | ShiftView + ShiftHistory route |
| Inventory on complete | `COMPLETE_ORDER` reducer |
| Fail reason | `PromptDialog` + `failureReason` field |
| Toasts | `ToastProvider` |
| Docs + README | This folder + root README |
