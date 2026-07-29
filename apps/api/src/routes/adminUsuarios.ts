import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { requireRole } from '../middleware/auth.js'
import { ADMIN_MODULES, type AdminModulo } from '@elite/types'

export const adminUsuariosRouter = Router()
adminUsuariosRouter.use(requireRole('SUPER_ADMIN'))

function sanitizePermisos(value: unknown): AdminModulo[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is AdminModulo => ADMIN_MODULES.includes(v as AdminModulo))
}

// GET / — list administrative users (SUPER_ADMIN + COORDINADOR accounts, not field agents)
adminUsuariosRouter.get('/', async (_req, res, next) => {
  try {
    const usuarios = await prisma.user.findMany({
      where: { rol: { in: ['SUPER_ADMIN', 'COORDINADOR'] } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, rol: true, permisos: true, activo: true, createdAt: true },
    })
    res.json(usuarios)
  } catch (err) { next(err) }
})

// POST / — create a COORDINADOR (admin) account with a set of module permisos
adminUsuariosRouter.post('/', async (req, res, next) => {
  try {
    const { email, password, permisos } = req.body as { email?: string; password?: string; permisos?: unknown }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Bad Request', message: 'Email valido requerido', statusCode: 400 })
      return
    }
    if (!password || password.length < 8) {
      res.status(400).json({ error: 'Bad Request', message: 'La contrasena debe tener al menos 8 caracteres', statusCode: 400 })
      return
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      res.status(409).json({ error: 'Conflicto', message: 'Ya existe un usuario con ese correo', statusCode: 409 })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        rol: 'COORDINADOR',
        permisos: sanitizePermisos(permisos),
      },
      select: { id: true, email: true, rol: true, permisos: true, activo: true, createdAt: true },
    })
    res.status(201).json(user)
  } catch (err) { next(err) }
})

// PUT /:id/permisos — update the module permisos for a COORDINADOR account
adminUsuariosRouter.put('/:id/permisos', async (req, res, next) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) { res.status(404).json({ error: 'Not Found', message: 'Usuario no encontrado', statusCode: 404 }); return }
    if (target.rol !== 'COORDINADOR') {
      res.status(400).json({ error: 'Bad Request', message: 'Solo se pueden asignar permisos a cuentas Coordinador', statusCode: 400 })
      return
    }

    const { permisos } = req.body as { permisos?: unknown }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { permisos: sanitizePermisos(permisos) },
      select: { id: true, email: true, rol: true, permisos: true, activo: true, createdAt: true },
    })
    res.json(user)
  } catch (err) { next(err) }
})

// PATCH /:id/estado — activate/deactivate an administrative account
adminUsuariosRouter.patch('/:id/estado', async (req, res, next) => {
  try {
    const { activo } = req.body as { activo?: boolean }
    if (activo === undefined) {
      res.status(400).json({ error: 'Bad Request', message: 'Campo activo requerido', statusCode: 400 })
      return
    }
    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) { res.status(404).json({ error: 'Not Found', message: 'Usuario no encontrado', statusCode: 404 }); return }
    if (target.rol === 'SUPER_ADMIN' && !activo && target.id === req.user!.userId) {
      res.status(400).json({ error: 'Bad Request', message: 'No puedes desactivar tu propia cuenta', statusCode: 400 })
      return
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { activo },
      select: { id: true, email: true, rol: true, permisos: true, activo: true, createdAt: true },
    })
    res.json(user)
  } catch (err) { next(err) }
})
