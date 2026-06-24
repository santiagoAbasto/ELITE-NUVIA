import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AdminUser { rol: 'SUPER_ADMIN' | 'COORDINADOR' | 'AGENTE'; nombre: string }
interface AdminAuthCtx {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

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
    const r = await fetch('/api/v1/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
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

export const useAdminAuth = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return c
}
