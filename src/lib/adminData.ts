import type { Allocation, AppData, Driver, Hub, Order, Terminal, Vehicle, VehicleLocation } from '../types';
import { getDestinationName, getDriverName } from './locations';
import { paginate, type PaginatedResult, type PaginationParams } from './pagination';

export type { PaginatedResult, PaginationParams };

export interface OrderListItem extends Order {
  destinationName: string;
  assignedDriverName?: string;
}

export interface OrderSearchParams extends PaginationParams {
  query: string;
  status?: Order['status'] | 'all';
}

export type OverviewMetricKey = 'locations' | 'drivers' | 'orders';
export type OverviewLocationTab = 'all' | 'hubs' | 'terminals';
export type MasterDataRecordKey = 'hubs' | 'terminals' | 'drivers' | 'vehicles';

export interface MasterDataSearchParams extends PaginationParams {
  query: string;
}

export interface InventorySearchParams extends PaginationParams {
  query: string;
}

export interface OverviewDetailsParams extends PaginationParams {
  metric: OverviewMetricKey;
  tab?: OverviewLocationTab;
}

export interface OverviewLocationDetail {
  id: string;
  name: string;
  type: Hub['type'] | Terminal['type'];
  address: string;
  latitude: number;
  longitude: number;
  dieselStock: number;
  petrolStock: number;
}

export interface OverviewDriverDetail {
  id: string;
  name: string;
  license: string;
  phone: string;
  activeAllocations: number;
}

export interface OverviewOrderDetail {
  id: string;
  product: string;
  quantity: number;
  destinationId: string;
  destinationName: string;
  deliveryDate: string;
  status: Order['status'];
  assignedDriverId?: string;
  assignedDriverName?: string;
}

export type OverviewDetail = OverviewLocationDetail | OverviewDriverDetail | OverviewOrderDetail;

export interface AllocationListItem extends Allocation {
  vehicleRegistration: string;
  driverName: string;
  vehicleType: string;
}

export type MasterDataRecord = Hub | Terminal | Driver | Vehicle;

export interface InventoryListItem {
  id: string;
  name: string;
  type: Hub['type'] | Terminal['type'];
  address: string;
  latitude: number;
  longitude: number;
  dieselStock: number;
  petrolStock: number;
  totalStock: number;
  lowStockThreshold: number;
  status: 'healthy' | 'low' | 'critical';
}

const mapLocationDetail = (location: Hub | Terminal): OverviewLocationDetail => ({
  id: location.id,
  name: location.name,
  type: location.type,
  address: location.address,
  latitude: location.coordinates.lat,
  longitude: location.coordinates.lng,
  dieselStock: location.inventory.diesel ?? 0,
  petrolStock: location.inventory.petrol ?? 0
});

const matchesQuery = (value: string, query: string) => value.toLowerCase().includes(query);

