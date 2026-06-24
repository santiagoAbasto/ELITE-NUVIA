import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const adminReportesRouter = Router()

// GET /resumen — global metrics snapshot
adminReportesRouter.get('/resumen', async (req, res, next) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

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
      agentesMes,
    ] = await Promise.all([
      prisma.propiedad.count({ where: { activa: true } }),
      prisma.propiedad.count({ where: { activa: true, tipo: 'VENTA' } }),
      prisma.propiedad.count({ where: { activa: true, tipo: 'ALQUILER' } }),
      prisma.propiedad.count({ where: { activa: true, tipo: 'ANTICRETICO' } }),
      prisma.captacion.count({ where: { estado: { notIn: ['CERRADA', 'EXPIRADA'] } } }),
      prisma.captacion.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.captacion.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.lead.count({ where: { estado: 'CERRADO', updatedAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { estado: 'CERRADO', updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.evento.count({ where: { inicio: { gte: now } } }),
      prisma.agente.count({ where: { activo: true } }),
    ])

    const tasaConversionMes = leadsMes > 0 ? Math.round((leadsCerradosMes / leadsMes) * 100) : 0
    const tasaConversionUltimoMes = leadsUltimoMes > 0 ? Math.round((leadsCerradosUltimoMes / leadsUltimoMes) * 100) : 0

    res.json({
      propiedades: { activas: propiedadesActivas, venta: propiedadesVenta, alquiler: propiedadesAlquiler, anticretico: propiedadesAnticretico },
      captaciones: { activas: captacionesActivas, mes: captacionesMes, ultimoMes: captacionesUltimoMes },
      leads: { total: leadsTotal, mes: leadsMes, ultimoMes: leadsUltimoMes, cerradosMes: leadsCerradosMes, cerradosUltimoMes: leadsCerradosUltimoMes, tasaConversionMes, tasaConversionUltimoMes },
      eventos: { proximos: eventosProximos },
      agentes: { activos: agentesMes },
    })
  } catch (err) { next(err) }
})

// GET /leads-por-estado — for bar/donut chart
adminReportesRouter.get('/leads-por-estado', async (_req, res, next) => {
  try {
    const estados = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO']
    const counts = await Promise.all(
      estados.map(e => prisma.lead.count({ where: { estado: e as 'NUEVO' | 'EN_CONTACTO' | 'INTERESADO' | 'NEGOCIACION' | 'CERRADO' | 'PERDIDO' } }))
    )
    res.json(estados.map((estado, i) => ({ estado, count: counts[i] })))
  } catch (err) { next(err) }
})

// GET /leads-por-mes — last 6 months
adminReportesRouter.get('/leads-por-mes', async (_req, res, next) => {
  try {
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const inicio = new Date(d.getFullYear(), d.getMonth(), 1)
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      const [total, cerrados] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: inicio, lte: fin } } }),
        prisma.lead.count({ where: { estado: 'CERRADO', updatedAt: { gte: inicio, lte: fin } } }),
      ])
      meses.push({
        mes: inicio.toLocaleDateString('es-BO', { month: 'short', year: '2-digit' }),
        total,
        cerrados,
      })
    }
    res.json(meses)
  } catch (err) { next(err) }
})

// GET /captaciones-por-estado
adminReportesRouter.get('/captaciones-por-estado', async (_req, res, next) => {
  try {
    const estados = ['EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA']
    const counts = await Promise.all(
      estados.map(e => prisma.captacion.count({ where: { estado: e as 'EN_NEGOCIACION' | 'CAPTADA' | 'PUBLICADA' | 'EN_CIERRE' | 'CERRADA' | 'EXPIRADA' } }))
    )
    res.json(estados.map((estado, i) => ({ estado, count: counts[i] })))
  } catch (err) { next(err) }
})

// GET /rendimiento-agentes — per-agent metrics
adminReportesRouter.get('/rendimiento-agentes', async (_req, res, next) => {
  try {
    const agentes = await prisma.agente.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true, primerApellido: true, foto: true },
    })

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const rendimiento = await Promise.all(
      agentes.map(async a => {
        const [propiedades, captaciones, leadsActivos, cierresMes, totalLeads] = await Promise.all([
          prisma.propiedad.count({ where: { agenteId: a.id, activa: true } }),
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

    res.json(rendimiento.sort((a, b) => b.cierresMes - a.cierresMes))
  } catch (err) { next(err) }
})

// GET /propiedades-por-ciudad
adminReportesRouter.get('/propiedades-por-ciudad', async (_req, res, next) => {
  try {
    const grouped = await prisma.propiedad.groupBy({
      by: ['ciudad'],
      where: { activa: true },
      _count: { _all: true },
      orderBy: { _count: { ciudad: 'desc' } },
      take: 8,
    })
    res.json(grouped.map(g => ({ ciudad: g.ciudad, count: g._count._all })))
  } catch (err) { next(err) }
})

// GET /leads-por-temperatura
adminReportesRouter.get('/leads-por-temperatura', async (_req, res, next) => {
  try {
    const temps = ['CALIENTE', 'TIBIO', 'FRIO']
    const counts = await Promise.all(temps.map(t => prisma.lead.count({ where: { temperatura: t } })))
    res.json(temps.map((temperatura, i) => ({ temperatura, count: counts[i] })))
  } catch (err) { next(err) }
})
