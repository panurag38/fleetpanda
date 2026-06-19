import { createContext, useContext, useMemo, useState, useEffect, useCallback, useReducer, type ReactNode } from 'react';
import type {
  AppData,
  Hub,
  Terminal,
  Driver,
  Vehicle,
  Order,
  Allocation,
  Shift,
  VehicleLocation,
  AuthUser
} from '../types';
import { APP_DATA_VERSION, APP_DATA_STORAGE_KEY, AUTH_STORAGE_KEY, APP_SEED_DATA } from '../data';
import { findLocation } from '../lib/locations';
import { loginApi } from '../lib/api';

type AppAction =
  | { type: 'ADD_HUB'; payload: Hub }
  | { type: 'UPDATE_HUB'; payload: Hub }
  | { type: 'ADD_TERMINAL'; payload: Terminal }
  | { type: 'UPDATE_TERMINAL'; payload: Terminal }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Driver }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'ADD_PRODUCT'; payload: string }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'ADD_ALLOCATION'; payload: Allocation }
  | { type: 'UPSERT_VEHICLE_LOCATION'; payload: VehicleLocation }
  | { type: 'START_SHIFT'; payload: Shift }
  | { type: 'UPDATE_SHIFT_STATUS'; payload: { shiftId: string; status: Shift['status'] } }
  | { type: 'UPDATE_ORDER'; payload: { orderId: string; updates: Partial<Order> } }
  | { type: 'COMPLETE_ORDER'; payload: string }
  | { type: 'UPDATE_LOCATION_INVENTORY'; payload: { locationId: string; product: string; delta: number } };

