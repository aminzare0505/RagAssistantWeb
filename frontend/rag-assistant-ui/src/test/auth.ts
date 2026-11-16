import type { JwtTokenResult } from '@/api/types/auth';
import { REFRESH_TOKEN_KEY, setTokens } from '@/auth/token-store';

export const TEST_USER = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@example.com',
} as const;

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function createAccessToken(claims: Record<string, unknown> = {}): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      UserId: TEST_USER.id,
      preferred_username: TEST_USER.username,
      useremail: TEST_USER.email,
      ...claims,
    }),
  );
  return `${header}.${payload}.test-signature`;
}

export function createTokenResult(overrides: Partial<JwtTokenResult> = {}): JwtTokenResult {
  return {
    accessToken: createAccessToken(),
    refreshToken: 'refresh-token-1',
    accessTokenExpiresAtUtc: '2026-11-16T12:00:00Z',
    refreshTokenExpiresAtUtc: '2026-11-23T12:00:00Z',
    expiresInSeconds: 900,
    tokenType: 'Bearer',
    refreshTokenFamilyId: 'family-1',
    ...overrides,
  };
}

export function seedRefreshToken(token = 'refresh-token-1'): void {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function seedSession(): void {
  setTokens(createTokenResult());
}
