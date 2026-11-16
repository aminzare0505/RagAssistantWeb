import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/api-error';
import { refreshAccessToken, request } from '@/api/http-client';
import { subscribeToSessionExpired } from '@/auth/session-events';
import { getAccessToken, getRefreshToken } from '@/auth/token-store';
import { apiEnvelope, apiFailure, jsonResponse, type FetchMock } from '@/test/api';
import { createAccessToken, createTokenResult, seedSession } from '@/test/auth';

const unauthorizedResponse = () => new Response(null, { status: 401 });

describe('http client transport', () => {
  it('attaches the bearer token and returns the envelope value', async () => {
    seedSession();
    const accessToken = getAccessToken();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope({ ok: true })));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request<{ ok: boolean }>('/api/secure')).resolves.toEqual({ ok: true });

    const firstCall = fetchMock.mock.calls.at(0);
    expect(firstCall?.[0]).toBe('/api/secure');
    expect(new Headers(firstCall?.[1]?.headers).get('authorization')).toBe(
      `Bearer ${accessToken}`,
    );
  });

  it('refuses an authenticated request when no token is held', async () => {
    const fetchMock = vi.fn<FetchMock>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/secure')).rejects.toMatchObject({ kind: 'unauthorized' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats an empty 204 response as invalid credentials', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      request('/api/auth/login', {
        method: 'POST',
        body: { username: 'admin', password: 'wrong' },
        auth: 'none',
      }),
    ).rejects.toMatchObject({ kind: 'unauthorized' });
  });

  it('classifies an unsuccessful envelope with the requested kind', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiFailure({ errors: ['bad'] })));
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await request('/api/auth/login', {
      method: 'POST',
      body: {},
      auth: 'none',
      envelopeFailureKind: 'unauthorized',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'unauthorized', errors: ['bad'] });
  });

  it('maps HTTP statuses to error kinds', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiFailure({ statusCode: 400 }), 400));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/data', { auth: 'none' })).rejects.toMatchObject({
      kind: 'validation',
      httpStatus: 400,
    });

    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
    await expect(request('/api/data', { auth: 'none' })).rejects.toMatchObject({
      kind: 'server',
      retryable: true,
    });
  });

  it('rejects a non-JSON success response as a contract error', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(new Response('plain text', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/data', { auth: 'none' })).rejects.toMatchObject({
      kind: 'contract',
    });
  });

  it('reports a failed fetch as a network error', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/data', { auth: 'none' })).rejects.toMatchObject({
      kind: 'network',
      retryable: true,
    });
  });
});

describe('session refresh', () => {
  it('refreshes once on 401 and retries the request with the new token', async () => {
    seedSession();
    const rotatedToken = createAccessToken({ UserId: 'rotated' });
    const refreshTokens = createTokenResult({
      accessToken: rotatedToken,
      refreshToken: 'refresh-token-2',
    });
    let secureAttempts = 0;
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockImplementation((url) => {
      if (url === '/api/auth/refresh') {
        return Promise.resolve(jsonResponse(apiEnvelope(refreshTokens)));
      }
      secureAttempts += 1;
      return Promise.resolve(
        secureAttempts === 1
          ? unauthorizedResponse()
          : jsonResponse(apiEnvelope({ attempts: secureAttempts })),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(request<{ attempts: number }>('/api/secure')).resolves.toEqual({ attempts: 2 });

    expect(getAccessToken()).toBe(rotatedToken);
    expect(getRefreshToken()).toBe('refresh-token-2');
    const refreshCalls = fetchMock.mock.calls.filter(([url]) => url === '/api/auth/refresh');
    expect(refreshCalls).toHaveLength(1);
  });

  it('shares a single refresh between concurrent 401 responses', async () => {
    seedSession();
    const attempts = new Map<string, number>();
    let refreshCalls = 0;
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockImplementation((url) => {
      if (url === '/api/auth/refresh') {
        refreshCalls += 1;
        return Promise.resolve(
          jsonResponse(apiEnvelope(createTokenResult({ refreshToken: 'refresh-token-2' }))),
        );
      }
      const count = (attempts.get(url) ?? 0) + 1;
      attempts.set(url, count);
      return Promise.resolve(
        count === 1 ? unauthorizedResponse() : jsonResponse(apiEnvelope({ url })),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(Promise.all([request('/api/a'), request('/api/b')])).resolves.toEqual([
      { url: '/api/a' },
      { url: '/api/b' },
    ]);
    expect(refreshCalls).toBe(1);
  });

  it('clears the session and emits an expiry event when refresh fails', async () => {
    seedSession();
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionExpired(listener);
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockImplementation((url) =>
      Promise.resolve(
        url === '/api/auth/refresh'
          ? jsonResponse(apiFailure({ statusCode: 401 }))
          : unauthorizedResponse(),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(request('/api/secure')).rejects.toMatchObject({ kind: 'unauthorized' });
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      unsubscribe();
    }
  });

  it('rejects a refresh when no refresh token is stored', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionExpired(listener);
    const fetchMock = vi.fn<FetchMock>();
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(refreshAccessToken()).rejects.toMatchObject({ kind: 'unauthorized' });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(listener).toHaveBeenCalledTimes(1);
    } finally {
      unsubscribe();
    }
  });
});
