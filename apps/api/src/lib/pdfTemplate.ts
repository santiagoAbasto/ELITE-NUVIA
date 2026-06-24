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
    nombreCompleto: string
    telefono: string
    whatsapp: string
    email: string
    fotoUrl: string | null
  }
  qrBase64: string
  fechaGeneracion: string
}

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  VENTA:       { bg: '#C9A84C', color: '#0A2416' },
  ALQUILER:    { bg: '#0D3B27', color: '#fff' },
  ANTICRETICO: { bg: 'rgba(255,255,255,0.15)', color: '#fff' },
}

export function buildPdfHtml(data: PdfData): string {
  const tc = TIPO_COLORS[data.tipo] ?? TIPO_COLORS.VENTA

  const specs = [
    data.dormitorios != null ? `<div class="spec"><span class="sv">${data.dormitorios}</span><span class="sk">Dormitorios</span></div>` : '',
    data.banos != null       ? `<div class="spec"><span class="sv">${data.banos}</span><span class="sk">Baños</span></div>` : '',
    data.superficieM2        ? `<div class="spec"><span class="sv">${data.superficieM2}</span><span class="sk">m²</span></div>` : '',
    data.garage              ? `<div class="spec"><span class="sv">Sí</span><span class="sk">Garage</span></div>` : '',
    data.amueblado           ? `<div class="spec"><span class="sv">Sí</span><span class="sk">Amueblado</span></div>` : '',
  ].filter(Boolean).join('')

  const fotoGrid = data.fotosUrls.slice(1, 7).map(url =>
    `<img src="${url}" style="width:100%;height:110px;object-fit:cover;border-radius:6px;" />`
  ).join('')

  const avatarHtml = data.agente.fotoUrl
    ? `<img class="agent-avatar" src="${data.agente.fotoUrl}" alt="${data.agente.nombreCompleto}" />`
    : `<div class="agent-avatar-placeholder">${data.agente.nombre[0]}${data.agente.apellido[0]}</div>`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Helvetica Neue',Arial,sans-serif; color:#111810; background:#fff; }

.header { background:#0A2416; padding:20px 32px; display:flex; align-items:center; justify-content:space-between; }
.logo-elite { font-size:22px; font-weight:800; letter-spacing:4px; color:#fff; display:block; }
.logo-nuvia { font-size:15px; font-style:italic; color:#C9A84C; display:block; }
.header-sub { font-size:10px; color:rgba(255,255,255,0.45); letter-spacing:2px; text-transform:uppercase; }

.main-photo { width:100%; height:240px; object-fit:cover; display:block; }

.content { padding:28px 32px; }
.title-row { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:6px; }
.titulo { font-size:20px; font-weight:700; color:#0A2416; flex:1; }
.badge { padding:4px 14px; border-radius:20px; font-size:10px; font-weight:800; letter-spacing:1px; background:${tc.bg}; color:${tc.color}; flex-shrink:0; }
.precio { font-size:26px; font-weight:800; color:#C9A84C; margin-bottom:20px; }

.specs { display:flex; border:1px solid #f0ede4; border-radius:8px; overflow:hidden; margin-bottom:20px; }
.spec { flex:1; padding:10px 6px; text-align:center; border-right:1px solid #f0ede4; }
.spec:last-child { border-right:none; }
.sv { display:block; font-size:16px; font-weight:700; color:#0A2416; }
.sk { display:block; font-size:9px; color:#8a9080; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }

.sec-label { font-size:10px; font-weight:700; color:#C9A84C; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
.desc { font-size:13px; color:#4a5240; line-height:1.65; margin-bottom:24px; }
.foto-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:28px; }
.divider { height:1px; background:linear-gradient(90deg,transparent,#C9A84C,transparent); margin:20px 0; }

.agent-row { display:flex; align-items:center; gap:20px; }
.agent-avatar { width:68px; height:68px; border-radius:50%; object-fit:cover; border:2.5px solid #C9A84C; flex-shrink:0; }
.agent-avatar-placeholder { width:68px; height:68px; border-radius:50%; background:linear-gradient(135deg,#0D3B27,#C9A84C); display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:800; flex-shrink:0; }
.agent-name { font-size:15px; font-weight:800; color:#0A2416; margin-bottom:2px; }
.agent-role { font-size:10px; color:#8a9080; margin-bottom:5px; letter-spacing:0.5px; }
.agent-contact { font-size:12px; color:#0D3B27; line-height:1.7; }
.agent-email { font-size:11px; color:#5a7060; }
.qr-box { text-align:center; flex-shrink:0; }
.qr-img { width:72px; height:72px; }
.qr-label { font-size:9px; color:#8a9080; margin-top:4px; }

.footer { background:#0A2416; padding:14px 32px; display:flex; align-items:center; justify-content:space-between; margin-top:28px; }
.footer-left { color:rgba(255,255,255,0.45); font-size:10px; }
.footer-slogan { color:#C9A84C; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
</style>
</head>
<body>

<div class="header">
  <div>
    <span class="logo-elite">ELITE</span>
    <span class="logo-nuvia">Nuvia</span>
  </div>
  <div class="header-sub">Inmobiliaria Premium Bolivia</div>
</div>

${data.fotoPrincipalUrl ? `<img class="main-photo" src="${data.fotoPrincipalUrl}" alt="${data.titulo}" />` : ''}

<div class="content">
  <div class="title-row">
    <div class="titulo">${data.titulo}</div>
    <div class="badge">${data.tipo}</div>
  </div>
  <div class="precio">${data.precio}</div>

  ${specs ? `<div class="specs">${specs}</div>` : ''}

  <div class="sec-label">Descripción</div>
  <div class="desc">${data.descripcion}</div>

  ${data.fotosUrls.length > 1 ? `<div class="sec-label">Galería</div><div class="foto-grid">${fotoGrid}</div>` : ''}

  <div class="divider"></div>

  <div class="agent-row">
    ${avatarHtml}
    <div style="flex:1">
      <div class="agent-name">${data.agente.nombreCompleto}</div>
      <div class="agent-role">Asesor/a Inmobiliaria — ELITE Nuvia</div>
      <div class="agent-contact">
        Tel: ${data.agente.telefono}<br>
        WA: ${data.agente.whatsapp}
      </div>
      <div class="agent-email">${data.agente.email}</div>
    </div>
    <div class="qr-box">
      <img class="qr-img" src="data:image/png;base64,${data.qrBase64}" alt="QR WhatsApp" />
      <div class="qr-label">Contactar por WhatsApp</div>
    </div>
  </div>
</div>

<div class="footer">
  <div class="footer-left">ELITE Nuvia · ${data.ciudad}${data.zona ? ' · ' + data.zona : ''} · Ficha generada el ${data.fechaGeneracion}</div>
  <div class="footer-slogan">TU HOGAR, TU FUTURO, NUESTRA PRIORIDAD</div>
</div>

</body></html>`
}
