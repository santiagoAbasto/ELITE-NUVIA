import { Router } from 'express'
import { verifyJWT } from '../middleware/auth.js'
import { generatePropertyPdf } from '../lib/pdf.js'
import { prisma } from '../lib/prisma.js'

export const adminRouter = Router()
adminRouter.use(verifyJWT)

adminRouter.get('/pdf/:propiedadId', async (req, res, next) => {
  try {
    const { propiedadId } = req.params
    const user = req.user!

    if (user.rol === 'AGENTE') {
      const propiedad = await prisma.propiedad.findFirst({
        where: { id: propiedadId },
        include: { agente: { include: { user: true } } },
      })
      if (!propiedad || propiedad.agente.user?.id !== user.userId) {
        res.status(403).json({ error: 'Forbidden', message: 'Solo puedes generar PDFs de tus propiedades', statusCode: 403 })
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
