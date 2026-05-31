import { apiUrl } from '@/src/config/api';
import { useAuth } from '@/src/store/auth';

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  /** Skip Authorization header even if a token exists. */
  anonymous?: boolean;
  /** Skip the 401-refresh-retry dance for endpoints that issue tokens. */
  skipRefresh?: boolean;
  signal?: AbortSignal;
}

/**
 * Typed fetch wrapper. Adds Authorization, JSON encoding, and on 401 retries
 * once after refreshing the access token.
 */
// eslint-disable-next-line complexity
export async function request<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);
  const auth = useAuth.getState();

  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (options.body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  if (!options.anonymous && auth.accessToken) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`;
  }

  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers,
    signal: options.signal,
  };
  if (options.body !== undefined) {
    init.body = isFormData ? (options.body as BodyInit) : JSON.stringify(options.body);
  }

  let response = await fetch(url, init);

  if (response.status === 401 && !options.skipRefresh && !options.anonymous && auth.refreshToken) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      response = await fetch(url, { ...init, headers });
    }
  }

  const text = await response.text();
  const body: unknown = text ? safeParse(text) : null;

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : undefined) ?? `HTTP ${response.status}`;
    throw new HttpError(message, response.status, body);
  }

  return body as T;
}

async function tryRefresh(): Promise<string | null> {
  const { refreshToken } = useAuth.getState();
  if (!refreshToken) return null;
  try {
    const data = await request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: { refreshToken },
        anonymous: true,
        skipRefresh: true,
      },
    );
    useAuth.setState({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data.accessToken;
  } catch {
    useAuth.setState({ accessToken: null, refreshToken: null, user: null });
    return null;
  }
}

function buildUrl(path: string, query?: HttpOptions['query']): string {
  const base = apiUrl(path);
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const http = {
  get: <T>(path: string, options?: Omit<HttpOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<HttpOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<HttpOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<HttpOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
