import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyJWT, requireRole } from '../middleware/auth.js'

export const cmsRouter = Router()

// GET — public, no auth (public site reads CMS content)
cmsRouter.get('/:seccion', async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findUnique({ where: { seccion: req.params.seccion } })
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json(content ?? { seccion: req.params.seccion, datos: {} })
  } catch (err) { next(err) }
})

// PUT — SUPER_ADMIN only
cmsRouter.put('/:seccion', verifyJWT, requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const content = await prisma.siteContent.upsert({
      where: { seccion: req.params.seccion },
      update: { datos: req.body, updatedBy: req.user!.userId },
      create: { seccion: req.params.seccion, datos: req.body, updatedBy: req.user!.userId },
    })
    res.json(content)
  } catch (err) { next(err) }
})
