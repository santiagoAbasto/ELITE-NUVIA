# 09 — PDF Generator (Ficha de Propiedad)

## Context

Base already exists at `apps/api/src/lib/pdf.ts` (Puppeteer) and `apps/api/src/lib/pdfTemplate.ts`. The existing `GET /api/v1/admin/pdf/:propiedadId` route in `apps/api/src/routes/admin.ts` already generates PDF.

Permission check already filters AGENTE to only their own properties. This plan extends it to work with the new permission model and enriches the template with full agent data.

## Files to modify

- `apps/api/src/lib/pdfTemplate.ts` — enrich with agent full data
- `apps/api/src/routes/admin.ts` — update permission check to new model
- `apps/api/src/lib/pdf.ts` — pass full agent fields

---

## Task 1 — Update permission check in admin.ts

- [ ] Modify `apps/api/src/routes/admin.ts` — replace AGENTE permission check:

```ts
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
```

---

## Task 2 — Enrich PDF with full agent data

- [ ] Modify `apps/api/src/lib/pdf.ts` — extend agente query:

```ts
agente: {
  select: {
    nombre: true,
    primerApellido: true,
    segundoApellido: true,
    telefono: true,
    whatsapp: true,
    email: true,
    foto: true,
  }
}
```

- [ ] Pass to `buildPdfHtml`:
```ts
agente: {
  nombreCompleto: `${propiedad.agente.nombre} ${propiedad.agente.primerApellido} ${propiedad.agente.segundoApellido ?? ''}`.trim(),
  telefono: propiedad.agente.telefono,
  whatsapp: propiedad.agente.whatsapp,
  email: propiedad.agente.email,
  fotoUrl: propiedad.agente.foto,
}
```

---

## Task 3 — Update pdfTemplate.ts

- [ ] Modify `apps/api/src/lib/pdfTemplate.ts` — update agent section of HTML template to show:
  - Foto circular del agente (50px)
  - Nombre completo
  - Teléfono
  - WhatsApp
  - Correo corporativo
  - Logo ELITE Nuvia (hardcoded URL or base64 inline)
  - QR code (already generated, links to WhatsApp)
  - Fecha de generación

Agent card HTML snippet:
```html
<div style="display:flex;align-items:center;gap:12px;padding:16px;background:#18181b;border-radius:8px;">
  <img src="{{fotoUrl}}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;" />
  <div>
    <p style="color:#d97706;font-weight:700;font-size:14px;">{{nombreCompleto}}</p>
    <p style="color:#a1a1aa;font-size:12px;">{{email}}</p>
    <p style="color:#a1a1aa;font-size:12px;">Tel: {{telefono}} · WA: {{whatsapp}}</p>
  </div>
  <img src="data:image/png;base64,{{qrBase64}}" style="width:60px;height:60px;margin-left:auto;" />
</div>
```

---

## Task 4 — Captacion PDF

- [ ] Add `GET /api/v1/admin/pdf/captacion/:captacionId` endpoint in `admin.ts`
  - Generates PDF for a captacion with propietario data, inmueble data, fotos, agente data
  - Permission: AGENTE can only generate for their own captaciones
  - Reuses same Puppeteer pipeline, different HTML template

- [ ] Create `apps/api/src/lib/captacionPdfTemplate.ts` — HTML template for captacion ficha with same styling as property PDF

---

## Task 5 — Frontend trigger

- [ ] In `PropiedadDetail.tsx` — "Generar PDF" button:

```tsx
const downloadPdf = async () => {
  const res = await fetch(`/api/v1/admin/pdf/${propiedadId}`, { credentials: 'include' })
  if (!res.ok) { toast.error('Error generando PDF'); return }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `ficha-${slug}.pdf`; a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] Same pattern in `CaptacionDetail.tsx` for captacion PDF

- [ ] Commit: `feat(admin): PDF generator with full agent data + captacion PDF`
