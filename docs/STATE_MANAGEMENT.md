# State Management

## Overview

FleetPanda uses **React Context API** with a **useReducer** pattern for application data. Authentication is managed with separate `useState` in the same provider.

## AppContext

### State shape (`AppData`)

- `hubs`, `terminals` - locations with coordinates and inventory
- `drivers`, `vehicles` - fleet resources
- `products` - available fuel products
- `orders` - delivery orders with status and optional `failureReason`
- `allocations` - vehicle-to-driver date assignments
- `shifts` - driver shift records
- `vehicleLocations` - live GPS positions for map

### Actions (reducer)

| Action | Effect |
|--------|--------|
| `ADD_*` / `UPDATE_*` | Master data mutations |
| `ADD_ORDER` | Create order |
| `UPDATE_ORDER` | Assign driver, fail with reason |
| `COMPLETE_ORDER` | Mark completed + increment destination inventory |
| `ADD_ALLOCATION` | New vehicle allocation |
| `UPSERT_VEHICLE_LOCATION` | GPS updates |
| `UPDATE_SHIFT_STATUS` | Start/end shift |

### Public API (context methods)

```ts
addHub, updateHub, addTerminal, updateTerminal
addDriver, updateDriver, addVehicle, updateVehicle
addProduct, addOrder, assignOrder
addAllocation, completeOrder, failOrder
startShift, updateShiftStatus, endShift
sendGpsUpdate, login, logout
```

## Persistence

- **Auth**: `localStorage` key `fleetpanda_current_user`
- **App data**: `localStorage` key `fleetpanda_app_data` with version `APP_DATA_VERSION` (see `src/data/constants.ts`)
- On version mismatch, seed data from `APP_SEED_DATA` in `src/data/initialData.ts` is restored

## ToastContext

Separate lightweight context for success/error/info notifications. Used after mutations (complete delivery, allocate vehicle, etc.).

## Data flow pattern

```
Component → context method → reducer → persisted AppData
         → simulateApiResponse (read paths) → paginated UI refresh
```

Read paths (tables) use simulated APIs in `lib/api.ts` that query the current `data` snapshot from context, keeping UI code decoupled from reducer internals.

## Auth flow

1. `loginApi` validates against `initialUsers`
2. User stored in context + localStorage
3. `ProtectedRoute` guards role-based routes
4. `authRedirect.ts` resolves safe post-login navigation

## Real-time map updates

Driver `sendGpsUpdate` dispatches `UPSERT_VEHICLE_LOCATION`. Admin `LiveFleetMap` reads `data.vehicleLocations` and auto-refreshes every 30 seconds.
