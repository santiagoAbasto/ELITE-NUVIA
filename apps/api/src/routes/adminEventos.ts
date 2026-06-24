import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import type { TipoEvento } from '@prisma/client'

export const adminEventosRouter = Router()

async function getAgenteId(userId: string): Promise<string | null> {
  const agente = await prisma.agente.findFirst({ where: { user: { id: userId } }, select: { id: true } })
  return agente?.id ?? null
}

// GET /
adminEventosRouter.get('/', async (req, res, next) => {
  try {
    const { agenteId, desde, hasta } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}

    if (req.user!.rol === 'AGENTE') {
      const id = await getAgenteId(req.user!.userId)
      if (id) where.agenteId = id
    } else if (agenteId) {
      where.agenteId = agenteId
    }

    if (desde || hasta) {
      where.inicio = {
        ...(desde ? { gte: new Date(desde) } : {}),
        ...(hasta ? { lte: new Date(hasta) } : {}),
      }
    }

    const eventos = await prisma.evento.findMany({
      where,
      orderBy: { inicio: 'asc' },
      include: {
        agente: { select: { id: true, nombre: true, apellido: true } },
        lead: { select: { id: true, nombre: true, telefono: true } },
        propiedad: { select: { id: true, slug: true, titulo: true } },
      },
    })
    res.json(eventos)
  } catch (err) { next(err) }
})

// POST /
adminEventosRouter.post('/', async (req, res, next) => {
  try {
    const { titulo, tipo, inicio, fin, leadId, propiedadId, notas } = req.body as Record<string, string>
    const validTipos = ['VISITA', 'LLAMADA', 'CIERRE', 'REUNION']
    if (!titulo || !tipo || !inicio || !fin || !validTipos.includes(tipo)) {
      res.status(400).json({ error: 'Bad Request', message: 'Faltan campos requeridos o tipo inválido', statusCode: 400 })
      return
    }

    let agenteId = req.body.agenteId as string
    if (req.user!.rol === 'AGENTE') {
      const id = await getAgenteId(req.user!.userId)
      if (!id) { res.status(403).json({ error: 'Forbidden', message: 'Agente no encontrado', statusCode: 403 }); return }
      agenteId = id
    }
    if (!agenteId) { res.status(400).json({ error: 'Bad Request', message: 'agenteId requerido', statusCode: 400 }); return }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        tipo: tipo as TipoEvento,
        inicio: new Date(inicio),
        fin: new Date(fin),
        agenteId,
        leadId: leadId ?? null,
        propiedadId: propiedadId ?? null,
        notas: notas ?? null,
      },
      include: {
        agente: { select: { nombre: true, apellido: true } },
        lead: { select: { nombre: true, telefono: true } },
        propiedad: { select: { titulo: true } },
      },
    })

    // If linked to a lead, auto-record interaction
    if (leadId) {
      await prisma.interaccion.create({
        data: {
          leadId,
          agenteId,
          tipo: tipo === 'VISITA' ? 'visita' : tipo === 'LLAMADA' ? 'llamada' : 'nota',
          texto: `${tipo}: ${titulo} — ${new Date(inicio).toLocaleString('es-BO')}`,
          eventoId: evento.id,
        },
      })
    }

    res.status(201).json(evento)
  } catch (err) { next(err) }
})

// PUT /:id
adminEventosRouter.put('/:id', async (req, res, next) => {
  try {
    const evento = await prisma.evento.update({
      where: { id: req.params.id },
      data: {
        titulo: req.body.titulo,
        tipo: req.body.tipo as TipoEvento,
        inicio: req.body.inicio ? new Date(req.body.inicio as string) : undefined,
        fin: req.body.fin ? new Date(req.body.fin as string) : undefined,
        notas: req.body.notas ?? null,
        leadId: req.body.leadId ?? null,
        propiedadId: req.body.propiedadId ?? null,
      },
    })
    res.json(evento)
  } catch (err) { next(err) }
})

// DELETE /:id
adminEventosRouter.delete('/:id', async (req, res, next) => {
  try {
    await prisma.evento.delete({ where: { id: req.params.id } })
    res.json({ message: 'Evento eliminado' })
  } catch (err) { next(err) }
})
