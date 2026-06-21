import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyJWT } from '../middleware/auth.js'

export const leadsRouter = Router()

leadsRouter.post('/', async (req, res, next) => {
  try {
    const { nombre, email, telefono, mensaje, propiedadId, agenteId } = req.body as {
      nombre?: string
      email?: string
      telefono?: string
      mensaje?: string
      propiedadId?: string
      agenteId?: string
    }

    if (!nombre || !telefono) {
      res.status(400).json({ error: 'Bad Request', message: 'Nombre y telefono son requeridos', statusCode: 400 })
      return
    }

    const lead = await prisma.lead.create({
      data: {
        nombre: nombre.trim(),
        email: email?.trim() || null,
        telefono: telefono.trim(),
        mensaje: mensaje?.trim() || null,
        propiedadId: propiedadId || null,
        agenteId: agenteId || null,
      },
    })

    res.status(201).json({ id: lead.id, message: 'Consulta recibida. Un agente se contactara pronto.' })
  } catch (err) { next(err) }
})

leadsRouter.get('/', verifyJWT, async (req, res, next) => {
  try {
    const { estado, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado

    if (req.user?.rol === 'AGENTE') {
      const agente = await prisma.agente.findFirst({ where: { user: { id: req.user.userId } } })
      if (agente) where.agenteId = agente.id
    }

    const pageNum = Math.max(1, Number(page))
    const pageSizeNum = Math.min(50, Math.max(1, Number(pageSize)))

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
        include: {
          propiedad: { select: { slug: true, titulo: true } },
          agente: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.lead.count({ where }),
    ])

    res.json({ data, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

leadsRouter.patch('/:id/estado', verifyJWT, async (req, res, next) => {
  try {
    const { estado } = req.body as { estado?: string }
    const valid = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO']
    if (!estado || !valid.includes(estado)) {
      res.status(400).json({ error: 'Bad Request', message: 'Estado invalido', statusCode: 400 })
      return
    }
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { estado: estado as 'NUEVO' | 'EN_CONTACTO' | 'INTERESADO' | 'NEGOCIACION' | 'CERRADO' | 'PERDIDO' },
    })
    res.json(lead)
  } catch (err) { next(err) }
})
