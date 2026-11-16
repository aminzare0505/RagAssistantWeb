import { z } from 'zod';

export interface LoginValidationMessages {
  usernameRequired: string;
  passwordRequired: string;
}

export function createLoginSchema(messages: LoginValidationMessages) {
  return z.object({
    username: z.string().trim().min(1, messages.usernameRequired),
    password: z.string().min(1, messages.passwordRequired),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
