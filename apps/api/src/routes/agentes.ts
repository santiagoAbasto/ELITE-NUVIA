import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const agentesRouter = Router()

agentesRouter.get('/', async (_req, res, next) => {
  try {
    const agentes = await prisma.agente.findMany({
      where: { activo: true },
      select: {
        id: true, slug: true, nombre: true, apellido: true,
        telefono: true, whatsapp: true, foto: true, bio: true,
        _count: { select: { propiedades: { where: { activa: true } } } },
      },
      orderBy: { nombre: 'asc' },
    })
    const result = agentes.map(a => ({
      ...a, propiedadesCount: a._count.propiedades, _count: undefined,
    }))
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(result)
  } catch (err) { next(err) }
})

agentesRouter.get('/:slug', async (req, res, next) => {
  try {
    const agente = await prisma.agente.findUnique({
      where: { slug: req.params.slug, activo: true },
      include: {
        propiedades: {
          where: { activa: true },
          include: { fotos: { orderBy: { orden: 'asc' }, take: 1 } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!agente) {
      res.status(404).json({ error: 'Not Found', message: 'Agente no encontrado', statusCode: 404 })
      return
    }
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(agente)
  } catch (err) { next(err) }
})
