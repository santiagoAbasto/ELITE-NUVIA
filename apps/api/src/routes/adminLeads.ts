import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import type { LeadEstado } from '@prisma/client'

export const adminLeadsRouter = Router()

async function getAgenteId(userId: string): Promise<string | null> {
  const agente = await prisma.agente.findFirst({ where: { user: { id: userId } }, select: { id: true } })
  return agente?.id ?? null
}

// GET /
adminLeadsRouter.get('/', async (req, res, next) => {
  try {
    const { estado, agenteId, temperatura, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado
    if (temperatura) where.temperatura = temperatura
    if (agenteId && req.user!.rol !== 'AGENTE') where.agenteId = agenteId

    if (req.user!.rol === 'AGENTE') {
      const id = await getAgenteId(req.user!.userId)
      if (id) where.agenteId = id
    }

    const pageNum = Math.max(1, Number(page))
    const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)))

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          propiedad: { select: { id: true, slug: true, titulo: true } },
          agente: { select: { id: true, nombre: true, apellido: true } },
          interacciones: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      prisma.lead.count({ where }),
    ])
    res.json({ data, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

// GET /:id — full detail with interacciones
adminLeadsRouter.get('/:id', async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        propiedad: { select: { id: true, slug: true, titulo: true, fotos: { take: 1 } } },
        agente: { select: { id: true, nombre: true, apellido: true, foto: true, telefono: true } },
        interacciones: { orderBy: { createdAt: 'asc' }, include: { agente: { select: { nombre: true, apellido: true } } } },
        eventos: { orderBy: { inicio: 'asc' } },
      },
    })
    if (!lead) { res.status(404).json({ error: 'Not Found', message: 'Lead no encontrado', statusCode: 404 }); return }
    res.json(lead)
  } catch (err) { next(err) }
})

// PUT /:id — update lead data
adminLeadsRouter.put('/:id', async (req, res, next) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { ...req.body, updatedAt: new Date() },
    })
    res.json(lead)
  } catch (err) { next(err) }
})

// PATCH /:id/estado
adminLeadsRouter.patch('/:id/estado', async (req, res, next) => {
  try {
    const { estado } = req.body as { estado?: string }
    const valid = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO']
    if (!estado || !valid.includes(estado)) {
      res.status(400).json({ error: 'Bad Request', message: 'Estado inválido', statusCode: 400 })
      return
    }
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { estado: estado as LeadEstado, updatedAt: new Date() },
    })
    res.json(lead)
  } catch (err) { next(err) }
})

// POST /:id/interaccion
adminLeadsRouter.post('/:id/interaccion', async (req, res, next) => {
  try {
    const { tipo, texto } = req.body as { tipo?: string; texto?: string }
    if (!tipo || !texto) {
      res.status(400).json({ error: 'Bad Request', message: 'tipo y texto requeridos', statusCode: 400 })
      return
    }
    const agenteId = await getAgenteId(req.user!.userId) ?? req.body.agenteId as string
    if (!agenteId) { res.status(400).json({ error: 'Bad Request', message: 'Agente no encontrado', statusCode: 400 }); return }

    const interaccion = await prisma.interaccion.create({
      data: { leadId: req.params.id, agenteId, tipo, texto },
      include: { agente: { select: { nombre: true, apellido: true } } },
    })
    res.status(201).json(interaccion)
  } catch (err) { next(err) }
})
