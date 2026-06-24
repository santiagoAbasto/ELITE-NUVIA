import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { requireRole } from '../middleware/auth.js'

export const adminAgentesRouter = Router()

// GET / — list all agentes
adminAgentesRouter.get('/', async (req, res, next) => {
  try {
    const agentes = await prisma.agente.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, activo: true } },
        _count: { select: { propiedades: true, captaciones: true, leads: true } },
      },
    })
    res.json(agentes)
  } catch (err) { next(err) }
})

// GET /:id — get one with metrics
adminAgentesRouter.get('/:id', async (req, res, next) => {
  try {
    const agente = await prisma.agente.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, activo: true } },
        _count: { select: { propiedades: true, captaciones: true, leads: true } },
      },
    })
    if (!agente) { res.status(404).json({ error: 'Not Found', message: 'Agente no encontrado', statusCode: 404 }); return }
    res.json(agente)
  } catch (err) { next(err) }
})

// GET /:id/metricas
adminAgentesRouter.get('/:id/metricas', async (req, res, next) => {
  try {
    const { id } = req.params
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const [propiedadesActivas, captacionesActivas, leadsActivos, cierresMes, totalLeads] = await Promise.all([
      prisma.propiedad.count({ where: { agenteId: id, activa: true } }),
      prisma.captacion.count({ where: { agenteId: id, estado: { notIn: ['CERRADA', 'EXPIRADA'] } } }),
      prisma.lead.count({ where: { agenteId: id, estado: { notIn: ['CERRADO', 'PERDIDO'] } } }),
      prisma.lead.count({ where: { agenteId: id, estado: 'CERRADO', updatedAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { agenteId: id } }),
    ])
    res.json({
      propiedadesActivas,
      captacionesActivas,
      leadsActivos,
      cierresMes,
      tasaConversion: totalLeads > 0 ? Math.round((cierresMes / totalLeads) * 100) : 0,
    })
  } catch (err) { next(err) }
})

// POST / — create agente + user (SUPER_ADMIN only)
adminAgentesRouter.post('/', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const {
      nombre, apellido, primerApellido, segundoApellido, fechaNacimiento,
      email, telefono, whatsapp, foto, bio,
      contratoInicio, contratoFin, contratoUrl,
      password,
    } = req.body as Record<string, string>

    if (!nombre || !apellido || !email || !telefono || !password) {
      res.status(400).json({ error: 'Bad Request', message: 'Faltan campos requeridos', statusCode: 400 })
      return
    }

    const slug = `${nombre}-${apellido}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const hashedPassword = await bcrypt.hash(password, 10)

    const agente = await prisma.agente.create({
      data: {
        slug,
        nombre,
        apellido,
        primerApellido: primerApellido ?? null,
        segundoApellido: segundoApellido ?? null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        email,
        telefono,
        whatsapp: whatsapp ?? telefono,
        foto: foto ?? null,
        bio: bio ?? null,
        contratoInicio: contratoInicio ? new Date(contratoInicio) : null,
        contratoFin: contratoFin ? new Date(contratoFin) : null,
        contratoUrl: contratoUrl ?? null,
        user: {
          create: {
            email,
            password: hashedPassword,
            rol: 'AGENTE',
          },
        },
      },
      include: { user: { select: { id: true, email: true } } },
    })
    res.status(201).json(agente)
  } catch (err) { next(err) }
})

// PUT /:id — update agente (SUPER_ADMIN only)
adminAgentesRouter.put('/:id', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const {
      nombre, apellido, primerApellido, segundoApellido, fechaNacimiento,
      telefono, whatsapp, foto, bio,
      contratoInicio, contratoFin, contratoUrl,
    } = req.body as Record<string, string>

    const agente = await prisma.agente.update({
      where: { id: req.params.id },
      data: {
        nombre,
        apellido,
        primerApellido: primerApellido ?? null,
        segundoApellido: segundoApellido ?? null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        telefono,
        whatsapp,
        foto: foto ?? null,
        bio: bio ?? null,
        contratoInicio: contratoInicio ? new Date(contratoInicio) : null,
        contratoFin: contratoFin ? new Date(contratoFin) : null,
        contratoUrl: contratoUrl ?? null,
      },
    })
    res.json(agente)
  } catch (err) { next(err) }
})

// PATCH /:id/estado — activate/deactivate (SUPER_ADMIN only)
adminAgentesRouter.patch('/:id/estado', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { activo } = req.body as { activo?: boolean }
    if (activo === undefined) {
      res.status(400).json({ error: 'Bad Request', message: 'Campo activo requerido', statusCode: 400 })
      return
    }
    const agente = await prisma.agente.update({
      where: { id: req.params.id },
      data: { activo },
    })
    // Also update linked user
    await prisma.user.updateMany({ where: { agenteId: req.params.id }, data: { activo } })
    res.json(agente)
  } catch (err) { next(err) }
})

// POST /:id/contrato — update contrato URL (SUPER_ADMIN only)
adminAgentesRouter.post('/:id/contrato', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { contratoUrl, contratoInicio, contratoFin } = req.body as Record<string, string>
    const agente = await prisma.agente.update({
      where: { id: req.params.id },
      data: {
        contratoUrl: contratoUrl ?? null,
        contratoInicio: contratoInicio ? new Date(contratoInicio) : null,
        contratoFin: contratoFin ? new Date(contratoFin) : null,
      },
    })
    res.json(agente)
  } catch (err) { next(err) }
})
