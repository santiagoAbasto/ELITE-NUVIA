interface CaptacionPdfData {
  propietarioNombre: string
  propietarioTelefono: string
  propietarioEmail: string | null
  tipoInmueble: string
  tipo: string
  ciudad: string
  zona: string | null
  descripcion: string | null
  dormitorios: number | null
  banos: number | null
  superficieM2: string | null
  garage: boolean
  amueblado: boolean
  precioSolicitado: string
  precioSugerido: string | null
  fotos: string[]
  estado: string
  fechaCaptacion: string
  agente: {
    nombreCompleto: string
    telefono: string
    email: string
    fotoUrl: string | null
  }
  qrBase64: string
  fechaGeneracion: string
}

const ESTADO_LABEL: Record<string, string> = {
  EN_NEGOCIACION: 'En Negociación',
  CAPTADA: 'Captada',
  PUBLICADA: 'Publicada',
  EN_CIERRE: 'En Cierre',
  CERRADA: 'Cerrada',
  EXPIRADA: 'Expirada',
}

export function buildCaptacionPdfHtml(data: CaptacionPdfData): string {
  const specs = [
    data.dormitorios != null ? `<div class="spec"><span class="sv">${data.dormitorios}</span><span class="sk">Dormitorios</span></div>` : '',
    data.banos != null ? `<div class="spec"><span class="sv">${data.banos}</span><span class="sk">Baños</span></div>` : '',
    data.superficieM2 ? `<div class="spec"><span class="sv">${data.superficieM2}</span><span class="sk">m²</span></div>` : '',
    data.garage ? `<div class="spec"><span class="sv">Sí</span><span class="sk">Garage</span></div>` : '',
    data.amueblado ? `<div class="spec"><span class="sv">Sí</span><span class="sk">Amueblado</span></div>` : '',
  ].filter(Boolean).join('')

  const fotoPrincipal = data.fotos[0] ?? ''
  const fotoGrid = data.fotos.slice(1, 7).map(url =>
    `<img src="${url}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;" />`
  ).join('')

  const avatarHtml = data.agente.fotoUrl
    ? `<img class="agent-avatar" src="${data.agente.fotoUrl}" alt="${data.agente.nombreCompleto}" />`
    : `<div class="agent-avatar-placeholder">${data.agente.nombreCompleto[0]}</div>`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'Helvetica Neue',Arial,sans-serif; color:#111810; background:#fff; }

.header { background:#0A2416; padding:20px 32px; display:flex; align-items:center; justify-content:space-between; }
.logo-elite { font-size:22px; font-weight:800; letter-spacing:4px; color:#fff; display:block; }
.logo-nuvia { font-size:15px; font-style:italic; color:#C9A84C; display:block; }
.header-badge { background:rgba(201,168,76,0.18); border:1px solid rgba(201,168,76,0.4); color:#C9A84C; font-size:9px; font-weight:800; letter-spacing:2px; text-transform:uppercase; padding:4px 12px; border-radius:20px; }

.main-photo { width:100%; height:220px; object-fit:cover; display:block; }

.content { padding:24px 32px; }

.grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:20px; }
.card { background:#f9f8f4; border:1px solid #e8e4d8; border-radius:10px; padding:16px; }
.card-title { font-size:9px; font-weight:700; color:#C9A84C; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
.card-row { display:flex; justify-content:space-between; margin-bottom:6px; }
.card-label { font-size:11px; color:#8a9080; }
.card-value { font-size:11px; font-weight:600; color:#0A2416; }

.precio-box { margin-bottom:20px; }
.precio-label { font-size:10px; color:#8a9080; margin-bottom:2px; }
.precio-val { font-size:22px; font-weight:800; color:#C9A84C; }
.precio-sug { font-size:14px; font-weight:600; color:#0D3B27; margin-top:4px; }

.specs { display:flex; border:1px solid #e8e4d8; border-radius:8px; overflow:hidden; margin-bottom:20px; }
.spec { flex:1; padding:10px 6px; text-align:center; border-right:1px solid #e8e4d8; }
.spec:last-child { border-right:none; }
.sv { display:block; font-size:15px; font-weight:700; color:#0A2416; }
.sk { display:block; font-size:9px; color:#8a9080; margin-top:2px; text-transform:uppercase; letter-spacing:0.5px; }

.sec-label { font-size:10px; font-weight:700; color:#C9A84C; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
.desc { font-size:12px; color:#4a5240; line-height:1.65; margin-bottom:20px; }
.foto-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:24px; }

.divider { height:1px; background:linear-gradient(90deg,transparent,#C9A84C,transparent); margin:20px 0; }

.estado-badge { display:inline-block; padding:4px 14px; border-radius:20px; font-size:10px; font-weight:800; letter-spacing:1px; background:#0D3B27; color:#C9A84C; border:1px solid rgba(201,168,76,0.3); margin-bottom:16px; }

.agent-row { display:flex; align-items:center; gap:16px; }
.agent-avatar { width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid #C9A84C; flex-shrink:0; }
.agent-avatar-placeholder { width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,#0D3B27,#C9A84C); display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; font-weight:800; flex-shrink:0; }
.agent-name { font-size:14px; font-weight:800; color:#0A2416; margin-bottom:2px; }
.agent-role { font-size:10px; color:#8a9080; margin-bottom:4px; }
.agent-contact { font-size:11px; color:#0D3B27; line-height:1.7; }
.qr-box { text-align:center; flex-shrink:0; margin-left:auto; }
.qr-img { width:64px; height:64px; }
.qr-label { font-size:9px; color:#8a9080; margin-top:3px; }

.footer { background:#0A2416; padding:12px 32px; display:flex; align-items:center; justify-content:space-between; margin-top:24px; }
.footer-left { color:rgba(255,255,255,0.45); font-size:10px; }
.footer-slogan { color:#C9A84C; font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }

.confidential { text-align:center; font-size:9px; color:#a0a8a0; margin:10px 0; letter-spacing:1px; text-transform:uppercase; }
</style>
</head>
<body>

<div class="header">
  <div>
    <span class="logo-elite">ELITE</span>
    <span class="logo-nuvia">Nuvia</span>
  </div>
  <div class="header-badge">Ficha de Captación</div>
</div>

${fotoPrincipal ? `<img class="main-photo" src="${fotoPrincipal}" alt="Foto del inmueble" />` : ''}

<div class="content">
  <div class="confidential">Documento interno — uso exclusivo ELITE Nuvia</div>

  <div class="estado-badge">${ESTADO_LABEL[data.estado] ?? data.estado} · Captado el ${data.fechaCaptacion}</div>

  <div class="grid-2">
    <div class="card">
      <div class="card-title">Propietario</div>
      <div class="card-row"><span class="card-label">Nombre</span><span class="card-value">${data.propietarioNombre}</span></div>
      <div class="card-row"><span class="card-label">Teléfono</span><span class="card-value">${data.propietarioTelefono}</span></div>
      ${data.propietarioEmail ? `<div class="card-row"><span class="card-label">Email</span><span class="card-value">${data.propietarioEmail}</span></div>` : ''}
    </div>
    <div class="card">
      <div class="card-title">Inmueble</div>
      <div class="card-row"><span class="card-label">Tipo</span><span class="card-value">${data.tipoInmueble}</span></div>
      <div class="card-row"><span class="card-label">Operación</span><span class="card-value">${data.tipo}</span></div>
      <div class="card-row"><span class="card-label">Ubicación</span><span class="card-value">${data.ciudad}${data.zona ? `, ${data.zona}` : ''}</span></div>
    </div>
  </div>

  <div class="precio-box">
    <div class="precio-label">Precio solicitado por propietario</div>
    <div class="precio-val">${data.precioSolicitado}</div>
    ${data.precioSugerido ? `<div class="precio-sug">Precio sugerido por agente: ${data.precioSugerido}</div>` : ''}
  </div>

  ${specs ? `<div class="specs">${specs}</div>` : ''}

  ${data.descripcion ? `<div class="sec-label">Observaciones</div><div class="desc">${data.descripcion}</div>` : ''}

  ${data.fotos.length > 1 ? `<div class="sec-label">Fotografías</div><div class="foto-grid">${fotoGrid}</div>` : ''}

  <div class="divider"></div>

  <div class="agent-row">
    ${avatarHtml}
    <div>
      <div class="agent-name">${data.agente.nombreCompleto}</div>
      <div class="agent-role">Agente responsable — ELITE Nuvia</div>
      <div class="agent-contact">
        Tel: ${data.agente.telefono}<br>
        ${data.agente.email}
      </div>
    </div>
    <div class="qr-box">
      <img class="qr-img" src="data:image/png;base64,${data.qrBase64}" alt="QR" />
      <div class="qr-label">WhatsApp</div>
    </div>
  </div>
</div>

<div class="footer">
  <div class="footer-left">ELITE Nuvia · Generado el ${data.fechaGeneracion}</div>
  <div class="footer-slogan">TU HOGAR, TU FUTURO, NUESTRA PRIORIDAD</div>
</div>

</body></html>`
}
