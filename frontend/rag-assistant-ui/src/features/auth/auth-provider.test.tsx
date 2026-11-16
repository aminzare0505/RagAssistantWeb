import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { emitSessionExpired } from '@/auth/session-events';
import { getAccessToken, getRefreshToken } from '@/auth/token-store';
import { apiEnvelope, apiFailure, jsonResponse, type FetchMock } from '@/test/api';
import { createTokenResult, seedRefreshToken, seedSession } from '@/test/auth';

import { AuthProvider } from './auth-provider';
import { useAuth } from './use-auth';

function AuthProbe() {
  const { status, user, sessionEndedReason, logout } = useAuth();

  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="username">{user?.username ?? 'none'}</span>
      <span data-testid="reason">{sessionEndedReason ?? 'none'}</span>
      <button type="button" onClick={logout}>
        log out
      </button>
    </div>
  );
}

function renderProvider() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('auth provider', () => {
  it('starts anonymous when no tokens are stored', () => {
    renderProvider();

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(screen.getByTestId('reason')).toHaveTextContent('none');
  });

  it('restores the session from a stored refresh token', async () => {
    seedRefreshToken();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(createTokenResult())));
    vi.stubGlobal('fetch', fetchMock);

    renderProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('restoring');

    expect(await screen.findByText('authenticated')).toBeInTheDocument();
    expect(screen.getByTestId('username')).toHaveTextContent('admin');
    expect(getAccessToken()).not.toBeNull();
  });

  it('ends in an expired state when the stored session cannot be restored', async () => {
    seedRefreshToken('stale-token');
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiFailure({ statusCode: 401 })));
    vi.stubGlobal('fetch', fetchMock);

    renderProvider();

    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(screen.getByTestId('reason')).toHaveTextContent('expired');
    expect(getRefreshToken()).toBeNull();
  });

  it('drops the session when the refresh token is rejected later on', async () => {
    seedSession();
    renderProvider();
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');

    act(() => {
      emitSessionExpired();
    });

    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(screen.getByTestId('reason')).toHaveTextContent('expired');
    expect(getAccessToken()).toBeNull();
  });

  it('clears the local session on logout', async () => {
    const user = userEvent.setup();
    seedSession();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(null)));
    vi.stubGlobal('fetch', fetchMock);
    renderProvider();

    await user.click(screen.getByRole('button', { name: 'log out' }));

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('username')).toHaveTextContent('none');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
