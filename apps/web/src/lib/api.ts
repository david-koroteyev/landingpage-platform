const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lp_token');
}

export function setToken(token: string) {
  localStorage.setItem('lp_token', token);
}

export function clearToken() {
  localStorage.removeItem('lp_token');
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { data, ...init } = options;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body: data !== undefined ? JSON.stringify(data) : init.body,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({ error: res.statusText }));

  if (!res.ok) {
    throw new ApiError(res.status, json.error || 'Request failed', json.details);
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, data?: unknown, init?: RequestInit) => request<T>(path, { ...init, method: 'POST', data }),
  patch: <T>(path: string, data?: unknown, init?: RequestInit) => request<T>(path, { ...init, method: 'PATCH', data }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};
