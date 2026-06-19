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


#Screenshots
<img width="1637" height="961" alt="Screenshot 2026-06-19 at 5 52 59 PM" src="https://github.com/user-attachments/assets/caccbf14-0be6-4e0f-ab0d-566154255ac1" />
<img width="1637" height="932" alt="Screenshot 2026-06-19 at 5 52 48 PM" src="https://github.com/user-attachments/assets/a2766a7f-04d8-42e3-8eb8-ac8889638094" />
<img width="1637" height="959" alt="Screenshot 2026-06-19 at 5 52 40 PM" src="https://github.com/user-attachments/assets/446102af-65e4-4b4b-a923-ef5456b948e0" />
<img width="1637" height="952" alt="Screenshot 2026-06-19 at 5 52 34 PM" src="https://github.com/user-attachments/assets/a3dea706-b0b9-4f00-a5fe-e96e4867db7c" />
<img width="1637" height="961" alt="Screenshot 2026-06-19 at 5 52 26 PM" src="https://github.com/user-attachments/assets/8f031ca7-db90-4079-8ed2-4e7eacce8542" />
<img width="1637" height="955" alt="Screenshot 2026-06-19 at 5 52 18 PM" src="https://github.com/user-attachments/assets/c28cc459-482b-49a5-9c85-33e311442127" />
<img width="1637" height="954" alt="Screenshot 2026-06-19 at 5 52 07 PM" src="https://github.com/user-attachments/assets/8c39ec38-f18e-407a-87e1-028e5bfabc68" />
<img width="1637" height="953" alt="Screenshot 2026-06-19 at 5 51 58 PM" src="https://github.com/user-attachments/assets/903ccb96-9b85-4c1f-a2c6-cab7d6e49e67" />
<img width="1637" height="952" alt="Screenshot 2026-06-19 at 5 51 51 PM" src="https://github.com/user-attachments/assets/69029bd3-3ca1-474c-b20c-975fe9228b30" />
<img width="1637" height="959" alt="Screenshot 2026-06-19 at 5 51 36 PM" src="https://github.com/user-attachments/assets/273e2317-6e11-4416-9d6e-15bcd1fa5a0a" />
<img width="1637" height="947" alt="Screenshot 2026-06-19 at 5 51 10 PM" src="https://github.com/user-attachments/assets/c07bbe31-9c35-4f79-85e1-9e885e2150a5" />
<img width="1637" height="955" alt="Screenshot 2026-06-19 at 5 50 59 PM" src="https://github.com/user-attachments/assets/e29c8af3-8fd7-4a8e-9388-6795d405f51d" />
<img width="1637" height="955" alt="Screenshot 2026-06-19 at 5 50 51 PM" src="https://github.com/user-attachments/assets/a3cedbcf-39e2-4c35-a974-cd311c4ea856" />
<img width="1637" height="791" alt="Screenshot 2026-06-19 at 5 50 38 PM" src="https://github.com/user-attachments/assets/27649958-460c-4b65-b985-33553036c4fd" />
<img width="1637" height="956" alt="Screenshot 2026-06-19 at 5 50 16 PM" src="https://github.com/user-attachments/assets/9e08a082-02e9-40e0-a3ce-6b823c35a5a9" />
<img width="1637" height="956" alt="Screenshot 2026-06-19 at 5 50 08 PM" src="https://github.com/user-attachments/assets/d1f56b17-c482-49a8-9ddc-73691d121f9c" />
<img width="1637" height="952" alt="Screenshot 2026-06-19 at 5 49 48 PM" src="https://github.com/user-attachments/assets/211d6123-3e80-4aee-a46b-de4d1c929750" />
