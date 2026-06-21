import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const testimoniosRouter = Router()

testimoniosRouter.get('/', async (_req, res, next) => {
  try {
    const testimonios = await prisma.testimonio.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    })
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.json(testimonios)
  } catch (err) { next(err) }
})
