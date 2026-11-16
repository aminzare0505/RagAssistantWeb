import type { LoginRequest } from '@/api/types/auth';
import type { AuthUser } from '@/auth/types';

export type AuthStatus = 'restoring' | 'authenticated' | 'anonymous';

export type Credentials = LoginRequest;

export type SessionEndedReason = 'expired' | null;

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  sessionEndedReason: SessionEndedReason;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}
