import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { REFRESH_TOKEN_KEY } from '@/auth/token-store';
import { fa } from '@/i18n/fa';
import { apiEnvelope, jsonResponse, type FetchMock } from '@/test/api';
import { createTokenResult } from '@/test/auth';
import { renderApp } from '@/test/render-app';

async function fillCredentials(username = 'admin', password = 'secret') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(fa.auth.usernameLabel), username);
  await user.type(screen.getByLabelText(fa.auth.passwordLabel), password);
  await user.click(screen.getByRole('button', { name: fa.auth.submit }));
  return user;
}

describe('login page', () => {
  it('sends an anonymous visitor of a protected route to the login page', async () => {
    const { router } = renderApp({ authenticated: false, initialPath: '/settings' });

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.auth.signInTitle }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toBe('?returnTo=%2Fsettings');
  });

  it('shows validation messages instead of calling the server for empty fields', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderApp({ authenticated: false, initialPath: '/login' });

    await user.click(await screen.findByRole('button', { name: fa.auth.submit }));

    expect(await screen.findByText(fa.auth.errors.usernameRequired)).toBeInTheDocument();
    expect(screen.getByText(fa.auth.errors.passwordRequired)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports invalid credentials without revealing which field failed', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const { router } = renderApp({ authenticated: false, initialPath: '/login' });

    await fillCredentials('admin', 'wrong-password');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      fa.auth.errors.invalidCredentials,
    );
    expect(router.state.location.pathname).toBe('/login');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('reports a network failure', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);
    renderApp({ authenticated: false, initialPath: '/login' });

    await fillCredentials();

    expect(await screen.findByRole('alert')).toHaveTextContent(fa.auth.errors.network);
  });

  it('signs in and returns to the requested route', async () => {
    const tokens = createTokenResult();
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(tokens)));
    vi.stubGlobal('fetch', fetchMock);
    const { router } = renderApp({
      authenticated: false,
      initialPath: '/login?returnTo=%2Fsettings',
    });

    await fillCredentials();

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.nav.settings }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/settings');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(tokens.refreshToken);
    expect(localStorage.getItem('refresh_token')).toBeNull();

    const firstCall = fetchMock.mock.calls.at(0);
    expect(firstCall?.[0]).toBe('/api/auth/login');
    expect(firstCall?.[1]?.body).toBe(JSON.stringify({ username: 'admin', password: 'secret' }));
  });

  it('ignores an unsafe return target and lands on the home page', async () => {
    const fetchMock = vi.fn<FetchMock>();
    fetchMock.mockResolvedValue(jsonResponse(apiEnvelope(createTokenResult())));
    vi.stubGlobal('fetch', fetchMock);
    const { router } = renderApp({
      authenticated: false,
      initialPath: '/login?returnTo=https%3A%2F%2Fevil.example',
    });

    await fillCredentials();

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.home.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('sends an already signed-in visitor away from the login page', async () => {
    const { router } = renderApp({ initialPath: '/login' });

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.home.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('offers a development preview sign-in that sends no request', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { router } = renderApp({
      authenticated: false,
      initialPath: '/login?returnTo=%2Fsettings',
    });

    await user.click(await screen.findByRole('button', { name: fa.auth.previewSignIn }));

    expect(
      await screen.findByRole('heading', { level: 1, name: fa.nav.settings }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/settings');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderApp({ authenticated: false, initialPath: '/login' });

    const toggle = screen.getByRole('button', { name: fa.auth.showPassword });
    const password = screen.getByLabelText(fa.auth.passwordLabel);
    expect(password).toHaveAttribute('type', 'password');

    await user.click(toggle);

    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: fa.auth.hidePassword })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
