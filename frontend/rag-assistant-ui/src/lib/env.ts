import { z } from 'zod';

const envSchema = z
  .object({
    VITE_API_BASE_URL: z
      .string()
      .trim()
      .default('')
      .refine((value) => value === '' || /^https?:\/\/[^/]+/i.test(value), {
        message: 'must be empty or an absolute http(s) origin',
      }),
    VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  })
  .transform((raw) => ({
    apiBaseUrl: raw.VITE_API_BASE_URL,
    appEnv: raw.VITE_APP_ENV,
  }));

const parsed = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = parsed.data;
