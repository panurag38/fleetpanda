import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user } = useAppContext();
  const location = useLocation();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
