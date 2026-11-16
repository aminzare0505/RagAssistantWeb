export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'aborted'
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'validation'
  | 'server'
  | 'contract';

interface ApiErrorOptions {
  httpStatus?: number;
  errors?: readonly string[];
  retryable?: boolean;
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly httpStatus: number | undefined;
  readonly errors: string[];
  readonly retryable: boolean;

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.httpStatus = options.httpStatus;
    this.errors = options.errors ? [...options.errors] : [];
    this.retryable = options.retryable ?? (kind === 'network' || kind === 'timeout');
  }
}
