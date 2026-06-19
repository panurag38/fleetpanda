import { lazy, Suspense } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { DRIVER_SUB_ROUTES, isValidDriverPath } from '../../../routes';
import NotFoundPage from '../../common/NotFoundPage';
import { CardSkeleton } from '../../common/ui';
import './DriverInterface.css';

const DriverOverview = lazy(() => import('./DriverOverview'));
const ShiftView = lazy(() => import('./ShiftView'));
const ShiftHistory = lazy(() => import('./ShiftHistory'));
const LiveMap = lazy(() => import('./LiveMap'));
const DeliveryManagement = lazy(() => import('./delivery'));

const DriverInterface = () => {
  const location = useLocation();

  if (!isValidDriverPath(location.pathname)) {
    return <NotFoundPage />;
  }

  return (
    <div className="driver-shell page-card">
      <p className="driver-shell__title">Driver Interface</p>
      <nav className="sub-nav">
        {DRIVER_SUB_ROUTES.map((route) => (
          <NavLink key={route.path} to={route.path} className={({ isActive }) => (isActive ? 'active' : '')} end={route.path === '.'}>
            {route.label}
          </NavLink>
        ))}
      </nav>
      <Suspense fallback={<CardSkeleton />}>
        <Routes>
          <Route index element={<DriverOverview />} />
          <Route path="shift" element={<ShiftView />} />
          <Route path="shift-history" element={<ShiftHistory />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="deliveries" element={<DeliveryManagement />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default DriverInterface;
