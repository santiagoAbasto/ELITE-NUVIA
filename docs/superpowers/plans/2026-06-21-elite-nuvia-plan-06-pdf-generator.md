# ELITE Nuvia — Plan 06: Generador de PDF con Puppeteer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Implementar el generador de PDF de propiedades usando Puppeteer headless. El PDF incluye branding completo de ELITE Nuvia, fotos en grilla, ficha tecnica, datos del agente y QR de WhatsApp. Solo accesible desde el CRM con JWT valido.

**Architecture:** Ver `docs/superpowers/graphs/06-flujo-pdf.md` para el diagrama completo del proceso. El endpoint `GET /api/v1/admin/pdf/:propiedadId` verifica JWT, carga datos, genera QR como base64, renderiza template HTML con Puppeteer y devuelve el PDF como stream. No se guarda en disco.

**Tech Stack:** Puppeteer 22 + qrcode + Handlebars (template) + Prisma (datos)

---

## Referencia: Flujo de Generacion

Ver: `docs/superpowers/graphs/06-flujo-pdf.md`

Contenido del PDF: Logo SVG · Foto principal · Titulo + Precio · Ficha tecnica · Descripcion · Galeria fotos (max 9) · Datos agente + foto · QR WhatsApp · Footer con branding

---

### Task 1: PDF Generator utility

**Files:**
- Create: `apps/api/src/lib/pdf.ts`
- Create: `apps/api/src/lib/pdfTemplate.ts`

- [ ] **Step 1: Crear pdfTemplate.ts con el HTML del PDF**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/lib/pdfTemplate.ts

interface PdfData {
  titulo: string
  tipo: string
  precio: string
  ciudad: string
  zona: string | null
  dormitorios: number | null
  banos: number | null
  superficieM2: string | null
  garage: boolean
  amueblado: boolean
  descripcion: string
  fotoPrincipalUrl: string
  fotosUrls: string[]
  agente: {
    nombre: string
    apellido: string
    telefono: string
    whatsapp: string
    fotoUrl: string | null
  }
  qrBase64: string
  fechaGeneracion: string
}

const TIPO_LABELS: Record<string, string> = {
  VENTA: 'VENTA',
  ALQUILER: 'ALQUILER',
  ANTICRETICO: 'ANTICRETICO',
}

const TIPO_COLORS: Record<string, string> = {
  VENTA: '#C9A84C',
  ALQUILER: '#0D3B27',
  ANTICRETICO: 'rgba(255,255,255,0.15)',
}

