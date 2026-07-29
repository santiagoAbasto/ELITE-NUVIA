import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import type { AuthPayload } from '@elite/types'
import type { Prisma, TipoOperacion, TipoInmueble, EstadoCaptacion, Captacion } from '@prisma/client'

export const adminCaptacionesRouter = Router()

async function getAgenteId(userId: string): Promise<string | null> {
  const agente = await prisma.agente.findFirst({ where: { user: { id: userId } }, select: { id: true } })
  return agente?.id ?? null
}

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function uniquePropertySlug(base: string): Promise<string> {
  const cleanBase = makeSlug(base) || `captacion-${Date.now()}`
  let slug = cleanBase
  let idx = 2
  while (await prisma.propiedad.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${cleanBase}-${idx}`
    idx += 1
  }
  return slug
}

function boolFromBody(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return fallback
}

async function createPropertyFromCaptacion(captacion: Captacion, activa: boolean) {
  const title = `${captacion.tipoInmueble} en ${captacion.ciudad}${captacion.zona ? ` - ${captacion.zona}` : ''}`
  const slug = await uniquePropertySlug(title)
  const fotos = Array.isArray(captacion.fotos)
    ? (captacion.fotos as string[]).map(url => String(url).trim()).filter(Boolean)
    : []

  return prisma.propiedad.create({
    data: {
      slug,
      titulo: title,
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
      agenteAsignadoId: captacion.agenteId,
      activa,
      fotos: fotos.length
        ? { create: fotos.map((url, orden) => ({ url, urlThumb: url, orden })) }
        : undefined,
    },
  })
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
    const { estado, tipo, ciudad, agenteId, q, page = '1', pageSize = '20' } = req.query as Record<string, string>
    const where: Prisma.CaptacionWhereInput = {}
    if (estado) where.estado = estado as EstadoCaptacion
    if (tipo) where.tipo = tipo as TipoOperacion
    if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' }
    if (agenteId && req.user!.rol !== 'AGENTE') where.agenteId = agenteId
    if (q) {
      where.OR = [
        { propietarioNombre: { contains: q, mode: 'insensitive' } },
        { propietarioTelefono: { contains: q, mode: 'insensitive' } },
        { ciudad: { contains: q, mode: 'insensitive' } },
        { zona: { contains: q, mode: 'insensitive' } },
      ]
    }

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
        include: {
          agente: { select: { id: true, nombre: true, apellido: true, foto: true } },
          propiedad: { select: { id: true, slug: true, titulo: true, activa: true } },
        },
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
      mostrarEnWeb,
    } = req.body as Record<string, unknown>

    if (!propietarioNombre || !propietarioTelefono || !tipoInmueble || !tipo || !ciudad || !precioSolicitado) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Completa propietario, telefono, tipo de inmueble, operacion, ciudad y precio.',
        statusCode: 400,
      })
      return
    }

    const shouldPublish = boolFromBody(mostrarEnWeb)
    const captacion = await prisma.captacion.create({
      data: {
        propietarioNombre: String(propietarioNombre),
        propietarioTelefono: String(propietarioTelefono),
        propietarioEmail: propietarioEmail ? String(propietarioEmail) : null,
        propietarioDoc: propietarioDoc ? String(propietarioDoc) : null,
        tipoInmueble: tipoInmueble as TipoInmueble,
        tipo: tipo as TipoOperacion,
        ciudad: String(ciudad),
        zona: zona ? String(zona) : null,
        direccion: direccion ? String(direccion) : null,
        descripcion: descripcion ? String(descripcion) : null,
        dormitorios: dormitorios ? Number(dormitorios) : null,
        banos: banos ? Number(banos) : null,
        superficieM2: superficieM2 ? Number(superficieM2) : null,
        garage: boolFromBody(garage),
        amueblado: boolFromBody(amueblado),
        piscina: boolFromBody(piscina),
        fotos: Array.isArray(fotos) ? fotos : [],
        precioSolicitado: Number(precioSolicitado),
        precioSugerido: precioSugerido ? Number(precioSugerido) : null,
        moneda: moneda ? String(moneda) : 'BOB',
        comisionPct: comisionPct ? Number(comisionPct) : null,
        fechaCaptacion: fechaCaptacion ? new Date(fechaCaptacion as string) : new Date(),
        contratoUrl: contratoUrl ? String(contratoUrl) : null,
        exclusividadInicio: exclusividadInicio ? new Date(exclusividadInicio as string) : null,
        exclusividadFin: exclusividadFin ? new Date(exclusividadFin as string) : null,
        estado: shouldPublish ? 'PUBLICADA' : 'EN_NEGOCIACION',
        agenteId,
      },
    })

    if (shouldPublish) {
      const propiedad = await createPropertyFromCaptacion(captacion, true)
      const updated = await prisma.captacion.update({
        where: { id: captacion.id },
        data: { propiedadId: propiedad.id },
      })
      res.status(201).json({ ...updated, propiedad })
      return
    }

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
    const {
      propietarioNombre, propietarioTelefono, propietarioEmail, propietarioDoc,
      tipoInmueble, tipo, ciudad, zona, direccion, descripcion,
      dormitorios, banos, superficieM2, garage, amueblado, piscina,
      precioSolicitado, precioSugerido, moneda, comisionPct,
      contratoUrl, exclusividadInicio, exclusividadFin,
    } = req.body as Record<string, unknown>

    const captacion = await prisma.captacion.update({
      where: { id: req.params.id },
      data: {
        ...(propietarioNombre !== undefined ? { propietarioNombre: String(propietarioNombre) } : {}),
        ...(propietarioTelefono !== undefined ? { propietarioTelefono: String(propietarioTelefono) } : {}),
        ...(propietarioEmail !== undefined ? { propietarioEmail: propietarioEmail ? String(propietarioEmail) : null } : {}),
        ...(propietarioDoc !== undefined ? { propietarioDoc: propietarioDoc ? String(propietarioDoc) : null } : {}),
        ...(tipoInmueble !== undefined ? { tipoInmueble: tipoInmueble as TipoInmueble } : {}),
        ...(tipo !== undefined ? { tipo: tipo as TipoOperacion } : {}),
        ...(ciudad !== undefined ? { ciudad: String(ciudad) } : {}),
        ...(zona !== undefined ? { zona: zona ? String(zona) : null } : {}),
        ...(direccion !== undefined ? { direccion: direccion ? String(direccion) : null } : {}),
        ...(descripcion !== undefined ? { descripcion: descripcion ? String(descripcion) : null } : {}),
        ...(dormitorios !== undefined ? { dormitorios: dormitorios ? Number(dormitorios) : null } : {}),
        ...(banos !== undefined ? { banos: banos ? Number(banos) : null } : {}),
        ...(superficieM2 !== undefined ? { superficieM2: superficieM2 ? Number(superficieM2) : null } : {}),
        ...(garage !== undefined ? { garage: boolFromBody(garage) } : {}),
        ...(amueblado !== undefined ? { amueblado: boolFromBody(amueblado) } : {}),
        ...(piscina !== undefined ? { piscina: boolFromBody(piscina) } : {}),
        ...(precioSolicitado !== undefined ? { precioSolicitado: Number(precioSolicitado) } : {}),
        ...(precioSugerido !== undefined ? { precioSugerido: precioSugerido ? Number(precioSugerido) : null } : {}),
        ...(moneda !== undefined ? { moneda: String(moneda) } : {}),
        ...(comisionPct !== undefined ? { comisionPct: comisionPct ? Number(comisionPct) : null } : {}),
        ...(contratoUrl !== undefined ? { contratoUrl: contratoUrl ? String(contratoUrl) : null } : {}),
        ...(exclusividadInicio !== undefined ? { exclusividadInicio: exclusividadInicio ? new Date(exclusividadInicio as string) : null } : {}),
        ...(exclusividadFin !== undefined ? { exclusividadFin: exclusividadFin ? new Date(exclusividadFin as string) : null } : {}),
      },
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

    // Auto-create Propiedad when advancing to CAPTADA or PUBLICADA.
    // PUBLICADA also turns on public web visibility.
    if (['CAPTADA', 'PUBLICADA'].includes(estado) && !captacion.propiedadId) {
      const propiedad = await createPropertyFromCaptacion(captacion, estado === 'PUBLICADA')

      await prisma.captacion.update({
        where: { id: req.params.id },
        data: { estado, propiedadId: propiedad.id },
      })

      res.json({ captacion: { ...captacion, estado, propiedadId: propiedad.id }, propiedadCreada: propiedad })
      return
    }

    if (estado === 'PUBLICADA' && captacion.propiedadId) {
      await prisma.propiedad.update({ where: { id: captacion.propiedadId }, data: { activa: true } })
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
