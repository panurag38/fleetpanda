import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { ADMIN_SUB_ROUTES, isValidAdminPath } from '../../../routes';
import NotFoundPage from '../../common/NotFoundPage';
import { CardSkeleton } from '../../common/ui';
import './AdminDashboard.css';

const AdminOverview = lazy(() => import('./AdminOverview'));
const MasterDataManagement = lazy(() => import('./MasterDataManagement'));
const OrderManagement = lazy(() => import('./OrderManagement'));
const VehicleAllocation = lazy(() => import('./VehicleAllocation'));
const InventoryDashboard = lazy(() => import('./InventoryDashboard'));
const LiveFleetMap = lazy(() => import('./LiveFleetMap'));

const AdminDashboard = () => {
  const location = useLocation();

  if (!isValidAdminPath(location.pathname)) {
    return <NotFoundPage />;
  }

  return (
    <div className="admin-shell">
      <p className="admin-shell__title">Admin Dashboard</p>
      <nav className="sub-nav">
        {ADMIN_SUB_ROUTES.map((route: { path: string; label: string }) => (
          <NavLink key={route.path} to={route.path} className={({ isActive }) => (isActive ? 'active' : '')} end={route.path === '.'}>
            {route.label}
          </NavLink>
        ))}
      </nav>
      <Suspense fallback={<CardSkeleton />}>
        <Routes>
          <Route index element={<AdminOverview />} />
          <Route path="master-data" element={<MasterDataManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="allocations" element={<VehicleAllocation />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="fleet-map" element={<LiveFleetMap />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default AdminDashboard;
