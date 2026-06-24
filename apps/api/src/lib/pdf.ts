import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { prisma } from './prisma.js'
import { buildPdfHtml } from './pdfTemplate.js'
import { buildCaptacionPdfHtml } from './captacionPdfTemplate.js'

async function launchBrowser() {
  return puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
}

async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await launchBrowser()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

export async function generatePropertyPdf(propiedadId: string): Promise<Buffer> {
  const propiedad = await prisma.propiedad.findUnique({
    where: { id: propiedadId },
    include: {
      fotos: { orderBy: { orden: 'asc' } },
      agente: {
        select: {
          nombre: true, apellido: true, primerApellido: true, segundoApellido: true,
          telefono: true, whatsapp: true, email: true, foto: true,
        },
      },
    },
  })

  if (!propiedad) throw new Error('Propiedad no encontrada')

  const waUrl = `https://wa.me/${propiedad.agente.whatsapp}`
  const qrBase64 = await QRCode.toDataURL(waUrl, { width: 160, margin: 1 })
    .then(url => url.replace('data:image/png;base64,', ''))

  const fotosUrls = propiedad.fotos.map(f => f.url)
  const fotoPrincipalUrl = fotosUrls[0] ?? ''
  const fechaGeneracion = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const nombreCompleto = [
    propiedad.agente.nombre,
    propiedad.agente.primerApellido ?? propiedad.agente.apellido,
    propiedad.agente.segundoApellido,
  ].filter(Boolean).join(' ')

  const html = buildPdfHtml({
    titulo: propiedad.titulo,
    tipo: propiedad.tipo,
    precio: `${propiedad.moneda} ${Number(propiedad.precio).toLocaleString('es-BO')}`,
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
      apellido: propiedad.agente.primerApellido ?? propiedad.agente.apellido,
      nombreCompleto,
      telefono: propiedad.agente.telefono,
      whatsapp: propiedad.agente.whatsapp,
      email: propiedad.agente.email,
      fotoUrl: propiedad.agente.foto,
    },
    qrBase64,
    fechaGeneracion,
  })

  const pdfBuffer = await renderHtmlToPdf(html)

  await prisma.pdfExport.create({
    data: { propiedadId, agenteId: propiedad.agenteId },
  })

  return pdfBuffer
}

export async function generateCaptacionPdf(captacionId: string): Promise<Buffer> {
  const captacion = await prisma.captacion.findUnique({
    where: { id: captacionId },
    include: {
      agente: {
        select: {
          nombre: true, apellido: true, primerApellido: true, segundoApellido: true,
          telefono: true, whatsapp: true, email: true, foto: true,
        },
      },
    },
  })

  if (!captacion) throw new Error('Captación no encontrada')

  const waUrl = `https://wa.me/${captacion.agente.whatsapp}`
  const qrBase64 = await QRCode.toDataURL(waUrl, { width: 120, margin: 1 })
    .then(url => url.replace('data:image/png;base64,', ''))

  const nombreCompleto = [
    captacion.agente.nombre,
    captacion.agente.primerApellido ?? captacion.agente.apellido,
    captacion.agente.segundoApellido,
  ].filter(Boolean).join(' ')

  const fotos = Array.isArray(captacion.fotos) ? captacion.fotos as string[] : []
  const fechaGeneracion = new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const html = buildCaptacionPdfHtml({
    propietarioNombre: captacion.propietarioNombre,
    propietarioTelefono: captacion.propietarioTelefono,
    propietarioEmail: captacion.propietarioEmail ?? null,
    tipoInmueble: captacion.tipoInmueble,
    tipo: captacion.tipo,
    ciudad: captacion.ciudad,
    zona: captacion.zona ?? null,
    descripcion: captacion.descripcion ?? null,
    dormitorios: captacion.dormitorios ?? null,
    banos: captacion.banos ?? null,
    superficieM2: captacion.superficieM2 ? captacion.superficieM2.toString() : null,
    garage: captacion.garage,
    amueblado: captacion.amueblado,
    precioSolicitado: `${captacion.moneda} ${Number(captacion.precioSolicitado).toLocaleString('es-BO')}`,
    precioSugerido: captacion.precioSugerido ? `${captacion.moneda} ${Number(captacion.precioSugerido).toLocaleString('es-BO')}` : null,
    fotos,
    estado: captacion.estado,
    fechaCaptacion: captacion.fechaCaptacion.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }),
    agente: { nombreCompleto, telefono: captacion.agente.telefono, email: captacion.agente.email, fotoUrl: captacion.agente.foto },
    qrBase64,
    fechaGeneracion,
  })

  return renderHtmlToPdf(html)
}
