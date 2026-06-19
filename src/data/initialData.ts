import type { AppData, UserCredential } from '../types';

/**
 * Committed seed dataset for FleetPanda.
 *
 * Flow:
 * 1. First load uses APP_SEED_DATA from this file (safe to commit).
 * 2. Runtime edits are saved to localStorage under APP_DATA_STORAGE_KEY.
 * 3. If APP_DATA_VERSION changes, localStorage is ignored and seed data is restored.
 *
 * To reset locally without bumping version: clear site data / localStorage.
 */
export const initialUsers: UserCredential[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: 'admin123',
    name: 'Fleet Admin',
    role: 'admin'
  },
  {
    id: 'user-driver',
    username: 'driver',
    password: 'driver123',
    name: 'Anurag',
    role: 'driver'
  }
];

const today = '2026-06-17';

export const APP_SEED_DATA: AppData = {
  hubs: [
    {
      id: 'hub-1',
      name: 'Whitefield Distribution Hub',
      type: 'hub',
      address: 'ITPL Main Road, Whitefield, Bengaluru',
      coordinates: { lat: 12.9698, lng: 77.7499 },
      inventory: { diesel: 15000, petrol: 12000 }
    },
    {
      id: 'hub-2',
      name: 'Koramangala Energy Hub',
      type: 'hub',
      address: '80 Feet Road, Koramangala, Bengaluru',
      coordinates: { lat: 12.9352, lng: 77.6245 },
      inventory: { diesel: 10500, petrol: 9000 }
    },
    {
      id: 'hub-3',
      name: 'Indiranagar Supply Hub',
      type: 'hub',
      address: '100 Feet Road, Indiranagar, Bengaluru',
      coordinates: { lat: 12.9784, lng: 77.6408 },
      inventory: { diesel: 9200, petrol: 7600 }
    },
    {
      id: 'hub-4',
      name: 'Jayanagar Depot',
      type: 'hub',
      address: '4th Block, Jayanagar, Bengaluru',
      coordinates: { lat: 12.925, lng: 77.5937 },
      inventory: { diesel: 6800, petrol: 5400 }
    },
    {
      id: 'hub-5',
      name: 'Yelahanka Logistics Hub',
      type: 'hub',
      address: 'Bellary Road, Yelahanka, Bengaluru',
      coordinates: { lat: 13.1007, lng: 77.5963 },
      inventory: { diesel: 11200, petrol: 9800 }
    },
    {
      id: 'hub-6',
      name: 'Marathahalli Cross Hub',
      type: 'hub',
      address: 'Outer Ring Road, Marathahalli, Bengaluru',
      coordinates: { lat: 12.9592, lng: 77.6974 },
      inventory: { diesel: 8800, petrol: 7100 }
    }
  ],
  terminals: [
    {
      id: 'terminal-1',
      name: 'Electronic City Terminal',
      type: 'terminal',
      address: 'Hosur Road, Electronic City, Bengaluru',
      coordinates: { lat: 12.8456, lng: 77.6603 },
      inventory: { diesel: 8000, petrol: 6800 }
    },
    {
      id: 'terminal-2',
      name: 'Peenya Industrial Terminal',
      type: 'terminal',
      address: 'Peenya Industrial Area, Bengaluru',
      coordinates: { lat: 13.0286, lng: 77.5196 },
      inventory: { diesel: 7200, petrol: 6100 }
    },
    {
      id: 'terminal-3',
      name: 'Hebbal Fuel Terminal',
      type: 'terminal',
      address: 'NH-44, Hebbal, Bengaluru',
      coordinates: { lat: 13.0358, lng: 77.597 },
      inventory: { diesel: 6400, petrol: 5200 }
    },
    {
      id: 'terminal-4',
      name: 'Bannerghatta Terminal',
      type: 'terminal',
      address: 'Bannerghatta Road, Bengaluru',
      coordinates: { lat: 12.8879, lng: 77.5971 },
      inventory: { diesel: 5600, petrol: 4800 }
    },
    {
      id: 'terminal-5',
      name: 'MG Road City Terminal',
      type: 'terminal',
      address: 'MG Road, Bengaluru',
      coordinates: { lat: 12.975, lng: 77.6063 },
      inventory: { diesel: 4200, petrol: 3600 }
    },
    {
      id: 'terminal-6',
      name: 'Sarjapur Terminal',
      type: 'terminal',
      address: 'Sarjapur Road, Bengaluru',
      coordinates: { lat: 12.9102, lng: 77.6712 },
      inventory: { diesel: 5100, petrol: 4300 }
    }
  ],
  drivers: [
    { id: 'driver-1', name: 'Anurag Rao', license: 'KA-123456', phone: '+91-98765-43210' },
    { id: 'driver-2', name: 'Aisha Khan', license: 'KA-987654', phone: '+91-98765-43211' },
    { id: 'driver-3', name: 'Ravi Kumar', license: 'KA-456789', phone: '+91-98765-43212' },
    { id: 'driver-4', name: 'Priya Nair', license: 'KA-654321', phone: '+91-98765-43213' },
    { id: 'driver-5', name: 'Suresh Patel', license: 'KA-789012', phone: '+91-98765-43214' },
    { id: 'driver-6', name: 'Meera Iyer', license: 'KA-321654', phone: '+91-98765-43215' },
    { id: 'driver-7', name: 'Karthik Reddy', license: 'KA-852741', phone: '+91-98765-43216' },
    { id: 'driver-8', name: 'Divya Menon', license: 'KA-963852', phone: '+91-98765-43217' }
  ],
  vehicles: [
    { id: 'vehicle-1', registration: 'TRK-101', capacity: 8000, type: 'Tanker' },
    { id: 'vehicle-2', registration: 'TRK-102', capacity: 9000, type: 'Trailer' },
    { id: 'vehicle-3', registration: 'TRK-103', capacity: 7500, type: 'Tanker' },
    { id: 'vehicle-4', registration: 'TRK-104', capacity: 8500, type: 'Tanker' },
    { id: 'vehicle-5', registration: 'TRK-105', capacity: 9200, type: 'Trailer' },
    { id: 'vehicle-6', registration: 'TRK-106', capacity: 7800, type: 'Tanker' },
    { id: 'vehicle-7', registration: 'TRK-107', capacity: 8800, type: 'Trailer' },
    { id: 'vehicle-8', registration: 'TRK-108', capacity: 8200, type: 'Tanker' },
    { id: 'vehicle-9', registration: 'TRK-109', capacity: 9500, type: 'Trailer' },
    { id: 'vehicle-10', registration: 'TRK-110', capacity: 7600, type: 'Tanker' }
  ],
  vehicleLocations: [
    { vehicleId: 'vehicle-1', driverId: 'driver-1', lat: 12.975, lng: 77.6063, status: 'en_route' },
    { vehicleId: 'vehicle-2', driverId: 'driver-2', lat: 12.9784, lng: 77.6408, status: 'idle' },
    { vehicleId: 'vehicle-3', driverId: 'driver-3', lat: 12.925, lng: 77.5937, status: 'delivering' },
    { vehicleId: 'vehicle-4', driverId: 'driver-4', lat: 12.9352, lng: 77.6245, status: 'en_route' },
    { vehicleId: 'vehicle-5', driverId: 'driver-5', lat: 12.9698, lng: 77.7499, status: 'idle' },
    { vehicleId: 'vehicle-6', driverId: 'driver-6', lat: 12.9592, lng: 77.6974, status: 'delivering' },
    { vehicleId: 'vehicle-7', driverId: 'driver-7', lat: 13.0286, lng: 77.5196, status: 'en_route' },
    { vehicleId: 'vehicle-8', driverId: 'driver-8', lat: 12.8456, lng: 77.6603, status: 'idle' },
    { vehicleId: 'vehicle-9', driverId: 'driver-2', lat: 12.9102, lng: 77.6712, status: 'delivering' },
    { vehicleId: 'vehicle-10', driverId: 'driver-3', lat: 13.1007, lng: 77.5963, status: 'en_route' }
  ],
  products: ['diesel', 'petrol'],
  orders: [
    { id: 'order-1', destinationId: 'terminal-1', product: 'diesel', quantity: 5000, deliveryDate: '2026-06-20', assignedDriverId: 'driver-1', status: 'assigned' },
    { id: 'order-2', destinationId: 'hub-1', product: 'petrol', quantity: 3000, deliveryDate: '2026-06-22', assignedDriverId: 'driver-1', status: 'in_transit' },
    { id: 'order-3', destinationId: 'hub-2', product: 'diesel', quantity: 2500, deliveryDate: '2026-06-19', assignedDriverId: 'driver-2', status: 'assigned' },
    { id: 'order-4', destinationId: 'terminal-5', product: 'petrol', quantity: 1800, deliveryDate: '2026-06-15', assignedDriverId: 'driver-1', status: 'completed' },
    { id: 'order-5', destinationId: 'terminal-2', product: 'diesel', quantity: 4200, deliveryDate: '2026-06-21', status: 'pending' },
    { id: 'order-6', destinationId: 'hub-3', product: 'petrol', quantity: 2600, deliveryDate: '2026-06-23', assignedDriverId: 'driver-3', status: 'assigned' },
    { id: 'order-7', destinationId: 'terminal-3', product: 'diesel', quantity: 3100, deliveryDate: '2026-06-18', assignedDriverId: 'driver-4', status: 'in_transit' },
    { id: 'order-8', destinationId: 'hub-4', product: 'petrol', quantity: 1500, deliveryDate: '2026-06-24', status: 'pending' },
    { id: 'order-9', destinationId: 'terminal-6', product: 'diesel', quantity: 3600, deliveryDate: '2026-06-17', assignedDriverId: 'driver-5', status: 'in_transit' },
    { id: 'order-10', destinationId: 'hub-5', product: 'petrol', quantity: 2200, deliveryDate: '2026-06-25', assignedDriverId: 'driver-6', status: 'assigned' },
    { id: 'order-11', destinationId: 'hub-6', product: 'diesel', quantity: 4800, deliveryDate: '2026-06-26', assignedDriverId: 'driver-7', status: 'assigned' },
    { id: 'order-12', destinationId: 'terminal-4', product: 'petrol', quantity: 1900, deliveryDate: '2026-06-14', assignedDriverId: 'driver-2', status: 'completed' },
    { id: 'order-13', destinationId: 'hub-1', product: 'diesel', quantity: 5400, deliveryDate: '2026-06-27', status: 'pending' },
    { id: 'order-14', destinationId: 'terminal-1', product: 'petrol', quantity: 2800, deliveryDate: '2026-06-28', assignedDriverId: 'driver-8', status: 'assigned' },
    { id: 'order-15', destinationId: 'hub-2', product: 'diesel', quantity: 3300, deliveryDate: '2026-06-16', assignedDriverId: 'driver-3', status: 'failed', failureReason: 'Destination access denied' },
    { id: 'order-16', destinationId: 'terminal-3', product: 'petrol', quantity: 2100, deliveryDate: '2026-06-29', assignedDriverId: 'driver-4', status: 'assigned' },
    { id: 'order-17', destinationId: 'hub-3', product: 'diesel', quantity: 3900, deliveryDate: '2026-06-30', status: 'pending' },
    { id: 'order-18', destinationId: 'terminal-5', product: 'diesel', quantity: 2700, deliveryDate: '2026-06-12', assignedDriverId: 'driver-1', status: 'completed' },
    { id: 'order-19', destinationId: 'hub-4', product: 'petrol', quantity: 1600, deliveryDate: '2026-06-19', assignedDriverId: 'driver-5', status: 'assigned' },
    { id: 'order-20', destinationId: 'terminal-2', product: 'diesel', quantity: 4500, deliveryDate: '2026-06-20', assignedDriverId: 'driver-6', status: 'in_transit' }
  ],
  allocations: [
    { id: 'alloc-1', vehicleId: 'vehicle-1', driverId: 'driver-1', date: today },
    { id: 'alloc-2', vehicleId: 'vehicle-2', driverId: 'driver-2', date: today },
    { id: 'alloc-3', vehicleId: 'vehicle-3', driverId: 'driver-3', date: '2026-06-18' },
    { id: 'alloc-4', vehicleId: 'vehicle-4', driverId: 'driver-4', date: '2026-06-16' },
    { id: 'alloc-5', vehicleId: 'vehicle-5', driverId: 'driver-5', date: '2026-06-20' },
    { id: 'alloc-6', vehicleId: 'vehicle-6', driverId: 'driver-6', date: '2026-06-17' },
    { id: 'alloc-7', vehicleId: 'vehicle-7', driverId: 'driver-7', date: '2026-06-19' },
    { id: 'alloc-8', vehicleId: 'vehicle-8', driverId: 'driver-8', date: '2026-06-21' },
    { id: 'alloc-9', vehicleId: 'vehicle-9', driverId: 'driver-2', date: '2026-06-22' },
    { id: 'alloc-10', vehicleId: 'vehicle-10', driverId: 'driver-3', date: '2026-06-23' },
    { id: 'alloc-11', vehicleId: 'vehicle-1', driverId: 'driver-4', date: '2026-06-24' },
    { id: 'alloc-12', vehicleId: 'vehicle-2', driverId: 'driver-5', date: '2026-06-25' },
    { id: 'alloc-13', vehicleId: 'vehicle-3', driverId: 'driver-6', date: '2026-06-10' },
    { id: 'alloc-14', vehicleId: 'vehicle-4', driverId: 'driver-7', date: '2026-06-11' },
    { id: 'alloc-15', vehicleId: 'vehicle-5', driverId: 'driver-8', date: '2026-06-12' },
    { id: 'alloc-16', vehicleId: 'vehicle-6', driverId: 'driver-1', date: '2026-06-13' },
    { id: 'alloc-17', vehicleId: 'vehicle-7', driverId: 'driver-2', date: '2026-06-14' },
    { id: 'alloc-18', vehicleId: 'vehicle-8', driverId: 'driver-3', date: '2026-06-15' },
    { id: 'alloc-19', vehicleId: 'vehicle-9', driverId: 'driver-4', date: '2026-06-26' },
    { id: 'alloc-20', vehicleId: 'vehicle-10', driverId: 'driver-5', date: '2026-06-27' },
    { id: 'alloc-21', vehicleId: 'vehicle-1', driverId: 'driver-6', date: '2026-06-28' },
    { id: 'alloc-22', vehicleId: 'vehicle-2', driverId: 'driver-7', date: '2026-06-29' },
    { id: 'alloc-23', vehicleId: 'vehicle-3', driverId: 'driver-8', date: '2026-06-30' },
    { id: 'alloc-24', vehicleId: 'vehicle-4', driverId: 'driver-1', date: '2026-06-05' },
    { id: 'alloc-25', vehicleId: 'vehicle-5', driverId: 'driver-2', date: '2026-06-06' }
  ],
  shifts: [
    { id: 'shift-1', driverId: 'driver-1', vehicleId: 'vehicle-1', date: today, orderIds: ['order-1', 'order-2'], status: 'not_started' },
    { id: 'shift-2', driverId: 'driver-2', vehicleId: 'vehicle-2', date: today, orderIds: ['order-3'], status: 'not_started' },
    { id: 'shift-3', driverId: 'driver-1', vehicleId: 'vehicle-1', date: '2026-06-16', orderIds: ['order-4'], status: 'completed' },
    { id: 'shift-4', driverId: 'driver-3', vehicleId: 'vehicle-3', date: '2026-06-10', orderIds: ['order-6'], status: 'completed' },
    { id: 'shift-5', driverId: 'driver-4', vehicleId: 'vehicle-4', date: '2026-06-18', orderIds: ['order-7'], status: 'in_progress' },
    { id: 'shift-6', driverId: 'driver-5', vehicleId: 'vehicle-5', date: '2026-06-17', orderIds: ['order-9', 'order-19'], status: 'in_progress' },
    { id: 'shift-7', driverId: 'driver-6', vehicleId: 'vehicle-6', date: '2026-06-17', orderIds: ['order-10', 'order-20'], status: 'not_started' },
    { id: 'shift-8', driverId: 'driver-2', vehicleId: 'vehicle-2', date: '2026-06-14', orderIds: ['order-12'], status: 'completed' }
  ]
};

/** @alias APP_SEED_DATA */
export const initialData = APP_SEED_DATA;
