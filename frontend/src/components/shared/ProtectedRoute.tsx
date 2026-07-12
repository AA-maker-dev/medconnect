import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types/auth.types';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

/**
 * Guards a route subtree. With no `allowedRoles`, any authenticated user
 * passes. With `allowedRoles`, only those roles pass — anyone else is
 * redirected to their own dashboard rather than shown a dead end.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case 'PATIENT':
      return '/patient/dashboard';
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/';
  }
}
