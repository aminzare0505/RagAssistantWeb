import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { REFRESH_TOKEN_KEY } from '@/auth/token-store';
import { fa } from '@/i18n/fa';
import { apiEnvelope, apiFailure, jsonResponse, type FetchMock } from '@/test/api';
import { seedRefreshToken, TEST_USER } from '@/test/auth';
import { renderApp } from '@/test/render-app';

describe('authentication routing', () => {
  it('asks for a sign-in again when a stored session has expired', async () => {
    seedRefreshToken('expired-refresh-token');
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiFailure({ statusCode: 401 })));
    vi.stubGlobal('fetch', fetchMock);

    const { router } = renderApp({ authenticated: false, initialPath: '/documents' });

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.auth.signInTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(fa.auth.sessionExpiredTitle)).toBeInTheDocument();
    expect(router.state.location.search).toBe('?returnTo=%2Fdocuments');
  });

  it('shows the signed-in identity and signs out from the account menu', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(null)));
    vi.stubGlobal('fetch', fetchMock);
    const { router } = renderApp({ initialPath: '/' });

    await user.click(await screen.findByRole('button', { name: fa.auth.accountMenu }));

    expect(await screen.findByText(fa.auth.signedInAs)).toBeInTheDocument();
    expect(screen.getByText(TEST_USER.username)).toBeInTheDocument();
    expect(screen.getByText(TEST_USER.email)).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: fa.auth.logout }));

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.auth.signInTitle }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
