export type FetchMock = (url: string, init?: RequestInit) => Promise<Response>;

export interface ApiEnvelopeOptions {
  statusCode?: number;
  message?: string;
  errors?: string[];
}

export function apiEnvelope(value: unknown, options: ApiEnvelopeOptions = {}): unknown {
  return {
    isSuccess: true,
    value,
    message: options.message ?? '',
    errors: options.errors ?? [],
    statusCode: options.statusCode ?? 200,
  };
}

export function apiFailure({
  statusCode = 400,
  message = 'Request failed',
  errors = [],
}: ApiEnvelopeOptions = {}): unknown {
  return { isSuccess: false, value: null, message, errors, statusCode };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
