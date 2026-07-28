const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export class ApiClientError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;
  constructor(status: number, message: string, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let accessToken: string | null = null;

/** Called by AuthProvider on login/refresh/logout to keep the in-memory token fresh. */
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach the bearer token (default true)
  isFormData?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const json = await res.json();
        setAccessToken(json.data.accessToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T = any>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { auth = true, isFormData = false, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (!isFormData) finalHeaders['Content-Type'] = 'application/json';
  if (auth && accessToken) finalHeaders['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    credentials: 'include',
  });

  if (res.status === 401 && auth && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, true);
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // empty body, e.g. some 204s
  }

  if (!res.ok) {
    throw new ApiClientError(res.status, json?.message || 'Request failed', json?.details);
  }
  return json as T;
}

export const api = {
  get: <T = any>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: options?.isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: options?.isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(path: string, body?: any, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: options?.isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

export { API_URL };
