import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthPayload } from '@elite/types'
import type { TipoOperacion, TipoInmueble, EstadoCaptacion } from '@prisma/client'

export const adminCaptacionesRouter = Router()

async function getAgenteId(userId: string): Promise<string | null> {
  const agente = await prisma.agente.findFirst({ where: { user: { id: userId } }, select: { id: true } })
  return agente?.id ?? null
}

async function canEdit(captacionId: string, user: AuthPayload): Promise<boolean> {
  if (user.rol !== 'AGENTE') return true
  const agenteId = await getAgenteId(user.userId)
  const c = await prisma.captacion.findUnique({ where: { id: captacionId }, select: { agenteId: true } })
  return c?.agenteId === agenteId
}

// GET /
adminCaptacionesRouter.get('/', async (req, res, next) => {
  try {
    const { estado, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado

    if (req.user!.rol === 'AGENTE') {
      const agenteId = await getAgenteId(req.user!.userId)
      if (agenteId) where.agenteId = agenteId
    }

    const pageNum = Math.max(1, Number(page))
    const pageSizeNum = Math.min(50, Math.max(1, Number(pageSize)))

    const [data, total] = await Promise.all([
      prisma.captacion.findMany({
        where,
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
        include: { agente: { select: { id: true, nombre: true, apellido: true, foto: true } } },
      }),
      prisma.captacion.count({ where }),
    ])
    res.json({ data, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

// GET /:id
adminCaptacionesRouter.get('/:id', async (req, res, next) => {
  try {
    const captacion = await prisma.captacion.findUnique({
      where: { id: req.params.id },
      include: {
        agente: { select: { id: true, nombre: true, apellido: true, foto: true, telefono: true, email: true } },
        actividades: { orderBy: { createdAt: 'asc' }, include: { agente: { select: { nombre: true, apellido: true } } } },
        propiedad: { select: { id: true, slug: true, titulo: true } },
      },
    })
    if (!captacion) { res.status(404).json({ error: 'Not Found', message: 'Captacion no encontrada', statusCode: 404 }); return }
    res.json(captacion)
  } catch (err) { next(err) }
})

// POST /
adminCaptacionesRouter.post('/', async (req, res, next) => {
  try {
    let agenteId: string = req.body.agenteId as string
    if (req.user!.rol === 'AGENTE') {
      const id = await getAgenteId(req.user!.userId)
      if (!id) { res.status(403).json({ error: 'Forbidden', message: 'Agente no encontrado', statusCode: 403 }); return }
      agenteId = id
    }
    if (!agenteId) { res.status(400).json({ error: 'Bad Request', message: 'agenteId requerido', statusCode: 400 }); return }

    const {
      propietarioNombre, propietarioTelefono, propietarioEmail, propietarioDoc,
      tipoInmueble, tipo, ciudad, zona, direccion, descripcion,
      dormitorios, banos, superficieM2, garage, amueblado, piscina, fotos,
      precioSolicitado, precioSugerido, moneda, comisionPct,
      fechaCaptacion, contratoUrl, exclusividadInicio, exclusividadFin,
    } = req.body as Record<string, unknown>

    const captacion = await prisma.captacion.create({
      data: {
        propietarioNombre: propietarioNombre as string,
        propietarioTelefono: propietarioTelefono as string,
        propietarioEmail: (propietarioEmail as string) ?? null,
        propietarioDoc: (propietarioDoc as string) ?? null,
        tipoInmueble: tipoInmueble as TipoInmueble,
        tipo: tipo as TipoOperacion,
        ciudad: ciudad as string,
        zona: (zona as string) ?? null,
        direccion: (direccion as string) ?? null,
        descripcion: (descripcion as string) ?? null,
        dormitorios: dormitorios ? Number(dormitorios) : null,
        banos: banos ? Number(banos) : null,
        superficieM2: superficieM2 ? Number(superficieM2) : null,
        garage: Boolean(garage),
        amueblado: Boolean(amueblado),
        piscina: Boolean(piscina),
        fotos: (fotos as string[]) ?? [],
        precioSolicitado: Number(precioSolicitado),
        precioSugerido: precioSugerido ? Number(precioSugerido) : null,
        moneda: (moneda as string) ?? 'BOB',
        comisionPct: comisionPct ? Number(comisionPct) : null,
        fechaCaptacion: fechaCaptacion ? new Date(fechaCaptacion as string) : new Date(),
        contratoUrl: (contratoUrl as string) ?? null,
        exclusividadInicio: exclusividadInicio ? new Date(exclusividadInicio as string) : null,
        exclusividadFin: exclusividadFin ? new Date(exclusividadFin as string) : null,
        agenteId,
      },
    })
    res.status(201).json(captacion)
  } catch (err) { next(err) }
})

// PUT /:id
adminCaptacionesRouter.put('/:id', async (req, res, next) => {
  try {
    if (!await canEdit(req.params.id, req.user!)) {
      res.status(403).json({ error: 'Forbidden', message: 'Sin permiso para editar esta captación', statusCode: 403 })
      return
    }
    const captacion = await prisma.captacion.update({
      where: { id: req.params.id },
      data: { ...req.body },
    })
    res.json(captacion)
  } catch (err) { next(err) }
})

// PATCH /:id/estado — advance estado; on CAPTADA auto-create Propiedad
adminCaptacionesRouter.patch('/:id/estado', async (req, res, next) => {
  try {
    if (!await canEdit(req.params.id, req.user!)) {
      res.status(403).json({ error: 'Forbidden', message: 'Sin permiso', statusCode: 403 })
      return
    }
    const { estado } = req.body as { estado: EstadoCaptacion }
    const validEstados = ['EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA']
    if (!validEstados.includes(estado)) {
      res.status(400).json({ error: 'Bad Request', message: 'Estado inválido', statusCode: 400 })
      return
    }

    const captacion = await prisma.captacion.findUnique({ where: { id: req.params.id } })
    if (!captacion) { res.status(404).json({ error: 'Not Found', message: 'Captacion no encontrada', statusCode: 404 }); return }

    // Auto-create Propiedad when advancing to CAPTADA
    if (estado === 'CAPTADA' && !captacion.propiedadId) {
      const slug = `${captacion.ciudad}-${captacion.tipoInmueble}-${Date.now()}`
        .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const propiedad = await prisma.propiedad.create({
        data: {
          slug,
          titulo: `${captacion.tipoInmueble} en ${captacion.ciudad}${captacion.zona ? ` - ${captacion.zona}` : ''}`,
          descripcion: captacion.descripcion ?? '',
          tipo: captacion.tipo,
          tipoInmueble: captacion.tipoInmueble,
          precio: captacion.precioSugerido ?? captacion.precioSolicitado,
          moneda: captacion.moneda,
          ciudad: captacion.ciudad,
          zona: captacion.zona,
          direccion: captacion.direccion,
          dormitorios: captacion.dormitorios,
          banos: captacion.banos,
          superficieM2: captacion.superficieM2,
          garage: captacion.garage,
          amueblado: captacion.amueblado,
          piscina: captacion.piscina,
          agenteId: captacion.agenteId,
          activa: false, // requires explicit activation
        },
      })

      await prisma.captacion.update({
        where: { id: req.params.id },
        data: { estado, propiedadId: propiedad.id },
      })

      res.json({ captacion: { ...captacion, estado, propiedadId: propiedad.id }, propiedadCreada: propiedad })
      return
    }

    const updated = await prisma.captacion.update({ where: { id: req.params.id }, data: { estado } })
    res.json(updated)
  } catch (err) { next(err) }
})

// POST /:id/actividad
adminCaptacionesRouter.post('/:id/actividad', async (req, res, next) => {
  try {
    const { tipo, descripcion } = req.body as { tipo?: string; descripcion?: string }
    if (!tipo || !descripcion) {
      res.status(400).json({ error: 'Bad Request', message: 'tipo y descripcion requeridos', statusCode: 400 })
      return
    }
    const agenteId = await getAgenteId(req.user!.userId) ?? req.body.agenteId as string
    if (!agenteId) { res.status(400).json({ error: 'Bad Request', message: 'No se pudo resolver el agente', statusCode: 400 }); return }

    const actividad = await prisma.actividadCaptacion.create({
      data: { captacionId: req.params.id, agenteId, tipo, descripcion },
      include: { agente: { select: { nombre: true, apellido: true } } },
    })
    res.status(201).json(actividad)
  } catch (err) { next(err) }
})
