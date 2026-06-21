import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { prisma } from './prisma.js'
import { buildPdfHtml } from './pdfTemplate.js'

export async function generatePropertyPdf(propiedadId: string): Promise<Buffer> {
  const propiedad = await prisma.propiedad.findUnique({
    where: { id: propiedadId },
    include: {
      fotos: { orderBy: { orden: 'asc' } },
      agente: true,
    },
  })

  if (!propiedad) throw new Error('Propiedad no encontrada')

  const waUrl = `https://wa.me/${propiedad.agente.whatsapp}`
  const qrBase64 = await QRCode.toDataURL(waUrl, { width: 160, margin: 1 })
    .then(url => url.replace('data:image/png;base64,', ''))

  const fotosUrls = propiedad.fotos.map(f => f.url)
  const fotoPrincipalUrl = fotosUrls[0] ?? 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
  const fechaGeneracion = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const html = buildPdfHtml({
    titulo: propiedad.titulo,
    tipo: propiedad.tipo,
    precio: `Bs. ${Number(propiedad.precio).toLocaleString('es-BO')}`,
    ciudad: propiedad.ciudad,
    zona: propiedad.zona,
    dormitorios: propiedad.dormitorios,
    banos: propiedad.banos,
    superficieM2: propiedad.superficieM2 ? propiedad.superficieM2.toString() : null,
    garage: propiedad.garage,
    amueblado: propiedad.amueblado,
    descripcion: propiedad.descripcion,
    fotoPrincipalUrl,
    fotosUrls,
    agente: {
      nombre: propiedad.agente.nombre,
      apellido: propiedad.agente.apellido,
      telefono: propiedad.agente.telefono,
      whatsapp: propiedad.agente.whatsapp,
      fotoUrl: propiedad.agente.foto,
    },
    qrBase64,
    fechaGeneracion,
  })

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
    await prisma.pdfExport.create({
      data: { propiedadId, agenteId: propiedad.agenteId },
    })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
