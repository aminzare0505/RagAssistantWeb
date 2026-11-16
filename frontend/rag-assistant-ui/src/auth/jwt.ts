import type { AuthUser } from './types';

const EMPTY_USER: AuthUser = { id: null, username: null, email: null };

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64.padEnd(base64.length + padding, '='));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function readClaim(claims: Record<string, unknown>, name: string): string | null {
  const value = claims[name];

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value.find((item): item is string => typeof item === 'string');
    return first ?? null;
  }
  return null;
}

/**
 * Display-only identity from the access token. The signature is not verified
 * here and the result must never be used for authorization decisions.
 */
export function decodeAccessToken(token: string): AuthUser {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return EMPTY_USER;
    }

    const parsed: unknown = JSON.parse(decodeBase64Url(payload));

    if (typeof parsed !== 'object' || parsed === null) {
      return EMPTY_USER;
    }

    const claims = parsed as Record<string, unknown>;

    return {
      id: readClaim(claims, 'UserId'),
      username: readClaim(claims, 'preferred_username'),
      email: readClaim(claims, 'useremail'),
    };
  } catch {
    return EMPTY_USER;
  }
}
