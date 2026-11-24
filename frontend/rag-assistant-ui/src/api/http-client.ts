import { ApiError, type ApiErrorKind } from '@/api/api-error';
import { jwtTokenResultSchema, type JwtTokenResult } from '@/api/types/auth';
import type { ApiResponse } from '@/api/types/api-response';
import { emitSessionExpired } from '@/auth/session-events';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/auth/token-store';
import { env } from '@/lib/env';

const DEFAULT_TIMEOUT_MS = 15_000;
const REFRESH_PATH = '/api/auth/refresh';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  /**
   * `none` for anonymous endpoints; `required` attaches the bearer token.
   * Do not use `required` for any endpoint that accepts anonymous calls.
   */
  auth?: 'none' | 'required';
  timeoutMs?: number;
  /** Classification for HTTP 2xx responses whose envelope reports failure. */
  envelopeFailureKind?: ApiErrorKind;
}

function buildUrl(path: string): string {
  const base = env.apiBaseUrl.replace(/\/+$/, '');
  return `${base}${path}`;
}

export { buildUrl };

function isApiEnvelope(value: unknown): value is ApiResponse<unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return typeof (value as { isSuccess?: unknown }).isSuccess === 'boolean';
}

function extractErrors(value: unknown): string[] {
  if (typeof value !== 'object' || value === null) {
    return [];
  }
  const errors = (value as { errors?: unknown }).errors;
  return Array.isArray(errors)
    ? errors.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * The envelope's `message` is safe server copy (never a stack trace or HTML).
 * It is used as the error message so callers can surface the backend's own
 * validation/conflict text instead of a generic label.
 */
function extractMessage(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const message = (value as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0 ? message.trim() : null;
}

function errorForStatus(status: number, payload: unknown): ApiError {
  const errors = extractErrors(payload);
  const message = extractMessage(payload);

  if (status === 401) {
    return new ApiError('unauthorized', message ?? 'Request is not authorized', {
      httpStatus: status,
    });
  }
  if (status === 403) {
    return new ApiError('forbidden', message ?? 'Request is forbidden', { httpStatus: status });
  }
  if (status === 404) {
    return new ApiError('not-found', message ?? 'Resource was not found', { httpStatus: status });
  }
  if (status === 400 || status === 422) {
    return new ApiError('validation', message ?? 'Request failed validation', {
      httpStatus: status,
      errors,
    });
  }
  if (status === 409) {
    return new ApiError('conflict', message ?? 'The request conflicts with the current state', {
      httpStatus: status,
      errors,
    });
  }
  if (status >= 500) {
    return new ApiError('server', message ?? 'Server request failed', {
      httpStatus: status,
      retryable: true,
    });
  }
  return new ApiError('contract', message ?? `Unexpected HTTP status ${status}`, {
    httpStatus: status,
  });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const handleAbort = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', handleAbort, { once: true });
    }
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    if (signal?.aborted) {
      throw new ApiError('aborted', 'Request was aborted');
    }
    if (didTimeout) {
      throw new ApiError('timeout', 'Request timed out');
    }
    throw new ApiError('network', 'Network request failed');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', handleAbort);
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return execute<T>(path, options, false);
}

async function execute<T>(
  path: string,
  options: RequestOptions,
  hasRetried: boolean,
): Promise<T> {
  const {
    method = 'GET',
    body,
    signal,
    auth = 'required',
    timeoutMs = DEFAULT_TIMEOUT_MS,
    envelopeFailureKind = 'server',
  } = options;

  const token = auth === 'none' ? null : getAccessToken();
  if (auth === 'required' && !token) {
    throw new ApiError('unauthorized', 'Authentication is required');
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = isFormData ? body : JSON.stringify(body);
  }

  const response = await fetchWithTimeout(buildUrl(path), init, signal, timeoutMs);

  if (response.status === 204) {
    // The only verified endpoint that answers 204 is login with invalid credentials.
    throw new ApiError('unauthorized', 'The server returned no content');
  }

  if (!response.ok) {
    if (response.status === 401 && auth !== 'none' && !hasRetried) {
      const currentToken = getAccessToken();
      if (currentToken && currentToken !== token) {
        // Another request refreshed the session while this one was in flight.
        return execute<T>(path, options, true);
      }
      await refreshAccessToken();
      return execute<T>(path, options, true);
    }

    throw errorForStatus(response.status, await readJson(response));
  }

  const payload = await readJson(response);
  if (payload === undefined) {
    throw new ApiError('contract', 'Expected a JSON response body');
  }
  if (!isApiEnvelope(payload)) {
    throw new ApiError('contract', 'Unexpected response envelope');
  }
  if (payload.isSuccess) {
    return payload.value as T;
  }

  throw new ApiError(envelopeFailureKind, extractMessage(payload) ?? 'The request was not successful', {
    httpStatus: response.status,
    errors: extractErrors(payload),
  });
}

/**
 * Streaming requests (Server-Sent Events) reuse the same auth and error
 * handling as `request`, but the abort controller must stay alive while the
 * body is read. `consume` owns the response body and is always called with a
 * live signal.
 */
export interface StreamRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  /** The backend's own model call is bounded at 10 minutes. */
  timeoutMs?: number;
}