export function buildPdfHtml(data: PdfData): string {
  const fotoGrid = data.fotosUrls.slice(0, 9).map(url =>
    `<img src="${url}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;" />`
  ).join('')

  const specs = [
    data.dormitorios ? `<div class="spec"><span class="spec-val">${data.dormitorios}</span><span class="spec-key">Dormitorios</span></div>` : '',
    data.banos ? `<div class="spec"><span class="spec-val">${data.banos}</span><span class="spec-key">Banos</span></div>` : '',
    data.superficieM2 ? `<div class="spec"><span class="spec-val">${data.superficieM2}</span><span class="spec-key">m2</span></div>` : '',
    data.garage ? `<div class="spec"><span class="spec-val">Si</span><span class="spec-key">Garage</span></div>` : '',
    data.amueblado ? `<div class="spec"><span class="spec-val">Si</span><span class="spec-key">Amueblado</span></div>` : '',
  ].filter(Boolean).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; color:#111810; background:#fff; }
  .header { background:#0A2416; color:#fff; padding:20px 32px; display:flex; align-items:center; justify-content:space-between; }
  .logo-text { display:flex; flex-direction:column; }
  .logo-elite { font-size:22px; font-weight:800; letter-spacing:4px; color:#fff; }
  .logo-nuvia { font-size:15px; font-style:italic; color:#C9A84C; }
  .header-slogan { font-size:10px; color:rgba(255,255,255,0.5); letter-spacing:2px; text-transform:uppercase; }
  .main-photo { width:100%; height:240px; object-fit:cover; display:block; }
  .content { padding:28px 32px; }
  .title-row { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:6px; }
  .titulo { font-size:20px; font-weight:700; color:#0A2416; flex:1; }
  .badge { padding:4px 12px; border-radius:20px; font-size:10px; font-weight:800; letter-spacing:1px; background:${TIPO_COLORS[data.tipo] || '#C9A84C'}; color:${data.tipo === 'VENTA' ? '#0A2416' : '#fff'}; }
  .precio { font-size:26px; font-weight:800; color:#C9A84C; margin-bottom:20px; }
  .specs { display:flex; gap:0; border:1px solid #f0f0f0; border-radius:8px; overflow:hidden; margin-bottom:20px; }
  .spec { flex:1; padding:10px 6px; text-align:center; border-right:1px solid #f0f0f0; }
  .spec:last-child { border-right:none; }
  .spec-val { display:block; font-size:16px; font-weight:700; color:#0A2416; }
  .spec-key { display:block; font-size:9px; color:#8a9080; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }
  .section-label { font-size:10px; font-weight:700; color:#C9A84C; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
  .descripcion { font-size:13px; color:#4a5240; line-height:1.65; margin-bottom:24px; }
  .foto-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:28px; }
  .divider { height:1px; background:linear-gradient(90deg,transparent,#C9A84C,transparent); margin:20px 0; }
  .agent-section { display:flex; align-items:center; gap:20px; }
  .agent-photo { width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid #C9A84C; flex-shrink:0; }
  .agent-photo-placeholder { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#0D3B27,#C9A84C); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:800; flex-shrink:0; }
  .agent-info { flex:1; }
  .agent-name { font-size:16px; font-weight:700; color:#0A2416; }
  .agent-role { font-size:11px; color:#8a9080; margin:2px 0 6px; }
  .agent-tel { font-size:13px; color:#0D3B27; font-weight:500; }
  .qr-section { text-align:center; }
  .qr-img { width:80px; height:80px; }
  .qr-label { font-size:9px; color:#8a9080; margin-top:4px; }
  .footer { background:#0A2416; padding:14px 32px; display:flex; align-items:center; justify-content:space-between; margin-top:28px; }
  .footer-left { color:rgba(255,255,255,0.5); font-size:10px; }
  .footer-slogan { color:#C9A84C; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
</style>
</head>
<body>

<div class="header">
  <div class="logo-text">
    <span class="logo-elite">ELITE</span>
    <span class="logo-nuvia">Nuvia</span>
  </div>
  <div class="header-slogan">Inmobiliaria Premium Bolivia</div>
</div>

<img class="main-photo" src="${data.fotoPrincipalUrl}" alt="${data.titulo}" />

<div class="content">
  <div class="title-row">
    <div class="titulo">${data.titulo}</div>
    <div class="badge">${TIPO_LABELS[data.tipo] || data.tipo}</div>
  </div>
  <div class="precio">${data.precio}</div>

  ${specs ? `<div class="specs">${specs}</div>` : ''}

  <div class="section-label">Descripcion</div>
  <div class="descripcion">${data.descripcion}</div>

  ${data.fotosUrls.length > 1 ? `
  <div class="section-label">Galeria de Fotos</div>
  <div class="foto-grid">${fotoGrid}</div>
  ` : ''}

  <div class="divider"></div>

  <div class="agent-section">
    ${data.agente.fotoUrl
      ? `<img class="agent-photo" src="${data.agente.fotoUrl}" alt="${data.agente.nombre}" />`
      : `<div class="agent-photo-placeholder">${data.agente.nombre.charAt(0)}${data.agente.apellido.charAt(0)}</div>`
    }
    <div class="agent-info">
      <div class="agent-name">${data.agente.nombre} ${data.agente.apellido}</div>
      <div class="agent-role">Asesor/a Inmobiliaria — ELITE Nuvia</div>
      <div class="agent-tel">${data.agente.telefono}</div>
    </div>
    <div class="qr-section">
      <img class="qr-img" src="data:image/png;base64,${data.qrBase64}" alt="QR WhatsApp" />
      <div class="qr-label">Escanea para contactarme</div>
    </div>
  </div>
</div>

<div class="footer">
  <div class="footer-left">ELITE Nuvia · ${data.ciudad}${data.zona ? ' · ' + data.zona : ''} · ${data.fechaGeneracion}</div>
  <div class="footer-slogan">TU HOGAR, TU FUTURO, NUESTRA PRIORIDAD</div>
</div>

</body>
</html>`
}
```

- [ ] **Step 2: Crear lib/pdf.ts — logica de generacion**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/lib/pdf.ts
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

  const formatPrice = (price: number) => `Bs. ${price.toLocaleString('es-BO')}`
  const fechaGeneracion = new Date().toLocaleDateString('es-BO', { day:'2-digit', month:'2-digit', year:'numeric' })

  const html = buildPdfHtml({
    titulo: propiedad.titulo,
    tipo: propiedad.tipo,
    precio: formatPrice(Number(propiedad.precio)),
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
    // Log PDF export
    await prisma.pdfExport.create({
      data: { propiedadId, agenteId: propiedad.agenteId },
    })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
```

- [ ] **Step 3: Crear ruta admin PDF**

```typescript
// /Users/user/Desktop/ELITE/apps/api/src/routes/admin.ts
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

    // Verificar permiso: super_admin puede cualquiera, agente solo la suya
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
    const propiedad = await prisma.propiedad.findUnique({ where: { id: propiedadId }, select: { slug: true, agente: { select: { apellido: true } } } })
    const filename = `elite-nuvia-${propiedad?.slug ?? propiedadId}-${propiedad?.agente.apellido?.toLowerCase() ?? 'agente'}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(pdfBuffer)
  } catch (err) { next(err) }
})
```

- [ ] **Step 4: Registrar router admin en app.ts**

```typescript
// Agregar en apps/api/src/app.ts
import { adminRouter } from './routes/admin.js'
// ...
app.use('/api/v1/admin', adminRouter)
```

- [ ] **Step 5: Verificar generacion de PDF**

```bash
cd /Users/user/Desktop/ELITE/apps/api && pnpm dev &
sleep 3

# Login y obtener cookie
curl -s -c /tmp/elite-cookies.txt -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@elitenuvia.bo","password":"Admin123!"}' > /dev/null

# Obtener ID de una propiedad
PROP_ID=$(curl -s http://localhost:8080/api/v1/propiedades/destacadas | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'])")
echo "Propiedad ID: $PROP_ID"

# Generar PDF
curl -s -b /tmp/elite-cookies.txt \
  "http://localhost:8080/api/v1/admin/pdf/$PROP_ID" \
  -o /tmp/elite-test.pdf

# Verificar que es un PDF valido
file /tmp/elite-test.pdf
```

Expected: `elite-test.pdf: PDF document, version 1.x`

```bash
open /tmp/elite-test.pdf  # macOS — abrir PDF para verificar visualmente
```

- [ ] **Step 6: Commit**

```bash
kill %1 2>/dev/null
cd /Users/user/Desktop/ELITE
git add apps/api/src/lib/pdf.ts apps/api/src/lib/pdfTemplate.ts apps/api/src/routes/admin.ts
git commit -m "feat: add Puppeteer PDF generator with ELITE Nuvia branding, agent QR and photo grid"
```
