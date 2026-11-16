import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { refreshAccessToken } from '@/api/http-client';
import { decodeAccessToken } from '@/auth/jwt';
import { subscribeToSessionExpired } from '@/auth/session-events';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/auth/token-store';
import type { AuthUser } from '@/auth/types';

import { login as loginRequest, logout as logoutRequest } from './auth-api';
import { AuthContext } from './auth-context';
import type { AuthContextValue, AuthStatus, Credentials, SessionEndedReason } from './types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // A token left in memory (for example after an in-app remount) is already a
  // valid session; a real page load starts with no access token and restores.
  const [status, setStatus] = useState<AuthStatus>(() => {
    if (getAccessToken()) {
      return 'authenticated';
    }
    return getRefreshToken() ? 'restoring' : 'anonymous';
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getAccessToken();
    return token ? decodeAccessToken(token) : null;
  });
  const [sessionEndedReason, setSessionEndedReason] = useState<SessionEndedReason>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== 'restoring') {
      return;
    }

    let isActive = true;

    void refreshAccessToken()
      .then((tokens) => {
        if (!isActive) {
          return;
        }
        setUser(decodeAccessToken(tokens.accessToken));
        setStatus('authenticated');
      })
      .catch(() => {
        if (isActive) {
          setStatus('anonymous');
        }
      });

    return () => {
      isActive = false;
    };
  }, [status]);

  useEffect(
    () =>
      subscribeToSessionExpired(() => {
        clearTokens();
        queryClient.clear();
        setUser(null);
        setStatus('anonymous');
        setSessionEndedReason('expired');
      }),
    [queryClient],
  );

  const login = useCallback(
    async (credentials: Credentials) => {
      const tokens = await loginRequest(credentials);

      queryClient.clear();
      setTokens(tokens);
      setUser(decodeAccessToken(tokens.accessToken));
      setSessionEndedReason(null);
      setStatus('authenticated');
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    const refreshToken = getRefreshToken();

    clearTokens();
    queryClient.clear();
    setUser(null);
    setSessionEndedReason(null);
    setStatus('anonymous');

    if (refreshToken) {
      // Best effort: local logout must not depend on the network.
      void logoutRequest(refreshToken).catch(() => undefined);
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, sessionEndedReason, login, logout }),
    [status, user, sessionEndedReason, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
