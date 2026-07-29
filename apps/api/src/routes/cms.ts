import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyJWT, requireModule } from '../middleware/auth.js'

export const cmsRouter = Router()

// GET — public, no auth (public site reads CMS content)
cmsRouter.get('/:seccion', async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findUnique({ where: { seccion: req.params.seccion } })
    res.setHeader('Cache-Control', 'no-store')
    res.json(content ?? { seccion: req.params.seccion, datos: {} })
  } catch (err) { next(err) }
})

// PUT — SUPER_ADMIN or a COORDINADOR with the "cms" permiso
cmsRouter.put('/:seccion', verifyJWT, requireModule('cms'), async (req, res, next) => {
  try {
    const content = await prisma.siteContent.upsert({
      where: { seccion: req.params.seccion },
      update: { datos: req.body, updatedBy: req.user!.userId },
      create: { seccion: req.params.seccion, datos: req.body, updatedBy: req.user!.userId },
    })
    res.json(content)
  } catch (err) { next(err) }
})
