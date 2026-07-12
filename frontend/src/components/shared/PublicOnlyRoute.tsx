import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { FullPageSpinner } from '@/components/ui/FullPageSpinner';
import { dashboardPathForRole } from './ProtectedRoute';

export function PublicOnlyRoute() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
