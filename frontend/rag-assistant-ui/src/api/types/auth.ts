import { z } from 'zod';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const jwtTokenResultSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessTokenExpiresAtUtc: z.string().min(1),
  refreshTokenExpiresAtUtc: z.string().min(1),
  expiresInSeconds: z.number(),
  tokenType: z.string().min(1),
  refreshTokenFamilyId: z.string(),
});

export type JwtTokenResult = z.infer<typeof jwtTokenResultSchema>;
