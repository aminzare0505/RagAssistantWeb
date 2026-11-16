import { ApiError } from '@/api/api-error';
import type { Messages } from '@/i18n/fa';

type AuthErrorMessages = Messages['auth']['errors'];

export function loginErrorMessage(error: unknown, messages: AuthErrorMessages): string {
  if (!(error instanceof ApiError)) {
    return messages.unexpected;
  }

  switch (error.kind) {
    case 'unauthorized':
      return messages.invalidCredentials;
    case 'network':
    case 'timeout':
      return messages.network;
    case 'validation':
      return messages.validation;
    case 'server':
      return messages.server;
    default:
      return messages.unexpected;
  }
}
