import { Navigate, Outlet, useLocation } from 'react-router';

import { SessionLoading } from './components/session-loading';
import { useAuth } from './use-auth';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'restoring') {
    return <SessionLoading />;
  }

  if (status === 'anonymous') {
    const returnTo = `${location.pathname}${location.search}`;
    const search = new URLSearchParams({ returnTo }).toString();
    return <Navigate to={`/login?${search}`} replace />;
  }

  return <Outlet />;
}
