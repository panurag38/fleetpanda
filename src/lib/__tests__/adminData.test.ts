import { describe, expect, it } from 'vitest';
import { initialData } from '../../data/initialData';
import { fetchMasterDataRecords, fetchOverviewDetails, fetchFleetLocations, generateOrderId, searchOrders } from '../adminData';

describe('adminData', () => {
  it('generates sequential order ids for the same day', () => {
    const first = generateOrderId(initialData.orders);
    expect(first).toMatch(/^ORD-\d{8}-\d{3}$/);
  });

  it('searches orders through api-ready pagination', () => {
    const result = searchOrders(initialData, { query: 'diesel', page: 1, pageSize: 10, status: 'all' });

    expect(result.total).toBeGreaterThan(0);
    expect(result.items[0].destinationName).toBeTruthy();
  });

  it('returns paginated overview details with richer location fields', () => {
    const result = fetchOverviewDetails(initialData, { metric: 'locations', page: 1, pageSize: 10, tab: 'all' });

    expect(result.items[0]).toMatchObject({
      id: expect.any(String),
      latitude: expect.any(Number),
      dieselStock: expect.any(Number)
    });
  });

  it('returns paginated master data records', () => {
    const result = fetchMasterDataRecords(initialData, 'drivers', { page: 1, pageSize: 10, query: '' });
    expect(result.total).toBe(initialData.drivers.length);
  });

  it('returns empty overview details when nothing is configured', () => {
    const emptyData = {
      ...initialData,
      drivers: [],
      hubs: [],
      terminals: [],
      orders: []
    };

    const result = fetchOverviewDetails(emptyData, { metric: 'drivers', page: 1, pageSize: 10 });
    expect(result.items).toEqual([]);
  });

  it('filters fleet locations by driver, vehicle, and status', () => {
    const idleLocations = fetchFleetLocations(initialData, { status: 'idle' });
    expect(idleLocations.every((location) => location.status === 'idle')).toBe(true);

    const driverLocations = fetchFleetLocations(initialData, { driverId: 'driver-1' });
    expect(driverLocations.every((location) => location.driverId === 'driver-1')).toBe(true);
    expect(driverLocations[0].vehicleRegistration).toBeTruthy();

    const vehicleLocations = fetchFleetLocations(initialData, {
      vehicleId: 'vehicle-3',
      status: 'delivering'
    });
    expect(vehicleLocations).toHaveLength(1);
    expect(vehicleLocations[0].vehicleId).toBe('vehicle-3');
  });
});