const STREAM_TIMEOUT_MS = 10 * 60_000;

interface StreamFetch {
  response: Response;
  cleanup: () => void;
}

async function fetchForStream(
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<StreamFetch> {
  const controller = new AbortController();
  let didTimeout = false;
  let cleaned = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const handleAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', handleAbort, { once: true });
    }
  }

  const cleanup = () => {
    if (cleaned) {
      return;
    }
    cleaned = true;
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', handleAbort);
  };

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return { response, cleanup };
  } catch {
    cleanup();
    if (signal?.aborted) {
      throw new ApiError('aborted', 'Request was aborted');
    }
    if (didTimeout) {
      throw new ApiError('timeout', 'Request timed out');
    }
    throw new ApiError('network', 'Network request failed');
  }
}

export async function requestStream(
  path: string,
  options: StreamRequestOptions,
  consume: (response: Response) => Promise<void>,
): Promise<void> {
  return executeStream(path, options, consume, false);
}

async function executeStream(
  path: string,
  options: StreamRequestOptions,
  consume: (response: Response) => Promise<void>,
  hasRetried: boolean,
): Promise<void> {
  const { method = 'POST', body, signal, timeoutMs = STREAM_TIMEOUT_MS } = options;

  const token = getAccessToken();
  if (!token) {
    throw new ApiError('unauthorized', 'Authentication is required');
  }

  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    Authorization: `Bearer ${token}`,
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const { response, cleanup } = await fetchForStream(
    buildUrl(path),
    init,
    signal,
    timeoutMs,
  );

  try {
    if (response.status === 401 && !hasRetried) {
      cleanup();
      const currentToken = getAccessToken();
      if (currentToken && currentToken !== token) {
        // Another request already refreshed the session.
        await executeStream(path, options, consume, true);
        return;
      }
      await refreshAccessToken();
      await executeStream(path, options, consume, true);
      return;
    }

    if (!response.ok) {
      throw errorForStatus(response.status, await readJson(response));
    }

    if (!response.body) {
      throw new ApiError('contract', 'Streaming response has no body');
    }

    await consume(response);
  } finally {
    cleanup();
  }
}

let refreshInFlight: Promise<JwtTokenResult> | null = null;

/**
 * Single-flight refresh. The backend revokes the whole token family when a
 * rotated refresh token is presented again, so concurrent callers must share
 * exactly one request and a failed refresh must never be retried.
 */
export function refreshAccessToken(): Promise<JwtTokenResult> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function performRefresh(): Promise<JwtTokenResult> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    emitSessionExpired();
    throw new ApiError('unauthorized', 'No refresh token is available');
  }

  try {
    const payload = await request<unknown>(REFRESH_PATH, {
      method: 'POST',
      body: { refreshToken },
      auth: 'none',
      envelopeFailureKind: 'unauthorized',
    });
    const parsed = jwtTokenResultSchema.safeParse(payload);

    if (!parsed.success) {
      throw new ApiError('contract', 'Unexpected refresh response shape');
    }

    setTokens(parsed.data);
    return parsed.data;
  } catch (error) {
    clearTokens();
    emitSessionExpired();
    throw error;
  }
}
