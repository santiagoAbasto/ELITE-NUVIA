# 07 — Agents, Users & Roles

## Files to create

- `apps/web/src/admin/crm/agentes/AgentesPage.tsx`
- `apps/web/src/admin/crm/agentes/AgenteForm.tsx`
- `apps/web/src/admin/crm/agentes/AgenteDetail.tsx`

---

## Task 1 — AgentesPage (list)

- [ ] Create `apps/web/src/admin/crm/agentes/AgentesPage.tsx`

Visible to: SUPER_ADMIN (full CRUD) + COORDINADOR (read only).

```tsx
// Fetches GET /api/v1/admin/agentes
// Columns: foto, nombre completo, telefono, estado, captaciones activas, leads activos, acciones
// SUPER_ADMIN sees: Crear, Editar, Activar/Desactivar buttons
// COORDINADOR sees: Ver only
```

---

## Task 2 — AgenteForm (create/edit)

- [ ] Create `apps/web/src/admin/crm/agentes/AgenteForm.tsx`

Uses `react-hook-form` + `zod` schema:

```ts
import { z } from 'zod'

const agenteSchema = z.object({
  nombre: z.string().min(2),
  primerApellido: z.string().min(2),
  segundoApellido: z.string().optional(),
  fechaNacimiento: z.string(), // ISO date string
  email: z.string().email(),
  telefono: z.string().min(7),
  whatsapp: z.string().min(7),
  password: z.string().min(8).optional(), // only on create
  contratoInicio: z.string().optional(),
  contratoFin: z.string().optional(),
})
```

Fields in the form:
- Primer nombre, Primer apellido, Segundo apellido
- Fecha de nacimiento (date input — age calculated and shown)
- Correo corporativo (ej. nombre@elitenuvia.bo)
- Teléfono, WhatsApp
- Foto de perfil (ImageUploader → Cloudinary)
- Bio (RichTextEditor from CMS shared)
- Contraseña temporal (only on create, min 8 chars)
- Contrato: fecha inicio + fecha fin
- Subir contrato PDF (file input → `/api/v1/admin/upload?tipo=documento`)
- Estado: Activo / Inactivo / Suspendido

On submit: `POST /api/v1/admin/agentes` (create) or `PUT /api/v1/admin/agentes/:id` (edit).

Age display:
```ts
const edad = fechaNacimiento
  ? Math.floor((Date.now() - new Date(fechaNacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  : null
```

---

## Task 3 — AgenteDetail page

- [ ] Create `apps/web/src/admin/crm/agentes/AgenteDetail.tsx`

Sections:
1. **Ficha personal** — foto, nombre completo, correo, teléfono, edad, fechas contrato, contrato PDF link
2. **Contrato** — alerta visual si `contratoFin` está a menos de 30 días: "Contrato vence en X días"
3. **Métricas** — propiedades activas, captaciones activas, leads activos, cierres del mes, tasa de conversión (calls to API aggregate endpoint `GET /api/v1/admin/agentes/:id/metricas`)
4. **Agenda** — mini calendar view del agente (next 7 days events)
5. **Historial de actividades** — timeline de todas sus captaciones + leads + eventos

```tsx
// Contract expiry warning
const diasRestantes = contratoFin
  ? Math.ceil((new Date(contratoFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  : null

{diasRestantes !== null && diasRestantes <= 30 && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-400 text-sm">
    Contrato vence en {diasRestantes} días
  </div>
)}
```

---

## Task 4 — API: agentes metricas endpoint

- [ ] Add to `apps/api/src/routes/adminAgentes.ts`:

```ts
router.get('/:id/metricas', async (req, res, next) => {
  try {
    const { id } = req.params
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const [propiedadesActivas, captacionesActivas, leadsActivos, cierresMes] = await Promise.all([
      prisma.propiedad.count({ where: { agenteId: id, activa: true } }),
      prisma.captacion.count({ where: { agenteId: id, estado: { notIn: ['CERRADA', 'EXPIRADA'] } } }),
      prisma.lead.count({ where: { agenteId: id, estado: { notIn: ['CERRADO', 'PERDIDO'] } } }),
      prisma.lead.count({ where: { agenteId: id, estado: 'CERRADO', updatedAt: { gte: startOfMonth } } }),
    ])
    const totalLeads = await prisma.lead.count({ where: { agenteId: id } })
    res.json({
      propiedadesActivas, captacionesActivas, leadsActivos, cierresMes,
      tasaConversion: totalLeads > 0 ? Math.round((cierresMes / totalLeads) * 100) : 0,
    })
  } catch (err) { next(err) }
})
```

- [ ] Commit: `feat(admin): agents module — list, form, detail, metricas`
