import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type AdminModulo = 'cms' | 'propiedades' | 'captaciones' | 'leads' | 'agenda' | 'reportes'
interface AdminUser { rol: 'SUPER_ADMIN' | 'COORDINADOR' | 'AGENTE'; nombre: string; permisos: AdminModulo[] }
interface AdminAuthCtx {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AdminAuthCtx | null>(null)

const DEFAULT_AUTH_ERROR = 'No pudimos completar el inicio de sesion. Intenta nuevamente en unos minutos.'
const CONNECTION_AUTH_ERROR = 'No pudimos conectar con el servidor. Intenta nuevamente en unos minutos.'

class PublicAuthError extends Error {}

async function readPublicError(response: Response): Promise<string> {
  try {
    const data = await response.json() as { message?: string }
    return data.message || DEFAULT_AUTH_ERROR
  } catch {
    return DEFAULT_AUTH_ERROR
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/auth/verify', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
      .then(data => setUser(data ? { rol: data.rol, nombre: data.nombre, permisos: data.permisos ?? [] } : null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const r = await fetch('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!r.ok) throw new PublicAuthError(await readPublicError(r))
      const data = await r.json()
      setUser({ rol: data.rol, nombre: data.nombre, permisos: data.permisos ?? [] })
    } catch (err: unknown) {
      if (err instanceof PublicAuthError) throw err
      throw new Error(CONNECTION_AUTH_ERROR)
    }
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
