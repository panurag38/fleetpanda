import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import type { UserRole } from './types';

const HomePage = lazy(() => import('./containers/common/HomePage'));
const AdminDashboard = lazy(() => import('./containers/admin'));
const DriverInterface = lazy(() => import('./containers/driver'));

export interface RouteConfig {
  path: string;
  navPath: string;
  label: string;
  component: ComponentType | LazyExoticComponent<ComponentType>;
  roles?: UserRole[];
}

export interface NavLinkItem {
  path: string;
  label: string;
  roles?: UserRole[];
}

export interface SideNavItem {
  path: string;
  label: string;
}

export const APP_ROUTES: RouteConfig[] = [
  { path: '/', navPath: '/', label: 'Home', component: HomePage },
  { path: '/admin/*', navPath: '/admin', label: 'Admin', component: AdminDashboard, roles: ['admin'] },
  { path: '/driver/*', navPath: '/driver', label: 'Driver', component: DriverInterface, roles: ['driver'] }
];

export const HEADER_LINKS: NavLinkItem[] = APP_ROUTES.map(({ navPath, label, roles }) => ({ path: navPath, label, roles }));

export const ADMIN_SUB_ROUTES: SideNavItem[] = [
  { path: '.', label: 'Overview' },
  { path: 'master-data', label: 'Master Data' },
  { path: 'orders', label: 'Orders' },
  { path: 'allocations', label: 'Vehicle Allocation' },
  { path: 'inventory', label: 'Inventory' },
  { path: 'fleet-map', label: 'Live Fleet Map' }
];

export const DRIVER_SUB_ROUTES: SideNavItem[] = [
  { path: '.', label: 'Overview' },
  { path: 'shift', label: 'Shift View' },
  { path: 'shift-history', label: 'Shift History' },
  { path: 'map', label: 'Live Map' },
  { path: 'deliveries', label: 'Deliveries' }
];

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

const isValidWorkspacePath = (pathname: string, workspacePrefix: '/admin' | '/driver', subRoutes: SideNavItem[]) => {
  const normalized = normalizePathname(pathname);

  if (normalized === workspacePrefix) {
    return true;
  }

  if (!normalized.startsWith(`${workspacePrefix}/`)) {
    return false;
  }

  const subPath = normalized.slice(workspacePrefix.length + 1);

  if (!subPath || subPath.includes('/')) {
    return false;
  }

  return subRoutes.some((route) => route.path !== '.' && route.path === subPath);
};

export const isValidAdminPath = (pathname: string) => isValidWorkspacePath(pathname, '/admin', ADMIN_SUB_ROUTES);

export const isValidDriverPath = (pathname: string) => isValidWorkspacePath(pathname, '/driver', DRIVER_SUB_ROUTES);
