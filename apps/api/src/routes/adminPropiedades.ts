import { Router } from 'express'
import type { Prisma, TipoInmueble, TipoOperacion } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireRole } from '../middleware/auth.js'
import type { AuthPayload } from '@elite/types'

export const adminPropiedadesRouter = Router()

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

async function uniqueSlug(base: string): Promise<string> {
  const cleanBase = makeSlug(base) || `propiedad-${Date.now()}`
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

async function canEdit(propiedadId: string, user: AuthPayload): Promise<boolean> {
  if (user.rol !== 'AGENTE') return true
  const agenteId = await getAgenteId(user.userId)
  const p = await prisma.propiedad.findUnique({
    where: { id: propiedadId },
    include: { captacion: { select: { agenteId: true } } },
  })
  return p?.agenteId === agenteId || p?.captacion?.agenteId === agenteId || p?.agenteAsignadoId === agenteId
}

// GET / — all properties with canEdit flag
adminPropiedadesRouter.get('/', async (req, res, next) => {
  try {
    const {
      tipo, tipoInmueble, ciudad, activa, destacada, agenteId, q,
      page = '1', pageSize = '20',
    } = req.query as Record<string, string>
    const where: Prisma.PropiedadWhereInput = {}
    if (tipo) where.tipo = tipo as TipoOperacion
    if (tipoInmueble) where.tipoInmueble = tipoInmueble as TipoInmueble
    if (ciudad) where.ciudad = { contains: ciudad, mode: 'insensitive' }
    if (activa !== undefined) where.activa = activa === 'true'
    if (destacada !== undefined) where.destacada = destacada === 'true'
    if (agenteId && req.user!.rol !== 'AGENTE') where.agenteId = agenteId
    if (q) {
      where.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { ciudad: { contains: q, mode: 'insensitive' } },
        { zona: { contains: q, mode: 'insensitive' } },
      ]
    }

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
        p.agenteId === userAgenteId ||
        p.captacion?.agenteId === userAgenteId ||
        p.agenteAsignadoId === userAgenteId,
    }))

    res.json({ data: result, total, page: pageNum, pageSize: pageSizeNum, totalPages: Math.ceil(total / pageSizeNum) })
  } catch (err) { next(err) }
})

