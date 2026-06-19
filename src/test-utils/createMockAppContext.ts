import type { ContextType } from 'react';
import { vi } from 'vitest';
import { AppContext } from '../context/AppContext';

export type MockAppContextValue = NonNullable<ContextType<typeof AppContext>>;

export const createMockAppContext = (overrides: Partial<MockAppContextValue> = {}): MockAppContextValue => ({
  data: {
    hubs: [],
    terminals: [],
    products: [],
    drivers: [],
    vehicles: [],
    vehicleLocations: [],
    orders: [],
    allocations: [],
    shifts: []
  },
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  addHub: vi.fn(),
  addTerminal: vi.fn(),
  addDriver: vi.fn(),
  addVehicle: vi.fn(),
  addProduct: vi.fn(),
  updateHub: vi.fn(),
  updateTerminal: vi.fn(),
  updateDriver: vi.fn(),
  updateVehicle: vi.fn(),
  addOrder: vi.fn(),
  assignOrder: vi.fn(),
  addAllocation: vi.fn(),
  addVehicleLocation: vi.fn(),
  startShift: vi.fn(),
  updateShiftStatus: vi.fn(),
  endShift: vi.fn(),
  completeOrder: vi.fn(),
  failOrder: vi.fn(),
  sendGpsUpdate: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  ...overrides
});
