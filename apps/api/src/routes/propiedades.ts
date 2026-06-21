import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const propiedadesRouter = Router()

propiedadesRouter.get('/count', async (_req, res, next) => {
  try {
    const [venta, alquiler, anticretico] = await Promise.all([
      prisma.propiedad.count({ where: { tipo: 'VENTA', activa: true } }),
      prisma.propiedad.count({ where: { tipo: 'ALQUILER', activa: true } }),
      prisma.propiedad.count({ where: { tipo: 'ANTICRETICO', activa: true } }),
    ])
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json({ venta, alquiler, anticretico, total: venta + alquiler + anticretico })
  } catch (err) { next(err) }
})

propiedadesRouter.get('/destacadas', async (_req, res, next) => {
  try {
    const propiedades = await prisma.propiedad.findMany({
      where: { destacada: true, activa: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        fotos: { orderBy: { orden: 'asc' }, take: 4 },
        agente: { select: { id: true, slug: true, nombre: true, apellido: true, telefono: true, whatsapp: true, foto: true } },
      },
    })
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json(propiedades)
  } catch (err) { next(err) }
})

propiedadesRouter.get('/', async (req, res, next) => {
  try {
    const {
      tipo, tipoInmueble, ciudad, precioMin, precioMax,
      dormitorios, banos, garage, amueblado, piscina,
      page = '1', pageSize = '12',
    } = req.query as Record<string, string>

    const where: Record<string, unknown> = { activa: true }
    if (tipo) where.tipo = tipo
    if (tipoInmueble) where.tipoInmueble = tipoInmueble
    if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' }
    if (precioMin || precioMax) where.precio = {
      ...(precioMin ? { gte: Number(precioMin) } : {}),
      ...(precioMax ? { lte: Number(precioMax) } : {}),
    }
    if (dormitorios) where.dormitorios = { gte: Number(dormitorios) }
    if (banos) where.banos = { gte: Number(banos) }
    if (garage === 'true') where.garage = true
    if (amueblado === 'true') where.amueblado = true
    if (piscina === 'true') where.piscina = true

    const pageNum = Math.max(1, Number(page))
    const pageSizeNum = Math.min(50, Math.max(1, Number(pageSize)))
    const skip = (pageNum - 1) * pageSizeNum

    const [data, total] = await Promise.all([
      prisma.propiedad.findMany({
        where,
        skip,
        take: pageSizeNum,
        orderBy: [{ destacada: 'desc' }, { createdAt: 'desc' }],
        include: {
          fotos: { orderBy: { orden: 'asc' }, take: 3 },
          agente: { select: { id: true, slug: true, nombre: true, apellido: true, telefono: true, whatsapp: true, foto: true } },
        },
      }),
      prisma.propiedad.count({ where }),
    ])

    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json({ data, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

propiedadesRouter.get('/:slug', async (req, res, next) => {
  try {
    const propiedad = await prisma.propiedad.findUnique({
      where: { slug: req.params.slug, activa: true },
      include: {
        fotos: { orderBy: { orden: 'asc' } },
        agente: { select: { id: true, slug: true, nombre: true, apellido: true, telefono: true, whatsapp: true, foto: true, bio: true } },
      },
    })
    if (!propiedad) {
      res.status(404).json({ error: 'Not Found', message: 'Propiedad no encontrada', statusCode: 404 })
      return
    }
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json(propiedad)
  } catch (err) { next(err) }
})
