import { Router } from 'express'
import { verifyJWT } from '../middleware/auth.js'
import { generatePropertyPdf, generateCaptacionPdf } from '../lib/pdf.js'
import { prisma } from '../lib/prisma.js'

export const adminRouter = Router()
adminRouter.use(verifyJWT)

// GET /pdf/:propiedadId
adminRouter.get('/pdf/:propiedadId', async (req, res, next) => {
  try {
    const { propiedadId } = req.params
    const user = req.user!

    if (user.rol === 'AGENTE') {
      const agente = await prisma.agente.findFirst({ where: { user: { id: user.userId } } })
      const propiedad = await prisma.propiedad.findUnique({
        where: { id: propiedadId },
        include: { captacion: { select: { agenteId: true } } },
      })
      const canGenerate =
        propiedad?.captacion?.agenteId === agente?.id ||
        propiedad?.agenteAsignadoId === agente?.id
      if (!canGenerate) {
        res.status(403).json({ error: 'Forbidden', message: 'Sin permiso para generar este PDF', statusCode: 403 })
        return
      }
    }

    const pdfBuffer = await generatePropertyPdf(propiedadId)
    const propiedad = await prisma.propiedad.findUnique({
      where: { id: propiedadId },
      select: { slug: true, agente: { select: { apellido: true } } },
    })
    const filename = `elite-nuvia-${propiedad?.slug ?? propiedadId}-${propiedad?.agente.apellido?.toLowerCase() ?? 'agente'}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (err) { next(err) }
})

// GET /pdf/captacion/:captacionId
adminRouter.get('/pdf/captacion/:captacionId', async (req, res, next) => {
  try {
    const { captacionId } = req.params
    const user = req.user!

    if (user.rol === 'AGENTE') {
      const agente = await prisma.agente.findFirst({ where: { user: { id: user.userId } } })
      const captacion = await prisma.captacion.findUnique({ where: { id: captacionId }, select: { agenteId: true } })
      if (!captacion || captacion.agenteId !== agente?.id) {
        res.status(403).json({ error: 'Forbidden', message: 'Sin permiso para generar este PDF', statusCode: 403 })
        return
      }
    }

    const pdfBuffer = await generateCaptacionPdf(captacionId)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="captacion-${captacionId}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) { next(err) }
})
