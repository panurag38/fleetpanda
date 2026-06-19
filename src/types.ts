export type UserRole = 'guest' | 'admin' | 'driver';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface UserCredential extends AuthUser {
  password: string;
}

export interface Hub {
  id: string;
  name: string;
  type: 'hub';
  address: string;
  coordinates: { lat: number; lng: number };
  inventory: Record<string, number>;
}

export interface Terminal {
  id: string;
  name: string;
  type: 'terminal';
  address: string;
  coordinates: { lat: number; lng: number };
  inventory: Record<string, number>;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  capacity: number;
  type: string;
}

export interface VehicleLocation {
  vehicleId: string;
  driverId?: string;
  lat: number;
  lng: number;
  status: 'idle' | 'en_route' | 'delivering';
}

export interface Order {
  id: string;
  destinationId: string;
  product: string;
  quantity: number;
  deliveryDate: string;
  assignedDriverId?: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'completed' | 'failed';
  failureReason?: string;
}

export interface Allocation {
  id: string;
  vehicleId: string;
  driverId: string;
  date: string;
}

export interface Shift {
  id: string;
  driverId: string;
  vehicleId: string;
  date: string;
  orderIds: string[];
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface AppData {
  hubs: Hub[];
  terminals: Terminal[];
  products: string[];
  drivers: Driver[];
  vehicles: Vehicle[];
  vehicleLocations: VehicleLocation[];
  orders: Order[];
  allocations: Allocation[];
  shifts: Shift[];
}
