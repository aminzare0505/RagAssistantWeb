import { describe, expect, it } from 'vitest';

import { getAccessToken } from '@/auth/token-store';

import {
  PREVIEW_ADMIN_SESSION_KEY,
  PREVIEW_ADMIN_USER,
  clearPreviewAdminSession,
  readPreviewAdminSession,
  startPreviewAdminSession,
} from './preview-admin-session';

describe('preview admin session', () => {
  it('has no session until one is started', () => {
    expect(readPreviewAdminSession()).toBeNull();
  });

  it('starts an admin session without issuing a token', () => {
    const user = startPreviewAdminSession();

    expect(user).toEqual(PREVIEW_ADMIN_USER);
    expect(user.username).toBe('admin');
    expect(user.roles).toContain('Admin');
    expect(sessionStorage.getItem(PREVIEW_ADMIN_SESSION_KEY)).toBe('1');
    expect(getAccessToken()).toBeNull();
  });

  it('reads a started session back', () => {
    startPreviewAdminSession();

    expect(readPreviewAdminSession()).toEqual(PREVIEW_ADMIN_USER);
  });

  it('clears the session', () => {
    startPreviewAdminSession();

    clearPreviewAdminSession();

    expect(readPreviewAdminSession()).toBeNull();
    expect(sessionStorage.getItem(PREVIEW_ADMIN_SESSION_KEY)).toBeNull();
  });
});
