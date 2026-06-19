import type { AuthUser, AppData } from '../types';
import { initialUsers } from '../data/initialData';
import {
  fetchAllocations,
  fetchFleetLocations,
  fetchInventory,
  fetchMasterDataRecords,
  fetchOverviewDetails,
  searchOrders,
  type AllocationListItem,
  type InventoryListItem,
  type InventorySearchParams,
  type MasterDataRecord,
  type MasterDataRecordKey,
  type MasterDataSearchParams,
  type OrderListItem,
  type OrderSearchParams,
  type OverviewDetail,
  type OverviewDetailsParams,
  type PaginatedResult,
  type PaginationParams,
  type FleetLocationListItem,
  type FleetLocationSearchParams
} from './adminData';
import {
  fetchDriverOverview,
  fetchDriverShifts,
  searchDriverDeliveries,
  type DriverDeliveryItem,
  type DriverDeliverySearchParams,
  type DriverOverviewDetail,
  type DriverShiftListItem,
  type DriverShiftSearchParams
} from './driverData';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export const simulateApiResponse = async <T>(
  payload: T,
  delayMs = 400,
  signal?: AbortSignal
): Promise<ApiResponse<T>> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = window.setTimeout(() => {
      if (signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      resolve({ data: payload, error: null, status: 200 });
    }, delayMs);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });

export interface ApiRequestOptions {
  signal?: AbortSignal;
}

export const loginApi = async (username: string, password: string): Promise<ApiResponse<AuthUser>> => {
  const normalizedUsername = username.trim().toLowerCase();
  const matchedUser = initialUsers.find((user) => user.username === normalizedUsername && user.password === password);

  if (!matchedUser) {
    return { data: null, error: 'Invalid username or password', status: 401 };
  }

  const { id, username: foundUsername, name, role } = matchedUser;
  return simulateApiResponse({ id, username: foundUsername, name, role });
};

export const searchOrdersApi = async (
  data: AppData,
  params: OrderSearchParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<OrderListItem>>> =>
  simulateApiResponse(searchOrders(data, params), 400, options?.signal);

export const fetchOverviewDetailsApi = async (
  data: AppData,
  params: OverviewDetailsParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<OverviewDetail>>> =>
  simulateApiResponse(fetchOverviewDetails(data, params), 400, options?.signal);

export const fetchMasterDataRecordsApi = async (
  data: AppData,
  recordType: MasterDataRecordKey,
  params: MasterDataSearchParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<MasterDataRecord>>> =>
  simulateApiResponse(fetchMasterDataRecords(data, recordType, params), 400, options?.signal);

export const fetchAllocationsApi = async (
  data: AppData,
  params: PaginationParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<AllocationListItem>>> =>
  simulateApiResponse(fetchAllocations(data, params), 400, options?.signal);

export const fetchInventoryApi = async (
  data: AppData,
  params: InventorySearchParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<InventoryListItem>>> =>
  simulateApiResponse(fetchInventory(data, params), 400, options?.signal);

export const fetchFleetLocationsApi = async (
  data: AppData,
  params: FleetLocationSearchParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<FleetLocationListItem[]>> =>
  simulateApiResponse(fetchFleetLocations(data, params), 350, options?.signal);

export const fetchDriverOverviewApi = async (
  data: AppData,
  driverId: string
): Promise<ApiResponse<DriverOverviewDetail>> => {
  const overview = fetchDriverOverview(data, driverId);
  if (!overview) {
    return { data: null, error: 'Driver not found', status: 404 };
  }
  return simulateApiResponse(overview);
};

export const searchDriverDeliveriesApi = async (
  data: AppData,
  driverId: string,
  params: DriverDeliverySearchParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<DriverDeliveryItem>>> =>
  simulateApiResponse(searchDriverDeliveries(data, driverId, params), 400, options?.signal);

export const fetchDriverShiftsApi = async (
  data: AppData,
  driverId: string,
  params: DriverShiftSearchParams,
  options?: ApiRequestOptions
): Promise<ApiResponse<PaginatedResult<DriverShiftListItem>>> =>
  simulateApiResponse(fetchDriverShifts(data, driverId, params), 400, options?.signal);
