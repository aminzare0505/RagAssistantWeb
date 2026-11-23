import type { AuthUser } from '@/auth/types';

export const PREVIEW_ADMIN_SESSION_KEY = 'preview_admin_session';

/**
 * Development-only identity used to reach authenticated screens while the API
 * cannot start. It issues no token and makes no request; `import.meta.env.DEV`
 * is false in production builds, so this session cannot exist there and the
 * login page never renders its controls.
 */
export const PREVIEW_ADMIN_USER: AuthUser = {
  id: 'preview-admin',
  username: 'admin',
  email: 'admin@example.com',
  roles: ['Admin'],
};

export function readPreviewAdminSession(): AuthUser | null {
  if (!import.meta.env.DEV) {
    return null;
  }

  try {
    return sessionStorage.getItem(PREVIEW_ADMIN_SESSION_KEY) === '1'
      ? PREVIEW_ADMIN_USER
      : null;
  } catch {
    return null;
  }
}

export function startPreviewAdminSession(): AuthUser {
  if (!import.meta.env.DEV) {
    throw new Error('Preview sign-in is only available in development builds');
  }

  try {
    sessionStorage.setItem(PREVIEW_ADMIN_SESSION_KEY, '1');
  } catch {
    // Storage can be blocked; the session still works for this tab.
  }

  return PREVIEW_ADMIN_USER;
}

export function clearPreviewAdminSession(): void {
  if (!import.meta.env.DEV) {
    return;
  }

  try {
    sessionStorage.removeItem(PREVIEW_ADMIN_SESSION_KEY);
  } catch {
    // Nothing else to clear.
  }
}
