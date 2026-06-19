# FleetPanda

Fleet tracking platform frontend built with React, TypeScript, and Vite.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts

| Role   | Username | Password   |
|--------|----------|------------|
| Admin  | `admin`  | `admin123` |
| Driver | `driver` | `driver123` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run coverage` | Generate coverage report (requires `@vitest/coverage-v8`) |

## Testing

Coverage is intentionally focused on domain logic (`adminData`, validation, auth) and auth shell components. Admin/driver page components rely on manual demo testing; run `npm run coverage` for the full report.

## Key workflows

### Admin
1. **Master Data** - create/edit hubs, terminals, drivers, vehicles, products
2. **Orders** - create orders, filter by status, assign drivers
3. **Vehicle Allocation** - allocate vehicles with double-booking prevention + calendar view
4. **Live Fleet Map** - Bengaluru map with filters and 30s auto-refresh
5. **Inventory** - stock levels with low/critical alerts and search

### Driver
1. **Overview** - today's shift card with Start/End shift
2. **Shift View** - active shifts and shift actions
3. **Shift History** - completed shifts
4. **Live Map** - GPS simulation, destination markers, route line
5. **Deliveries** - complete/fail with inventory update and failure reason

## Tech stack

- React 19 + TypeScript
- Vite 5
- React Router 6
- Leaflet (imperative integration via `LeafletMapView`)
- Context API for state
- Vitest + Testing Library

## Project structure

```
src/
  containers/     # Page-level UI (admin, driver, common)
  context/        # AppContext + ToastContext
  data/           # Seed data
  hooks/          # Shared hooks
  lib/            # Data helpers, API simulation, validation
  routes.ts       # Route definitions
  types.ts        # TypeScript interfaces
docs/             # Architecture documentation
```

## Data persistence

Session data is stored in `localStorage` (`fleetpanda_app_data`, versioned). Clear storage or bump `APP_DATA_VERSION` in `src/data/constants.ts` to reset seed data.

## Documentation

- [Component hierarchy](docs/COMPONENTS.md)
- [State management](docs/STATE_MANAGEMENT.md)
- [Technical decisions](docs/DECISIONS.md)