interface AppContextValue {
  data: AppData;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  addHub: (hub: Hub) => void;
  updateHub: (hub: Hub) => void;
  addTerminal: (terminal: Terminal) => void;
  updateTerminal: (terminal: Terminal) => void;
  addDriver: (driver: Driver) => void;
  updateDriver: (driver: Driver) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  addProduct: (product: string) => void;
  addOrder: (order: Order) => void;
  assignOrder: (orderId: string, driverId: string) => void;
  addAllocation: (allocation: Allocation) => void;
  addVehicleLocation: (location: VehicleLocation) => void;
  startShift: (shift: Shift) => void;
  updateShiftStatus: (shiftId: string, status: Shift['status']) => void;
  endShift: (shiftId: string) => void;
  completeOrder: (orderId: string) => void;
  failOrder: (orderId: string, reason?: string) => void;
  sendGpsUpdate: (vehicleId: string, lat: number, lng: number) => void;
  login: (username: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
}

export { AUTH_STORAGE_KEY, APP_DATA_STORAGE_KEY, APP_DATA_VERSION } from '../data';

export const AppContext = createContext<AppContextValue | undefined>(undefined);

const loadPersistedData = (): AppData => {
  if (typeof window === 'undefined') {
    return APP_SEED_DATA;
  }

  const stored = window.localStorage.getItem(APP_DATA_STORAGE_KEY);
  if (!stored) {
    return APP_SEED_DATA;
  }

  try {
    const parsed = JSON.parse(stored) as { version?: number; data?: AppData };
    if (parsed.version === APP_DATA_VERSION && parsed.data) {
      return parsed.data;
    }
  } catch {
    window.localStorage.removeItem(APP_DATA_STORAGE_KEY);
  }

  return APP_SEED_DATA;
};

const adjustLocationInventory = (
  state: AppData,
  locationId: string,
  product: string,
  delta: number
): AppData => {
  const hubIndex = state.hubs.findIndex((hub) => hub.id === locationId);
  if (hubIndex >= 0) {
    const hub = state.hubs[hubIndex];
    const nextInventory = {
      ...hub.inventory,
      [product]: Math.max(0, (hub.inventory[product] ?? 0) + delta)
    };
    const hubs = [...state.hubs];
    hubs[hubIndex] = { ...hub, inventory: nextInventory };
    return { ...state, hubs };
  }

  const terminalIndex = state.terminals.findIndex((terminal) => terminal.id === locationId);
  if (terminalIndex >= 0) {
    const terminal = state.terminals[terminalIndex];
    const nextInventory = {
      ...terminal.inventory,
      [product]: Math.max(0, (terminal.inventory[product] ?? 0) + delta)
    };
    const terminals = [...state.terminals];
    terminals[terminalIndex] = { ...terminal, inventory: nextInventory };
    return { ...state, terminals };
  }

  return state;
};

const appReducer = (state: AppData, action: AppAction): AppData => {
  switch (action.type) {
    case 'ADD_HUB':
      return { ...state, hubs: [...state.hubs, action.payload] };
    case 'UPDATE_HUB':
      return {
        ...state,
        hubs: state.hubs.map((hub) => (hub.id === action.payload.id ? action.payload : hub))
      };
    case 'ADD_TERMINAL':
      return { ...state, terminals: [...state.terminals, action.payload] };
    case 'UPDATE_TERMINAL':
      return {
        ...state,
        terminals: state.terminals.map((terminal) =>
          terminal.id === action.payload.id ? action.payload : terminal
        )
      };
    case 'ADD_DRIVER':
      return { ...state, drivers: [...state.drivers, action.payload] };
    case 'UPDATE_DRIVER':
      return {
        ...state,
        drivers: state.drivers.map((driver) => (driver.id === action.payload.id ? action.payload : driver))
      };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map((vehicle) => (vehicle.id === action.payload.id ? action.payload : vehicle))
      };
    case 'ADD_PRODUCT':
      return state.products.includes(action.payload)
        ? state
        : { ...state, products: [...state.products, action.payload] };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'ADD_ALLOCATION':
      return { ...state, allocations: [...state.allocations, action.payload] };
    case 'UPSERT_VEHICLE_LOCATION': {
      const existingIndex = state.vehicleLocations.findIndex((loc) => loc.vehicleId === action.payload.vehicleId);
      if (existingIndex >= 0) {
        return {
          ...state,
          vehicleLocations: state.vehicleLocations.map((location) =>
            location.vehicleId === action.payload.vehicleId ? { ...location, ...action.payload } : location
          )
        };
      }
      return { ...state, vehicleLocations: [...state.vehicleLocations, action.payload] };
    }
    case 'START_SHIFT':
      return { ...state, shifts: [...state.shifts, action.payload] };
    case 'UPDATE_SHIFT_STATUS':
      return {
        ...state,
        shifts: state.shifts.map((shift) =>
          shift.id === action.payload.shiftId ? { ...shift, status: action.payload.status } : shift
        )
      };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.orderId ? { ...order, ...action.payload.updates } : order
        )
      };
    case 'UPDATE_LOCATION_INVENTORY':
      return adjustLocationInventory(state, action.payload.locationId, action.payload.product, action.payload.delta);
    case 'COMPLETE_ORDER': {
      const order = state.orders.find((item) => item.id === action.payload);
      if (!order || order.status === 'completed') {
        return state;
      }

      const destination = findLocation(state, order.destinationId);
      if (!destination) {
        return {
          ...state,
          orders: state.orders.map((item) =>
            item.id === order.id ? { ...item, status: 'completed' } : item
          )
        };
      }

      const withInventory = adjustLocationInventory(state, order.destinationId, order.product, order.quantity);
      return {
        ...withInventory,
        orders: withInventory.orders.map((item) =>
          item.id === order.id ? { ...item, status: 'completed' } : item
        )
      };
    }
    default:
      return state;
  }
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [data, dispatch] = useReducer(appReducer, APP_SEED_DATA, loadPersistedData);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuth) {
      try {
        setUser(JSON.parse(savedAuth) as AuthUser);
      } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify({ version: APP_DATA_VERSION, data }));
  }, [data]);

  const addHub = useCallback((hub: Hub) => dispatch({ type: 'ADD_HUB', payload: hub }), []);
  const updateHub = useCallback((hub: Hub) => dispatch({ type: 'UPDATE_HUB', payload: hub }), []);
  const addTerminal = useCallback((terminal: Terminal) => dispatch({ type: 'ADD_TERMINAL', payload: terminal }), []);
  const updateTerminal = useCallback((terminal: Terminal) => dispatch({ type: 'UPDATE_TERMINAL', payload: terminal }), []);
  const addDriver = useCallback((driver: Driver) => dispatch({ type: 'ADD_DRIVER', payload: driver }), []);
  const updateDriver = useCallback((driver: Driver) => dispatch({ type: 'UPDATE_DRIVER', payload: driver }), []);
  const addVehicle = useCallback((vehicle: Vehicle) => dispatch({ type: 'ADD_VEHICLE', payload: vehicle }), []);
  const updateVehicle = useCallback((vehicle: Vehicle) => dispatch({ type: 'UPDATE_VEHICLE', payload: vehicle }), []);
  const addProduct = useCallback((product: string) => dispatch({ type: 'ADD_PRODUCT', payload: product }), []);
  const addOrder = useCallback((order: Order) => dispatch({ type: 'ADD_ORDER', payload: order }), []);
  const assignOrder = useCallback(
    (orderId: string, driverId: string) =>
      dispatch({
        type: 'UPDATE_ORDER',
        payload: { orderId, updates: { assignedDriverId: driverId, status: 'assigned' } }
      }),
    []
  );
  const addAllocation = useCallback((allocation: Allocation) => dispatch({ type: 'ADD_ALLOCATION', payload: allocation }), []);
  const addVehicleLocation = useCallback(
    (location: VehicleLocation) => dispatch({ type: 'UPSERT_VEHICLE_LOCATION', payload: location }),
    []
  );
  const startShift = useCallback((shift: Shift) => dispatch({ type: 'START_SHIFT', payload: shift }), []);
  const updateShiftStatus = useCallback(
    (shiftId: string, status: Shift['status']) =>
      dispatch({ type: 'UPDATE_SHIFT_STATUS', payload: { shiftId, status } }),
    []
  );
  const endShift = useCallback(
    (shiftId: string) => dispatch({ type: 'UPDATE_SHIFT_STATUS', payload: { shiftId, status: 'completed' } }),
    []
  );
  const updateOrder = useCallback(
    (orderId: string, updates: Partial<Order>) =>
      dispatch({ type: 'UPDATE_ORDER', payload: { orderId, updates } }),
    []
  );
  const sendGpsUpdate = useCallback(
    (vehicleId: string, lat: number, lng: number) => {
      const vehicleLocation = data.vehicleLocations.find((location) => location.vehicleId === vehicleId);
      dispatch({
        type: 'UPSERT_VEHICLE_LOCATION',
        payload: {
          vehicleId,
          driverId: vehicleLocation?.driverId,
          lat,
          lng,
          status: 'en_route'
        }
      });
    },
    [data.vehicleLocations]
  );

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);

    const response = await loginApi(username, password);
    setIsLoading(false);

    if (response.data) {
      setUser(response.data);
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(response.data));
      return response.data;
    }

    setAuthError(response.error ?? 'Login failed');
    return null;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthError(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const completeOrder = useCallback((orderId: string) => dispatch({ type: 'COMPLETE_ORDER', payload: orderId }), []);
  const failOrder = useCallback(
    (orderId: string, reason?: string) =>
      updateOrder(orderId, { status: 'failed', failureReason: reason?.trim() || 'No reason provided' }),
    [updateOrder]
  );

  const value = useMemo(
    () => ({
      data,
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      authError,
      addHub,
      updateHub,
      addTerminal,
      updateTerminal,
      addDriver,
      updateDriver,
      addVehicle,
      updateVehicle,
      addProduct,
      addOrder,
      assignOrder,
      addAllocation,
      addVehicleLocation,
      startShift,
      updateShiftStatus,
      endShift,
      completeOrder,
      failOrder,
      sendGpsUpdate,
      login,
      logout
    }),
    [
      data,
      user,
      isLoading,
      authError,
      addHub,
      updateHub,
      addTerminal,
      updateTerminal,
      addDriver,
      updateDriver,
      addVehicle,
      updateVehicle,
      addProduct,
      addOrder,
      assignOrder,
      addAllocation,
      addVehicleLocation,
      startShift,
      updateShiftStatus,
      endShift,
      completeOrder,
      failOrder,
      sendGpsUpdate,
      login,
      logout
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
