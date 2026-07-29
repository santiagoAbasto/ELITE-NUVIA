import { Router } from 'express'
import type { Request } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { generateReportPdf } from '../lib/pdf.js'

export const adminReportesRouter = Router()

const LEAD_ESTADOS = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO'] as const
const CAPTACION_ESTADOS = ['EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA'] as const
const TEMPERATURAS = ['CALIENTE', 'TIBIO', 'FRIO'] as const

async function getAgenteForUser(userId: string) {
  return prisma.agente.findFirst({
    where: { user: { id: userId } },
    select: { id: true, nombre: true, apellido: true, primerApellido: true },
  })
}

async function getReportScope(req: Request) {
  if (req.user!.rol !== 'AGENTE') {
    return {
      agenteId: null as string | null,
      scopeLabel: 'Equipo completo',
      generadoPor: req.user!.nombre,
    }
  }

  const agente = await getAgenteForUser(req.user!.userId)
  const nombre = agente
    ? `${agente.nombre} ${agente.primerApellido ?? agente.apellido}`
    : req.user!.nombre

  return {
    agenteId: agente?.id ?? '__sin_agente__',
    scopeLabel: `Asesor: ${nombre}`,
    generadoPor: nombre,
  }
}

function propiedadWhere(agenteId: string | null, extra: Prisma.PropiedadWhereInput = {}): Prisma.PropiedadWhereInput {
  if (!agenteId) return extra
  return {
    AND: [
      extra,
      {
        OR: [
          { agenteId },
          { agenteAsignadoId: agenteId },
          { captacion: { is: { agenteId } } },
        ],
      },
    ],
  }
}

function captacionWhere(agenteId: string | null, extra: Prisma.CaptacionWhereInput = {}): Prisma.CaptacionWhereInput {
  return agenteId ? { AND: [extra, { agenteId }] } : extra
}

function leadWhere(agenteId: string | null, extra: Prisma.LeadWhereInput = {}): Prisma.LeadWhereInput {
  return agenteId ? { AND: [extra, { agenteId }] } : extra
}

function eventoWhere(agenteId: string | null, extra: Prisma.EventoWhereInput = {}): Prisma.EventoWhereInput {
  return agenteId ? { AND: [extra, { agenteId }] } : extra
}

