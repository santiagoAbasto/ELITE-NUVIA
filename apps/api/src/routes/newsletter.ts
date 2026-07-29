import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyJWT } from '../middleware/auth.js'
import { publicWriteRateLimiter } from '../middleware/rateLimiter.js'

export const newsletterRouter = Router()

newsletterRouter.post('/subscribe', publicWriteRateLimiter, async (req, res, next) => {
  try {
    const { email, nombre } = req.body as { email?: string; nombre?: string }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      res.status(400).json({ error: 'Bad Request', message: 'Email valido requerido', statusCode: 400 })
      return
    }
    if (nombre && nombre.length > 120) {
      res.status(400).json({ error: 'Bad Request', message: 'Nombre demasiado largo', statusCode: 400 })
      return
    }

    const existing = await prisma.subscriber.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      if (existing.activo) {
        res.json({ message: 'Ya estas suscrito a nuestras novedades.' })
        return
      }
      await prisma.subscriber.update({ where: { email: email.toLowerCase() }, data: { activo: true, nombre: nombre?.trim() || existing.nombre } })
      res.json({ message: 'Suscripcion reactivada. Bienvenido de vuelta!' })
      return
    }

    await prisma.subscriber.create({
      data: { email: email.toLowerCase().trim(), nombre: nombre?.trim() || null },
    })

    res.status(201).json({ message: '¡Suscripcion exitosa! Recibiras las mejores novedades inmobiliarias de Bolivia.' })
  } catch (err) { next(err) }
})

newsletterRouter.get('/subscribers', verifyJWT, async (_req, res, next) => {
  try {
    const subs = await prisma.subscriber.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, nombre: true, createdAt: true },
    })
    res.json({ data: subs, total: subs.length })
  } catch (err) { next(err) }
})
