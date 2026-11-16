import { Outlet } from 'react-router';

import { AuthProvider } from './auth-provider';

export function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