async function buildReportData(req: Request) {
  const scope = await getReportScope(req)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  const [
    propiedadesActivas,
    propiedadesVenta,
    propiedadesAlquiler,
    propiedadesAnticretico,
    captacionesActivas,
    captacionesMes,
    captacionesUltimoMes,
    leadsTotal,
    leadsMes,
    leadsUltimoMes,
    leadsCerradosMes,
    leadsCerradosUltimoMes,
    eventosProximos,
    agentesActivos,
  ] = await Promise.all([
    prisma.propiedad.count({ where: propiedadWhere(scope.agenteId, { activa: true }) }),
    prisma.propiedad.count({ where: propiedadWhere(scope.agenteId, { activa: true, tipo: 'VENTA' }) }),
    prisma.propiedad.count({ where: propiedadWhere(scope.agenteId, { activa: true, tipo: 'ALQUILER' }) }),
    prisma.propiedad.count({ where: propiedadWhere(scope.agenteId, { activa: true, tipo: 'ANTICRETICO' }) }),
    prisma.captacion.count({ where: captacionWhere(scope.agenteId, { estado: { notIn: ['CERRADA', 'EXPIRADA'] } }) }),
    prisma.captacion.count({ where: captacionWhere(scope.agenteId, { createdAt: { gte: startOfMonth } }) }),
    prisma.captacion.count({ where: captacionWhere(scope.agenteId, { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }) }),
    prisma.lead.count({ where: leadWhere(scope.agenteId) }),
    prisma.lead.count({ where: leadWhere(scope.agenteId, { createdAt: { gte: startOfMonth } }) }),
    prisma.lead.count({ where: leadWhere(scope.agenteId, { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }) }),
    prisma.lead.count({ where: leadWhere(scope.agenteId, { estado: 'CERRADO', updatedAt: { gte: startOfMonth } }) }),
    prisma.lead.count({ where: leadWhere(scope.agenteId, { estado: 'CERRADO', updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth } }) }),
    prisma.evento.count({ where: eventoWhere(scope.agenteId, { inicio: { gte: now } }) }),
    scope.agenteId ? 1 : prisma.agente.count({ where: { activo: true } }),
  ])

  const leadsPorEstado = await Promise.all(
    LEAD_ESTADOS.map(async estado => ({
      estado,
      count: await prisma.lead.count({ where: leadWhere(scope.agenteId, { estado }) }),
    }))
  )

  const leadsPorMes = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const inicio = new Date(d.getFullYear(), d.getMonth(), 1)
    const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    const [total, cerrados] = await Promise.all([
      prisma.lead.count({ where: leadWhere(scope.agenteId, { createdAt: { gte: inicio, lte: fin } }) }),
      prisma.lead.count({ where: leadWhere(scope.agenteId, { estado: 'CERRADO', updatedAt: { gte: inicio, lte: fin } }) }),
    ])
    leadsPorMes.push({
      mes: inicio.toLocaleDateString('es-BO', { month: 'short', year: '2-digit' }),
      total,
      cerrados,
    })
  }

  const captacionesPorEstado = await Promise.all(
    CAPTACION_ESTADOS.map(async estado => ({
      estado,
      count: await prisma.captacion.count({ where: captacionWhere(scope.agenteId, { estado }) }),
    }))
  )

  const agentes = await prisma.agente.findMany({
    where: scope.agenteId ? { id: scope.agenteId } : { activo: true },
    select: { id: true, nombre: true, apellido: true, primerApellido: true, foto: true },
  })

  const rendimientoAgentes = await Promise.all(
    agentes.map(async a => {
      const [propiedades, captaciones, leadsActivos, cierresMes, totalLeads] = await Promise.all([
        prisma.propiedad.count({ where: propiedadWhere(a.id, { activa: true }) }),
        prisma.captacion.count({ where: { agenteId: a.id, estado: { notIn: ['CERRADA', 'EXPIRADA'] } } }),
        prisma.lead.count({ where: { agenteId: a.id, estado: { notIn: ['CERRADO', 'PERDIDO'] } } }),
        prisma.lead.count({ where: { agenteId: a.id, estado: 'CERRADO', updatedAt: { gte: startOfMonth } } }),
        prisma.lead.count({ where: { agenteId: a.id } }),
      ])
      return {
        id: a.id,
        nombre: [a.nombre, a.primerApellido ?? a.apellido].join(' '),
        foto: a.foto,
        propiedades,
        captaciones,
        leadsActivos,
        cierresMes,
        tasaConversion: totalLeads > 0 ? Math.round((cierresMes / totalLeads) * 100) : 0,
      }
    })
  )

  const groupedCities = await prisma.propiedad.groupBy({
    by: ['ciudad'],
    where: propiedadWhere(scope.agenteId, { activa: true }),
    _count: { _all: true },
    orderBy: { _count: { ciudad: 'desc' } },
    take: 8,
  })

  const leadsPorTemperatura = await Promise.all(
    TEMPERATURAS.map(async temperatura => ({
      temperatura,
      count: await prisma.lead.count({ where: leadWhere(scope.agenteId, { temperatura }) }),
    }))
  )

  const resumen = {
    propiedades: {
      activas: propiedadesActivas,
      venta: propiedadesVenta,
      alquiler: propiedadesAlquiler,
      anticretico: propiedadesAnticretico,
    },
    captaciones: { activas: captacionesActivas, mes: captacionesMes, ultimoMes: captacionesUltimoMes },
    leads: {
      total: leadsTotal,
      mes: leadsMes,
      ultimoMes: leadsUltimoMes,
      cerradosMes: leadsCerradosMes,
      cerradosUltimoMes: leadsCerradosUltimoMes,
      tasaConversionMes: leadsMes > 0 ? Math.round((leadsCerradosMes / leadsMes) * 100) : 0,
      tasaConversionUltimoMes: leadsUltimoMes > 0 ? Math.round((leadsCerradosUltimoMes / leadsUltimoMes) * 100) : 0,
    },
    eventos: { proximos: eventosProximos },
    agentes: { activos: agentesActivos },
  }

  return {
    scopeLabel: scope.scopeLabel,
    generadoPor: scope.generadoPor,
    resumen,
    leadsPorEstado,
    leadsPorMes,
    captacionesPorEstado,
    rendimientoAgentes: rendimientoAgentes.sort((a, b) => b.cierresMes - a.cierresMes),
    propiedadesPorCiudad: groupedCities.map(g => ({ ciudad: g.ciudad, count: g._count._all })),
    leadsPorTemperatura,
  }
}

adminReportesRouter.get('/resumen', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.resumen)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/leads-por-estado', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.leadsPorEstado)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/leads-por-mes', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.leadsPorMes)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/captaciones-por-estado', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.captacionesPorEstado)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/rendimiento-agentes', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.rendimientoAgentes)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/propiedades-por-ciudad', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.propiedadesPorCiudad)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/leads-por-temperatura', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    res.json(data.leadsPorTemperatura)
  } catch (err) { next(err) }
})

adminReportesRouter.get('/export/pdf', async (req, res, next) => {
  try {
    const data = await buildReportData(req)
    const pdfBuffer = await generateReportPdf(data)
    const filename = data.scopeLabel.toLowerCase().includes('asesor')
      ? 'elite-nuvia-reporte-asesor.pdf'
      : 'elite-nuvia-reporte-equipo.pdf'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (err) { next(err) }
})
