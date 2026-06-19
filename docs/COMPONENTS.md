# Component Hierarchy

## App shell

```
App
├── AppProvider (data + auth)
├── ToastProvider (notifications)
├── ErrorBoundary
└── AppContent
    ├── AppHeader (brand, workspace toggle, greeting, logout)
    └── Routes
        ├── HomePage
        ├── LoginPage
        ├── AdminDashboard
        └── DriverInterface
```

## Admin dashboard

```
AdminDashboard
├── AdminOverview        # Metrics + drill-down tables
├── MasterDataManagement # CRUD forms + lazy record panels
├── OrderManagement      # Create/assign/filter orders
├── VehicleAllocation    # Allocate + calendar + list
├── InventoryDashboard   # Stock levels + search
└── LiveFleetMap         # Leaflet map + filters + refresh
```

## Driver interface

```
DriverInterface
├── DriverOverview   # Today's shift card + metrics
├── ShiftView        # Start/end shift + shift table
├── ShiftHistory     # Completed shifts only
├── LiveMap          # GPS update + destinations + route
└── DeliveryManagement # Complete/fail deliveries
```

## Shared UI kit (`containers/common/ui`)

| Component | Responsibility |
|-----------|----------------|
| `Button` | Primary/secondary/ghost/danger actions |
| `DataTable` | Generic typed table (paginated lists) |
| `StatusBadge` | Consistent status pills |
| `SearchInput` | Debounced search field |
| `Pagination` | Page navigation |
| `ConfirmDialog` | Confirmation modals |
| `PromptDialog` | Text input modal (failure reasons) |
| `FormField` / `SelectField` / `TextField` | Form controls |
| `LazyRecordCard` | Expandable lazy-loaded record panels |
| `LeafletMapView` | Imperative Leaflet map wrapper |
| `EmptyState` | Empty/error placeholders |

## Data layer (`lib/`)

| Module | Responsibility |
|--------|----------------|
| `api.ts` | Simulated API with delays |
| `adminData.ts` | Admin queries (orders, inventory, master data) |
| `driverData.ts` | Driver queries (shifts, deliveries, overview) |
| `locations.ts` | Shared destination lookups |
| `pagination.ts` | Shared paginate helper |
| `validation.ts` | Form validation helpers |
| `mapBounds.ts` | Bengaluru map constants |
| `leafletMap.ts` | Imperative Leaflet mount/update helpers |

## Hooks

| Hook | Purpose |
|------|---------|
| `usePaginatedQuery` | Reusable paginated fetch pattern |
| `useDebouncedValue` | Debounce input values |
| `useDialogFocus` | Dialog open/close with focus restore |
