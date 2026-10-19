// Thin fetch client for gravuta-backend.
// Base URL comes from NEXT_PUBLIC_API_URL (e.g. http://localhost:5000/api).

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const API_ORIGIN = API_URL.replace(/\/api$/, '');

export class ApiError extends Error {
  status: number;
  errors?: unknown[];

  constructor(message: string, status: number, errors?: unknown[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Called when an authenticated request returns 401 (expired / revoked token)
export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Returns the full JSON body ({ status, message, data, pagination, ... })
export async function apiRequest<T = any>(method: Method, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(authToken && { Authorization: `Bearer ${authToken}` })
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection.', 0);
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && authToken && onUnauthorized) onUnauthorized();
    throw new ApiError(json.message || `Request failed (${res.status})`, res.status, json.errors);
  }
  return json as T;
}

export const api = {
  get: <T = any>(path: string) => apiRequest<T>('GET', path),
  post: <T = any>(path: string, body?: unknown) => apiRequest<T>('POST', path, body ?? {}),
  put: <T = any>(path: string, body?: unknown) => apiRequest<T>('PUT', path, body ?? {}),
  patch: <T = any>(path: string, body?: unknown) => apiRequest<T>('PATCH', path, body ?? {}),
  delete: <T = any>(path: string) => apiRequest<T>('DELETE', path)
};

// Images: /uploads/* live on the API server, /assets/* in this app's public folder
export const resolveImage = (src?: string | null): string => {
  if (!src) return '';
  if (src.startsWith('/uploads/')) return `${API_ORIGIN}${src}`;
  return src;
};
