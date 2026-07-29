import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import { loginRateLimiter } from '../middleware/rateLimiter.js'
import { verifyJWT } from '../middleware/auth.js'
import type { AdminModulo, AuthPayload } from '@elite/types'

export const authRouter = Router()

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
}

authRouter.post('/login', loginRateLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }
    if (!email || !password) {
      res.status(400).json({ error: 'Datos incompletos', message: 'Ingresa tu correo y contrasena para continuar.', statusCode: 400 })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { agente: { select: { nombre: true, apellido: true } } },
    })

    if (!user || !user.activo) {
      res.status(401).json({ error: 'Acceso no autorizado', message: 'Correo o contrasena incorrectos.', statusCode: 401 })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Acceso no autorizado', message: 'Correo o contrasena incorrectos.', statusCode: 401 })
      return
    }

    const nombre = user.agente
      ? `${user.agente.nombre} ${user.agente.apellido}`
      : 'Administrador'
    const permisos = user.permisos as AdminModulo[]

    const payload: AuthPayload = { userId: user.id, rol: user.rol, nombre, permisos }
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
    const refresh = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })

    res.cookie('token', token, { ...COOKIE_OPTS, maxAge: 8 * 60 * 60 * 1000 })
    res.cookie('refresh', refresh, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.json({ rol: user.rol, nombre, permisos })
  } catch (err) { next(err) }
})

authRouter.get('/verify', verifyJWT, (req, res) => {
  res.json(req.user)
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh as string | undefined
    if (!refreshToken) {
      res.status(401).json({ error: 'Sesion requerida', message: 'Inicia sesion nuevamente para continuar.', statusCode: 401 })
      return
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, activo: true },
      include: { agente: { select: { nombre: true, apellido: true } } },
    })
    if (!user) {
      res.status(401).json({ error: 'Sesion requerida', message: 'Inicia sesion nuevamente para continuar.', statusCode: 401 })
      return
    }

    const nombre = user.agente ? `${user.agente.nombre} ${user.agente.apellido}` : 'Administrador'
    const permisos = user.permisos as AdminModulo[]
    const payload: AuthPayload = { userId: user.id, rol: user.rol, nombre, permisos }
    const newToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '8h' })
    const newRefresh = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })

    res.cookie('token', newToken, { ...COOKIE_OPTS, maxAge: 8 * 60 * 60 * 1000 })
    res.cookie('refresh', newRefresh, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.json({ rol: user.rol, nombre, permisos })
  } catch {
    res.clearCookie('token')
    res.clearCookie('refresh')
    res.status(401).json({ error: 'Sesion requerida', message: 'Tu sesion expiro. Inicia sesion nuevamente.', statusCode: 401 })
  }
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE_OPTS)
  res.clearCookie('refresh', COOKIE_OPTS)
  res.json({ message: 'Sesion cerrada' })
})