// POST / — create property from CRM with optional public visibility
adminPropiedadesRouter.post('/', async (req, res, next) => {
  try {
    let agenteId = req.body.agenteId as string | undefined
    if (req.user!.rol === 'AGENTE') {
      agenteId = await getAgenteId(req.user!.userId) ?? undefined
    }

    const {
      titulo, descripcion, tipo, tipoInmueble, precio, moneda,
      ciudad, zona, direccion, dormitorios, banos, superficieM2,
      garage, amueblado, piscina, destacada, fotos, mostrarEnWeb,
    } = req.body as Record<string, unknown>

    if (!agenteId || !titulo || !tipo || !tipoInmueble || !precio || !ciudad) {
      res.status(400).json({
        error: 'Datos incompletos',
        message: 'Completa titulo, tipo, precio, ciudad y asesor responsable.',
        statusCode: 400,
      })
      return
    }

    const fotoUrls = Array.isArray(fotos)
      ? fotos.map(url => String(url).trim()).filter(Boolean)
      : []

    const slug = await uniqueSlug(String(titulo))
    const propiedad = await prisma.propiedad.create({
      data: {
        slug,
        titulo: String(titulo),
        descripcion: descripcion ? String(descripcion) : '',
        tipo: tipo as TipoOperacion,
        tipoInmueble: tipoInmueble as TipoInmueble,
        precio: Number(precio),
        moneda: moneda ? String(moneda) : 'BOB',
        ciudad: String(ciudad),
        zona: zona ? String(zona) : null,
        direccion: direccion ? String(direccion) : null,
        dormitorios: dormitorios ? Number(dormitorios) : null,
        banos: banos ? Number(banos) : null,
        superficieM2: superficieM2 ? Number(superficieM2) : null,
        garage: boolFromBody(garage),
        amueblado: boolFromBody(amueblado),
        piscina: boolFromBody(piscina),
        destacada: boolFromBody(destacada),
        activa: boolFromBody(mostrarEnWeb),
        agenteId,
        agenteAsignadoId: agenteId,
        fotos: fotoUrls.length
          ? { create: fotoUrls.map((url, orden) => ({ url, urlThumb: url, orden })) }
          : undefined,
      },
      include: {
        fotos: { orderBy: { orden: 'asc' } },
        agente: { select: { id: true, nombre: true, apellido: true } },
      },
    })

    res.status(201).json({ ...propiedad, canEdit: true })
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
        propiedad.agenteId === userAgenteId ||
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
    const {
      titulo, descripcion, tipo, tipoInmueble, precio, moneda,
      ciudad, zona, direccion, dormitorios, banos, superficieM2,
      garage, amueblado, piscina, destacada, activa,
    } = req.body as Record<string, unknown>
    const propiedad = await prisma.propiedad.update({
      where: { id: req.params.id },
      data: {
        ...(titulo !== undefined ? { titulo: String(titulo) } : {}),
        ...(descripcion !== undefined ? { descripcion: String(descripcion) } : {}),
        ...(tipo !== undefined ? { tipo: tipo as TipoOperacion } : {}),
        ...(tipoInmueble !== undefined ? { tipoInmueble: tipoInmueble as TipoInmueble } : {}),
        ...(precio !== undefined ? { precio: Number(precio) } : {}),
        ...(moneda !== undefined ? { moneda: String(moneda) } : {}),
        ...(ciudad !== undefined ? { ciudad: String(ciudad) } : {}),
        ...(zona !== undefined ? { zona: zona ? String(zona) : null } : {}),
        ...(direccion !== undefined ? { direccion: direccion ? String(direccion) : null } : {}),
        ...(dormitorios !== undefined ? { dormitorios: dormitorios ? Number(dormitorios) : null } : {}),
        ...(banos !== undefined ? { banos: banos ? Number(banos) : null } : {}),
        ...(superficieM2 !== undefined ? { superficieM2: superficieM2 ? Number(superficieM2) : null } : {}),
        ...(garage !== undefined ? { garage: boolFromBody(garage) } : {}),
        ...(amueblado !== undefined ? { amueblado: boolFromBody(amueblado) } : {}),
        ...(piscina !== undefined ? { piscina: boolFromBody(piscina) } : {}),
        ...(destacada !== undefined ? { destacada: boolFromBody(destacada) } : {}),
        ...(activa !== undefined ? { activa: boolFromBody(activa) } : {}),
        updatedAt: new Date(),
      },
    })
    res.json(propiedad)
  } catch (err) { next(err) }
})

// PATCH /:id/publicacion — switch visible on public website
adminPropiedadesRouter.patch('/:id/publicacion', async (req, res, next) => {
  try {
    if (!await canEdit(req.params.id, req.user!)) {
      res.status(403).json({ error: 'Sin permisos', message: 'No puedes cambiar la publicacion de esta propiedad.', statusCode: 403 })
      return
    }
    const { activa, destacada } = req.body as { activa?: boolean; destacada?: boolean }
    if (activa === undefined && destacada === undefined) {
      res.status(400).json({ error: 'Solicitud invalida', message: 'Elige al menos un estado para actualizar.', statusCode: 400 })
      return
    }
    const propiedad = await prisma.propiedad.update({
      where: { id: req.params.id },
      data: {
        ...(activa !== undefined ? { activa } : {}),
        ...(destacada !== undefined ? { destacada } : {}),
      },
      include: {
        fotos: { orderBy: { orden: 'asc' }, take: 1 },
        agente: { select: { id: true, nombre: true, apellido: true } },
        captacion: { select: { agenteId: true } },
      },
    })
    let userAgenteId: string | null = null
    if (req.user!.rol === 'AGENTE') userAgenteId = await getAgenteId(req.user!.userId)
    res.json({
      ...propiedad,
      canEdit: req.user!.rol !== 'AGENTE' ||
        propiedad.agenteId === userAgenteId ||
        propiedad.captacion?.agenteId === userAgenteId ||
        propiedad.agenteAsignadoId === userAgenteId,
    })
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
