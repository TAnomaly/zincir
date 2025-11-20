import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route for admin-only pages
 * Redirects to login if not authenticated
 * Redirects to dashboard if not admin
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
