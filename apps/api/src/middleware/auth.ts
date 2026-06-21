import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { AuthPayload } from '@elite/types'

declare global {
  namespace Express {
    interface Request { user?: AuthPayload }
  }
}

export function verifyJWT(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token no encontrado', statusCode: 401 })
    return
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.clearCookie('token')
    res.status(401).json({ error: 'Unauthorized', message: 'Token invalido o expirado', statusCode: 401 })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'Forbidden', message: 'Sin permisos suficientes', statusCode: 403 })
      return
    }
    next()
  }
}
