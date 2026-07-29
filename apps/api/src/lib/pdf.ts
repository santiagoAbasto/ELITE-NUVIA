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

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatState(value: string): string {
  return value.replace(/_/g, ' ')
}

export async function generatePropertyPdf(propiedadId: string, generadoPorAgenteId?: string | null): Promise<Buffer> {
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
    data: { propiedadId, agenteId: generadoPorAgenteId ?? propiedad.agenteId },
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

interface ReportSummary {
  propiedades: { activas: number; venta: number; alquiler: number; anticretico: number }
  captaciones: { activas: number; mes: number; ultimoMes: number }
  leads: {
    total: number
    mes: number
    ultimoMes: number
    cerradosMes: number
    cerradosUltimoMes: number
    tasaConversionMes: number
    tasaConversionUltimoMes: number
  }
  eventos: { proximos: number }
  agentes: { activos: number }
}

interface ReportPdfPayload {
  scopeLabel: string
  resumen: ReportSummary
  leadsPorEstado: { estado: string; count: number }[]
  leadsPorMes: { mes: string; total: number; cerrados: number }[]
  captacionesPorEstado: { estado: string; count: number }[]
  rendimientoAgentes: { nombre: string; propiedades: number; captaciones: number; leadsActivos: number; cierresMes: number; tasaConversion: number }[]
  propiedadesPorCiudad: { ciudad: string; count: number }[]
  leadsPorTemperatura: { temperatura: string; count: number }[]
  generadoPor: string
}

export async function generateReportPdf(payload: ReportPdfPayload): Promise<Buffer> {
  const generadoAt = new Date().toLocaleString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Reporte CRM ELITE Nuvia</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f3f0e8;
      color: #0c140e;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .page {
      min-height: 297mm;
      padding: 28px;
      background:
        linear-gradient(180deg, rgba(12,20,14,0.06), transparent 220px),
        #f3f0e8;
    }
    .hero {
      border: 1px solid rgba(12,20,14,0.12);
      background: #0b130d;
      color: #fff;
      border-radius: 22px;
      padding: 26px;
    }
    .brand {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-start;
    }
    .mark {
      color: #c9a84c;
      font-weight: 900;
      letter-spacing: 0.14em;
      font-size: 13px;
      text-transform: uppercase;
    }
    h1 {
      margin: 18px 0 8px;
      font-size: 34px;
      line-height: 1;
      letter-spacing: -0.03em;
    }
    .muted { color: rgba(255,255,255,0.58); font-size: 12px; line-height: 1.5; }
    .scope {
      border: 1px solid rgba(201,168,76,0.25);
      color: #c9a84c;
      border-radius: 999px;
      padding: 7px 11px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
    }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 14px;
    }
    .kpi {
      border: 1px solid rgba(12,20,14,0.10);
      background: #fff;
      border-radius: 18px;
      padding: 14px;
    }
    .kpi .label {
      color: #677062;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
    }
    .kpi .value {
      margin-top: 8px;
      color: #0b130d;
      font-size: 28px;
      line-height: 1;
      font-weight: 900;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .card {
      border: 1px solid rgba(12,20,14,0.10);
      background: #fff;
      border-radius: 18px;
      padding: 16px;
      break-inside: avoid;
    }
    h2 {
      margin: 0 0 12px;
      font-size: 14px;
      color: #0b130d;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th {
      text-align: left;
      color: #727a6e;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 8px 6px;
      border-bottom: 1px solid rgba(12,20,14,0.09);
    }
    td {
      padding: 8px 6px;
      border-bottom: 1px solid rgba(12,20,14,0.07);
      color: #243026;
    }
    .bar-row {
      display: grid;
      grid-template-columns: 110px 1fr 34px;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      font-size: 11px;
    }
    .track {
      height: 8px;
      border-radius: 999px;
      background: rgba(12,20,14,0.08);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: 999px;
      background: #c9a84c;
    }
    .footer {
      margin-top: 14px;
      color: #66705f;
      font-size: 10px;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="hero">
      <div class="brand">
        <div>
          <div class="mark">ELITE Nuvia CRM</div>
          <h1>Reporte comercial</h1>
          <div class="muted">Generado por ${escapeHtml(payload.generadoPor)} el ${escapeHtml(generadoAt)}.</div>
        </div>
        <div class="scope">${escapeHtml(payload.scopeLabel)}</div>
      </div>
    </section>

    <section class="kpis">
      <div class="kpi"><div class="label">Propiedades activas</div><div class="value">${payload.resumen.propiedades.activas}</div></div>
      <div class="kpi"><div class="label">Leads del mes</div><div class="value">${payload.resumen.leads.mes}</div></div>
      <div class="kpi"><div class="label">Cierres del mes</div><div class="value">${payload.resumen.leads.cerradosMes}</div></div>
      <div class="kpi"><div class="label">Conversion</div><div class="value">${payload.resumen.leads.tasaConversionMes}%</div></div>
    </section>

    <section class="grid">
      <div class="card">
        <h2>Leads por estado</h2>
        ${payload.leadsPorEstado.map(item => {
          const max = Math.max(1, ...payload.leadsPorEstado.map(i => i.count))
          const width = Math.round((item.count / max) * 100)
          return `<div class="bar-row"><span>${escapeHtml(formatState(item.estado))}</span><div class="track"><div class="fill" style="width:${width}%"></div></div><strong>${item.count}</strong></div>`
        }).join('')}
      </div>
      <div class="card">
        <h2>Captaciones por estado</h2>
        ${payload.captacionesPorEstado.map(item => {
          const max = Math.max(1, ...payload.captacionesPorEstado.map(i => i.count))
          const width = Math.round((item.count / max) * 100)
          return `<div class="bar-row"><span>${escapeHtml(formatState(item.estado))}</span><div class="track"><div class="fill" style="width:${width}%"></div></div><strong>${item.count}</strong></div>`
        }).join('')}
      </div>
      <div class="card">
        <h2>Leads ultimos 6 meses</h2>
        <table><thead><tr><th>Mes</th><th>Nuevos</th><th>Cerrados</th></tr></thead><tbody>
          ${payload.leadsPorMes.map(row => `<tr><td>${escapeHtml(row.mes)}</td><td>${row.total}</td><td>${row.cerrados}</td></tr>`).join('')}
        </tbody></table>
      </div>
      <div class="card">
        <h2>Propiedades por ciudad</h2>
        <table><thead><tr><th>Ciudad</th><th>Propiedades</th></tr></thead><tbody>
          ${payload.propiedadesPorCiudad.map(row => `<tr><td>${escapeHtml(row.ciudad)}</td><td>${row.count}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </section>

    <section class="card" style="margin-top:12px">
      <h2>Rendimiento por asesor</h2>
      <table>
        <thead><tr><th>Asesor</th><th>Propiedades</th><th>Captaciones</th><th>Leads activos</th><th>Cierres</th><th>Conversion</th></tr></thead>
        <tbody>
          ${payload.rendimientoAgentes.map(row => `<tr><td>${escapeHtml(row.nombre)}</td><td>${row.propiedades}</td><td>${row.captaciones}</td><td>${row.leadsActivos}</td><td>${row.cierresMes}</td><td>${row.tasaConversion}%</td></tr>`).join('')}
        </tbody>
      </table>
    </section>

    <div class="footer">
      <span>ELITE Nuvia - Reporte interno</span>
      <span>Datos del CRM al momento de exportar</span>
    </div>
  </main>
</body>
</html>`

  return renderHtmlToPdf(html)
}
