import type { AppData, AuthUser, Order, Shift } from '../types';
import type { OrderListItem, PaginatedResult, PaginationParams } from './adminData';
import { getDestinationDetails, getDriverName } from './locations';
import { paginate } from './pagination';

export interface DriverDeliverySearchParams extends PaginationParams {
  query: string;
}

export interface DriverShiftSearchParams extends PaginationParams {
  historyOnly?: boolean;
}

export interface DriverOverviewDetail {
  driverId: string;
  name: string;
  license: string;
  phone: string;
  vehicleRegistration?: string;
  vehicleType?: string;
  activeShiftStatus?: Shift['status'];
  activeShiftId?: string;
  pendingDeliveries: number;
  inTransitDeliveries: number;
  completedDeliveries: number;
  todaysAllocationDate?: string;
  todaysShift?: {
    id: string;
    date: string;
    status: Shift['status'];
    vehicleRegistration: string;
    orderIds: string[];
    orderCount: number;
  };
}

export interface DriverDeliveryItem extends OrderListItem {
  destinationAddress: string;
}

export interface DriverShiftListItem {
  id: string;
  date: string;
  status: Shift['status'];
  vehicleRegistration: string;
  vehicleType: string;
  orderCount: number;
  orderIds: string[];
  orderSummary: string;
}

export const resolveDriverId = (user: AuthUser | null, data: AppData) => {
  if (!user || user.role !== 'driver') {
    return null;
  }

  if (user.username === 'driver') {
    return 'driver-1';
  }

  return data.drivers.find((driver) => driver.name === user.name)?.id ?? data.drivers[0]?.id ?? null;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const fetchDriverOverview = (data: AppData, driverId: string): DriverOverviewDetail | null => {
  const driver = data.drivers.find((item) => item.id === driverId);
  if (!driver) {
    return null;
  }

  const driverOrders = data.orders.filter((order) => order.assignedDriverId === driverId);
  const today = todayISO();
  const activeShift = data.shifts.find(
    (shift) => shift.driverId === driverId && shift.status !== 'completed' && shift.date === today
  );
  const allocation = data.allocations.find((item) => item.driverId === driverId && item.date === today);
  const vehicle = allocation
    ? data.vehicles.find((item) => item.id === allocation.vehicleId)
    : activeShift
    ? data.vehicles.find((item) => item.id === activeShift.vehicleId)
    : undefined;

  return {
    driverId: driver.id,
    name: driver.name,
    license: driver.license,
    phone: driver.phone,
    vehicleRegistration: vehicle?.registration,
    vehicleType: vehicle?.type,
    activeShiftStatus: activeShift?.status,
    activeShiftId: activeShift?.id,
    pendingDeliveries: driverOrders.filter((order) => order.status === 'pending' || order.status === 'assigned').length,
    inTransitDeliveries: driverOrders.filter((order) => order.status === 'in_transit').length,
    completedDeliveries: driverOrders.filter((order) => order.status === 'completed').length,
    todaysAllocationDate: allocation?.date,
    todaysShift: activeShift
      ? {
          id: activeShift.id,
          date: activeShift.date,
          status: activeShift.status,
          vehicleRegistration: vehicle?.registration ?? activeShift.vehicleId,
          orderIds: activeShift.orderIds,
          orderCount: activeShift.orderIds.length
        }
      : undefined
  };
};

export const searchDriverDeliveries = (
  data: AppData,
  driverId: string,
  params: DriverDeliverySearchParams
): PaginatedResult<DriverDeliveryItem> => {
  const normalizedQuery = params.query.trim().toLowerCase();
  const enriched = data.orders
    .filter((order) => order.assignedDriverId === driverId)
    .map((order: Order) => {
      const destination = getDestinationDetails(data, order.destinationId);
      return {
        ...order,
        destinationName: destination.name,
        destinationAddress: destination.address,
        assignedDriverName: getDriverName(data, driverId)
      };
    });

  const filtered = normalizedQuery
    ? enriched.filter((order) =>
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.product.toLowerCase().includes(normalizedQuery) ||
        order.destinationName.toLowerCase().includes(normalizedQuery) ||
        order.destinationAddress.toLowerCase().includes(normalizedQuery) ||
        order.status.toLowerCase().includes(normalizedQuery)
      )
    : enriched;

  return paginate(filtered, params.page, params.pageSize);
};

export const fetchDriverShifts = (
  data: AppData,
  driverId: string,
  params: DriverShiftSearchParams
): PaginatedResult<DriverShiftListItem> => {
  const enriched = data.shifts
    .filter((shift) => shift.driverId === driverId)
    .filter((shift) => (params.historyOnly ? shift.status === 'completed' : true))
    .map((shift) => {
      const vehicle = data.vehicles.find((item) => item.id === shift.vehicleId);
      const orderSummary = shift.orderIds.join(', ') || 'No orders linked';

      return {
        id: shift.id,
        date: shift.date,
        status: shift.status,
        vehicleRegistration: vehicle?.registration ?? shift.vehicleId,
        vehicleType: vehicle?.type ?? 'Unknown',
        orderCount: shift.orderIds.length,
        orderIds: shift.orderIds,
        orderSummary
      };
    });

  return paginate(enriched, params.page, params.pageSize);
};
