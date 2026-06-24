import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireRole } from '../middleware/auth.js'
import type { AuthPayload } from '@elite/types'

export const adminPropiedadesRouter = Router()

async function getAgenteId(userId: string): Promise<string | null> {
  const agente = await prisma.agente.findFirst({ where: { user: { id: userId } }, select: { id: true } })
  return agente?.id ?? null
}

async function canEdit(propiedadId: string, user: AuthPayload): Promise<boolean> {
  if (user.rol !== 'AGENTE') return true
  const agenteId = await getAgenteId(user.userId)
  const p = await prisma.propiedad.findUnique({
    where: { id: propiedadId },
    include: { captacion: { select: { agenteId: true } } },
  })
  return p?.captacion?.agenteId === agenteId || p?.agenteAsignadoId === agenteId
}

// GET / — all properties with canEdit flag
adminPropiedadesRouter.get('/', async (req, res, next) => {
  try {
    const { tipo, tipoInmueble, ciudad, activa, agenteId, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (tipo) where.tipo = tipo
    if (tipoInmueble) where.tipoInmueble = tipoInmueble
    if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' }
    if (activa !== undefined) where.activa = activa === 'true'
    if (agenteId && req.user!.rol !== 'AGENTE') where.agenteId = agenteId

    const pageNum = Math.max(1, Number(page))
    const pageSizeNum = Math.min(50, Math.max(1, Number(pageSize)))

    const [data, total] = await Promise.all([
      prisma.propiedad.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
        include: {
          fotos: { orderBy: { orden: 'asc' }, take: 1 },
          agente: { select: { id: true, nombre: true, apellido: true } },
          captacion: { select: { agenteId: true } },
        },
      }),
      prisma.propiedad.count({ where }),
    ])

    // Attach canEdit per property if AGENTE
    let userAgenteId: string | null = null
    if (req.user!.rol === 'AGENTE') userAgenteId = await getAgenteId(req.user!.userId)

    const result = data.map(p => ({
      ...p,
      canEdit: req.user!.rol !== 'AGENTE' ||
        p.captacion?.agenteId === userAgenteId ||
        p.agenteAsignadoId === userAgenteId,
    }))

    res.json({ data: result, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

// GET /:id — full detail
adminPropiedadesRouter.get('/:id', async (req, res, next) => {
  try {
    const propiedad = await prisma.propiedad.findUnique({
      where: { id: req.params.id },
      include: {
        fotos: { orderBy: { orden: 'asc' } },
        agente: true,
        captacion: { include: { actividades: { orderBy: { createdAt: 'asc' } } } },
        leads: { orderBy: { createdAt: 'desc' }, take: 10, include: { agente: { select: { nombre: true, apellido: true } } } },
        eventos: { orderBy: { inicio: 'asc' }, take: 10 },
      },
    })
    if (!propiedad) { res.status(404).json({ error: 'Not Found', message: 'Propiedad no encontrada', statusCode: 404 }); return }

    let userAgenteId: string | null = null
    if (req.user!.rol === 'AGENTE') userAgenteId = await getAgenteId(req.user!.userId)

    res.json({
      ...propiedad,
      canEdit: req.user!.rol !== 'AGENTE' ||
        propiedad.captacion?.agenteId === userAgenteId ||
        propiedad.agenteAsignadoId === userAgenteId,
    })
  } catch (err) { next(err) }
})

// PUT /:id — edit with permission check
adminPropiedadesRouter.put('/:id', async (req, res, next) => {
  try {
    if (!await canEdit(req.params.id, req.user!)) {
      res.status(403).json({ error: 'Forbidden', message: 'Sin permiso para editar esta propiedad', statusCode: 403 })
      return
    }
    const propiedad = await prisma.propiedad.update({
      where: { id: req.params.id },
      data: { ...req.body, updatedAt: new Date() },
    })
    res.json(propiedad)
  } catch (err) { next(err) }
})

// PATCH /:id/asignar — SUPER_ADMIN assigns agenteAsignadoId
adminPropiedadesRouter.patch('/:id/asignar', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { agenteAsignadoId } = req.body as { agenteAsignadoId?: string }
    const propiedad = await prisma.propiedad.update({
      where: { id: req.params.id },
      data: { agenteAsignadoId: agenteAsignadoId ?? null },
    })
    res.json(propiedad)
  } catch (err) { next(err) }
})
