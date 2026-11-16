import { jwtTokenResultSchema, type JwtTokenResult, type LoginRequest } from '@/api/types/auth';
import { ApiError } from '@/api/api-error';
import { request } from '@/api/http-client';

export async function login(credentials: LoginRequest): Promise<JwtTokenResult> {
  const payload = await request<unknown>('/api/auth/login', {
    method: 'POST',
    body: credentials,
    auth: 'none',
    envelopeFailureKind: 'unauthorized',
  });
  const parsed = jwtTokenResultSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ApiError('contract', 'Unexpected login response shape');
  }

  return parsed.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await request<null>('/api/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    auth: 'none',
  });
}
