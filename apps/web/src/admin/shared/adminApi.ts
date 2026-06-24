const BASE = '/api/v1'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const isFormData = opts?.body instanceof FormData
  const headers: HeadersInit = isFormData
    ? {}
    : { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) }

  const r = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...opts,
    headers,
  })

  if (r.status === 401) {
    window.location.href = '/admin/login'
    throw new Error('Unauthorized')
  }
  if (!r.ok) {
    const body = await r.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? r.statusText)
  }
  return r.json() as Promise<T>
}

export const adminApi = {
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => req<T>(path, { method: 'DELETE' }),
}
