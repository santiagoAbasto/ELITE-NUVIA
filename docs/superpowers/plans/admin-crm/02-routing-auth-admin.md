# 02 — Routing, Auth, Admin Shell

## Files to create/modify

- Modify: `apps/web/src/App.tsx`
- Create: `apps/web/src/admin/AdminApp.tsx`
- Create: `apps/web/src/admin/AdminRouter.tsx`
- Create: `apps/web/src/admin/context/AdminAuthContext.tsx`
- Create: `apps/web/src/admin/shared/adminApi.ts`
- Create: `apps/web/src/admin/login/LoginPage.tsx`

---

## Task 1 — Auth Context

- [ ] Create `apps/web/src/admin/context/AdminAuthContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AdminUser { rol: 'SUPER_ADMIN' | 'COORDINADOR' | 'AGENTE'; nombre: string }
interface AdminAuthCtx { user: AdminUser | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }

const Ctx = createContext<AdminAuthCtx | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/auth/verify', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data ? { rol: data.rol, nombre: data.nombre } : null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const r = await fetch('/api/v1/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (!r.ok) throw new Error((await r.json()).message)
    const data = await r.json()
    setUser({ rol: data.rol, nombre: data.nombre })
  }

  const logout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAdminAuth = () => { const c = useContext(Ctx); if (!c) throw new Error('useAdminAuth must be inside AdminAuthProvider'); return c }
```

- [ ] Commit: `feat(admin): add AdminAuthContext`

---

## Task 2 — Admin API client

- [ ] Create `apps/web/src/admin/shared/adminApi.ts`

```ts
const BASE = '/api/v1'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts })
  if (r.status === 401) { window.location.href = '/admin/login'; throw new Error('Unauthorized') }
  if (!r.ok) throw new Error((await r.json()).message ?? r.statusText)
  return r.json() as Promise<T>
}

export const adminApi = {
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body: unknown) => req<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => req<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => req<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => req<T>(path, { method: 'DELETE' }),
}
```

- [ ] Commit: `feat(admin): add adminApi client`

---

## Task 3 — Login Page

- [ ] Create `apps/web/src/admin/login/LoginPage.tsx`

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

export default function LoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try { await login(email, password); navigate('/admin/dashboard') }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-5">
        <h1 className="text-white text-2xl font-semibold tracking-tight">ELITE Nuvia Admin</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo" required className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-amber-500" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" required className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-amber-500" />
        <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] Commit: `feat(admin): add LoginPage`

---

## Task 4 — AdminApp layout + AdminRouter

- [ ] Create `apps/web/src/admin/AdminApp.tsx` (sidebar + topbar + Outlet — see `05-admin-layout-dashboard.md` for sidebar items)
- [ ] Create `apps/web/src/admin/AdminRouter.tsx`

```tsx
// AdminRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAdminAuth } from './context/AdminAuthContext'
import LoginPage from './login/LoginPage'
import AdminApp from './AdminApp'

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-zinc-950" />
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="*" element={<Guard><AdminApp /></Guard>} />
    </Routes>
  )
}
```

- [ ] Modify `apps/web/src/App.tsx` — add lazy admin route:

```tsx
import { lazy, Suspense } from 'react'
const AdminRouter = lazy(() => import('./admin/AdminRouter'))
// Inside <Routes>, before closing tag:
<Route path="/admin/*" element={<Suspense fallback={null}><AdminRouter /></Suspense>} />
```

- [ ] Commit: `feat(admin): wire lazy /admin/* route in App.tsx`