export const generateOrderId = (orders: Order[]) => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${datePart}`;
  const sameDayCount = orders.filter((order) => order.id.startsWith(prefix)).length + 1;
  return `${prefix}-${String(sameDayCount).padStart(3, '0')}`;
};

export const searchOrders = (data: AppData, params: OrderSearchParams): PaginatedResult<OrderListItem> => {
  const normalizedQuery = params.query.trim().toLowerCase();
  const enriched = data.orders.map((order) => ({
    ...order,
    destinationName: getDestinationName(data, order.destinationId),
    assignedDriverName: getDriverName(data, order.assignedDriverId)
  }));

  const filtered = enriched.filter((order) => {
    const matchesStatus = !params.status || params.status === 'all' || order.status === params.status;
    if (!matchesStatus) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return (
      order.id.toLowerCase().includes(normalizedQuery) ||
      order.product.toLowerCase().includes(normalizedQuery) ||
      order.destinationName.toLowerCase().includes(normalizedQuery) ||
      order.status.toLowerCase().includes(normalizedQuery) ||
      (order.assignedDriverName?.toLowerCase().includes(normalizedQuery) ?? false)
    );
  });

  return paginate(filtered, params.page, params.pageSize);
};

export const fetchOverviewDetails = (
  data: AppData,
  params: OverviewDetailsParams
): PaginatedResult<OverviewDetail> => {
  switch (params.metric) {
    case 'locations': {
      const hubs = params.tab === 'terminals' ? [] : data.hubs.map(mapLocationDetail);
      const terminals = params.tab === 'hubs' ? [] : data.terminals.map(mapLocationDetail);
      return paginate([...hubs, ...terminals], params.page, params.pageSize);
    }
    case 'drivers':
      return paginate(
        data.drivers.map((driver) => ({
          id: driver.id,
          name: driver.name,
          license: driver.license,
          phone: driver.phone,
          activeAllocations: data.allocations.filter((allocation) => allocation.driverId === driver.id).length
        })),
        params.page,
        params.pageSize
      );
    case 'orders':
      return paginate(
        data.orders.map((order) => ({
          id: order.id,
          product: order.product,
          quantity: order.quantity,
          destinationId: order.destinationId,
          destinationName: getDestinationName(data, order.destinationId),
          deliveryDate: order.deliveryDate,
          status: order.status,
          assignedDriverId: order.assignedDriverId,
          assignedDriverName: getDriverName(data, order.assignedDriverId)
        })),
        params.page,
        params.pageSize
      );
    default:
      return paginate([], params.page, params.pageSize);
  }
};

const filterMasterRecord = (record: MasterDataRecord, query: string) => {
  if ('address' in record) {
    return (
      matchesQuery(record.id, query) ||
      matchesQuery(record.name, query) ||
      matchesQuery(record.address, query)
    );
  }

  if ('license' in record) {
    return (
      matchesQuery(record.id, query) ||
      matchesQuery(record.name, query) ||
      matchesQuery(record.license, query) ||
      matchesQuery(record.phone, query)
    );
  }

  return (
    matchesQuery(record.id, query) ||
    matchesQuery(record.registration, query) ||
    matchesQuery(record.type, query)
  );
};

export const fetchMasterDataRecords = (
  data: AppData,
  recordType: MasterDataRecordKey,
  params: MasterDataSearchParams
): PaginatedResult<MasterDataRecord> => {
  const normalizedQuery = params.query.trim().toLowerCase();
  const source = (() => {
    switch (recordType) {
      case 'hubs':
        return data.hubs;
      case 'terminals':
        return data.terminals;
      case 'drivers':
        return data.drivers;
      case 'vehicles':
        return data.vehicles;
      default:
        return [];
    }
  })();

  const filtered = normalizedQuery
    ? source.filter((record) => filterMasterRecord(record, normalizedQuery))
    : source;

  return paginate(filtered, params.page, params.pageSize);
};

export const fetchAllocations = (
  data: AppData,
  params: PaginationParams
): PaginatedResult<AllocationListItem> => {
  const enriched = data.allocations.map((allocation) => {
    const vehicle = data.vehicles.find((item) => item.id === allocation.vehicleId);
    const driver = data.drivers.find((item) => item.id === allocation.driverId);

    return {
      ...allocation,
      vehicleRegistration: vehicle?.registration ?? allocation.vehicleId,
      driverName: driver?.name ?? allocation.driverId,
      vehicleType: vehicle?.type ?? 'Unknown'
    };
  });

  return paginate(enriched, params.page, params.pageSize);
};

export const fetchAllocationsByMonth = (data: AppData, month: string) =>
  data.allocations
    .filter((allocation) => allocation.date.startsWith(month))
    .map((allocation) => {
      const vehicle = data.vehicles.find((item) => item.id === allocation.vehicleId);
      const driver = data.drivers.find((item) => item.id === allocation.driverId);
      return {
        ...allocation,
        vehicleRegistration: vehicle?.registration ?? allocation.vehicleId,
        driverName: driver?.name ?? allocation.driverId,
        vehicleType: vehicle?.type ?? 'Unknown'
      };
    });

const LOW_STOCK_THRESHOLD = 5000;

export const fetchInventory = (
  data: AppData,
  params: InventorySearchParams
): PaginatedResult<InventoryListItem> => {
  const normalizedQuery = params.query.trim().toLowerCase();
  const items = [...data.hubs, ...data.terminals].map((location) => {
    const dieselStock = location.inventory.diesel ?? 0;
    const petrolStock = location.inventory.petrol ?? 0;
    const totalStock = dieselStock + petrolStock;
    const status: InventoryListItem['status'] =
      dieselStock < 3000 || petrolStock < 3000
        ? 'critical'
        : dieselStock < LOW_STOCK_THRESHOLD || petrolStock < LOW_STOCK_THRESHOLD
        ? 'low'
        : 'healthy';

    return {
      id: location.id,
      name: location.name,
      type: location.type,
      address: location.address,
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng,
      dieselStock,
      petrolStock,
      totalStock,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      status
    };
  });

  const filtered = normalizedQuery
    ? items.filter(
        (item) =>
          matchesQuery(item.id, normalizedQuery) ||
          matchesQuery(item.name, normalizedQuery) ||
          matchesQuery(item.address, normalizedQuery) ||
          matchesQuery(item.type, normalizedQuery) ||
          matchesQuery(item.status, normalizedQuery)
      )
    : items;

  return paginate(filtered, params.page, params.pageSize);
};

export interface FleetLocationSearchParams {
  driverId?: string;
  vehicleId?: string;
  status?: VehicleLocation['status'] | 'all';
}

export interface FleetLocationListItem extends VehicleLocation {
  vehicleRegistration: string;
  driverName?: string;
}

export const fetchFleetLocations = (data: AppData, params: FleetLocationSearchParams): FleetLocationListItem[] => {
  const vehicleById = new Map(data.vehicles.map((vehicle) => [vehicle.id, vehicle]));

  return data.vehicleLocations
    .filter((location) => {
      if (params.driverId && location.driverId !== params.driverId) {
        return false;
      }

      if (params.vehicleId && location.vehicleId !== params.vehicleId) {
        return false;
      }

      if (params.status && location.status !== params.status) {
        return false;
      }

      return true;
    })
    .map((location) => ({
      ...location,
      vehicleRegistration: vehicleById.get(location.vehicleId)?.registration ?? location.vehicleId,
      driverName: location.driverId ? getDriverName(data, location.driverId) : undefined
    }));
};
