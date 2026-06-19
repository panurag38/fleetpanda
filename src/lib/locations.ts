import type { AppData, Hub, Terminal } from '../types';

export type LocationRecord = Hub | Terminal;

export const getAllLocations = (data: AppData): LocationRecord[] => [...data.hubs, ...data.terminals];

export const findLocation = (data: AppData, locationId: string): LocationRecord | undefined =>
  getAllLocations(data).find((location) => location.id === locationId);

export const getDestinationName = (data: AppData, destinationId: string) =>
  findLocation(data, destinationId)?.name ?? destinationId;

export const getDestinationDetails = (data: AppData, destinationId: string) => {
  const location = findLocation(data, destinationId);
  return {
    name: location?.name ?? destinationId,
    address: location?.address ?? 'Unknown address',
    coordinates: location?.coordinates
  };
};

export const getDriverName = (data: AppData, driverId?: string) =>
  driverId ? data.drivers.find((driver) => driver.id === driverId)?.name : undefined;
