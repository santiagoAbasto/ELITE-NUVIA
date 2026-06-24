import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const adminNotificacionesRouter = Router()

// GET / — notifications for current user
adminNotificacionesRouter.get('/', async (req, res, next) => {
  try {
    const notificaciones = await prisma.notificacion.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const noLeidas = notificaciones.filter(n => !n.leida).length
    res.json({ data: notificaciones, noLeidas })
  } catch (err) { next(err) }
})

// PATCH /:id/leer
adminNotificacionesRouter.patch('/:id/leer', async (req, res, next) => {
  try {
    const notificacion = await prisma.notificacion.update({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { leida: true },
    })
    res.json(notificacion)
  } catch (err) { next(err) }
})

// PATCH /leer-todas
adminNotificacionesRouter.patch('/leer-todas', async (req, res, next) => {
  try {
    await prisma.notificacion.updateMany({
      where: { userId: req.user!.userId, leida: false },
      data: { leida: true },
    })
    res.json({ message: 'Todas las notificaciones marcadas como leídas' })
  } catch (err) { next(err) }
})
