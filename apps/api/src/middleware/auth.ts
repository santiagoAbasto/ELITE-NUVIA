import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AdminModulo, AuthPayload } from '@elite/types'

declare global {
  namespace Express {
    interface Request { user?: AuthPayload }
  }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    res.status(401).json({ error: 'Sesion requerida', message: 'Inicia sesion nuevamente para continuar.', statusCode: 401 })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.clearCookie('token')
    res.status(401).json({ error: 'Sesion requerida', message: 'Tu sesion expiro. Inicia sesion nuevamente.', statusCode: 401 })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Sin permisos', message: 'No tienes permisos para realizar esta accion.', statusCode: 403 })
      return
    }
    next()
  }
}

// Gates an admin module for COORDINADOR users based on their assigned
// permisos. SUPER_ADMIN and AGENTE always pass — SUPER_ADMIN has implicit
// full access, AGENTE access is already scoped per-record inside each route.
export function requireModule(modulo: AdminModulo) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Sesion requerida', message: 'Inicia sesion nuevamente para continuar.', statusCode: 401 })
      return
    }
    if (req.user.rol === 'SUPER_ADMIN' || req.user.rol === 'AGENTE') {
      next()
      return
    }
    if (!req.user.permisos?.includes(modulo)) {
      res.status(403).json({ error: 'Sin permisos', message: 'No tienes acceso a este modulo.', statusCode: 403 })
      return
    }
    next()
  }
}
