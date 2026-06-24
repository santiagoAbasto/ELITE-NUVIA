# 08 — Leads Kanban, Captaciones & Agenda

## Files to create

- `apps/web/src/admin/crm/leads/LeadsKanban.tsx`
- `apps/web/src/admin/crm/leads/LeadCard.tsx`
- `apps/web/src/admin/crm/leads/LeadDetail.tsx`
- `apps/web/src/admin/crm/captaciones/CaptacionesPage.tsx`
- `apps/web/src/admin/crm/captaciones/CaptacionForm.tsx`
- `apps/web/src/admin/crm/captaciones/CaptacionDetail.tsx`
- `apps/web/src/admin/crm/agenda/AgendaPage.tsx`

---

## Task 1 — Leads Kanban

- [ ] Create `apps/web/src/admin/crm/leads/LeadsKanban.tsx`

Uses `@dnd-kit/core` for drag between columns.

```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core'

const COLUMNS = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO'] as const

// On drag end: call PATCH /api/v1/admin/leads/:id/estado with new estado
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event
  if (!over || active.id === over.id) return
  const leadId = active.id as string
  const newEstado = over.id as string
  await adminApi.patch(`/admin/leads/${leadId}/estado`, { estado: newEstado })
  // optimistic update local state
}
```

Column colors: NUEVO=zinc, EN_CONTACTO=blue, INTERESADO=amber, NEGOCIACION=orange, CERRADO=green, PERDIDO=red.

Temperatura badge on each card: Frío (blue) / Tibio (amber) / Caliente (red).

---

## Task 2 — LeadDetail with interaction timeline

- [ ] Create `apps/web/src/admin/crm/leads/LeadDetail.tsx`

Sections:
1. Cliente: nombre, teléfono, email, presupuesto, preferencias, temperatura
2. Propiedad(es) de interés (linked cards)
3. Agente asignado (SUPER_ADMIN can reassign: `PATCH /admin/leads/:id` with `agenteId`)
4. **Timeline de interacciones** — chronological list of `Interaccion` records

```tsx
// Add interaction form at bottom of timeline
const tiposInteraccion = ['nota', 'llamada', 'visita', 'email', 'whatsapp']

// POST /api/v1/admin/leads/:id/interaccion
const addInteraccion = async (tipo: string, texto: string) => {
  await adminApi.post(`/admin/leads/${leadId}/interaccion`, { tipo, texto })
  refetch()
}
```

5. Datos de cierre (shown when estado === CERRADO): tipo (venta/alquiler/anticretico), valor final, comisión estimada

---

## Task 3 — Captaciones module

- [ ] Create `apps/web/src/admin/crm/captaciones/CaptacionesPage.tsx`
  - Table view with columns: dirección, tipo, operación, propietario, agente, estado, fecha
  - Filter by estado, agente (SUPER_ADMIN), tipo
  - "Nueva captación" button (AGENTE can create their own)

- [ ] Create `apps/web/src/admin/crm/captaciones/CaptacionForm.tsx`

Fields using react-hook-form + zod:
- Propietario: nombre, teléfono, email, documento
- Inmueble: tipo, operación, ciudad, zona, dirección, dormitorios, baños, m², garage, amueblado, piscina
- Precio solicitado, precio sugerido, moneda, comisión %
- Fecha captación, exclusividad inicio/fin
- Subir contrato PDF (ImageUploader)
- Fotos hasta 20 (multi-upload, drag-and-drop reorder with @dnd-kit)
- Descripción (RichTextEditor)

- [ ] Create `apps/web/src/admin/crm/captaciones/CaptacionDetail.tsx`

Sections:
1. Datos propietario + inmueble + acuerdo
2. Fotos gallery
3. Contrato adjunto (PDF link/viewer)
4. Estado actual + botón avanzar estado (con confirmación)
5. **Timeline de actividades** (ActividadCaptacion records, chronological)

```tsx
// Activity timeline entry
const tiposActividad = ['llamada', 'visita_inmueble', 'foto_actualizada', 'precio_ajustado', 'documento', 'nota', 'publicada', 'visita_cliente', 'oferta', 'cierre']

// POST /api/v1/admin/captaciones/:id/actividad
const addActividad = async (tipo: string, descripcion: string) => {
  await adminApi.post(`/admin/captaciones/${captacionId}/actividad`, { tipo, descripcion })
}
```

6. Si estado === CAPTADA y no tiene propiedadId → botón "Publicar en portal" que crea Propiedad automáticamente

---

## Task 4 — Agenda (Visual Calendar)

- [ ] Install types: `pnpm --filter @elite/web add -D @types/react-big-calendar`
- [ ] Create `apps/web/src/admin/crm/agenda/AgendaPage.tsx`

```tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales: { es } })

// Event type colors (CSS classes, no emojis)
const eventStyleGetter = (event: CalendarEvent) => {
  const colors: Record<string, string> = {
    VISITA: '#d97706',    // amber
    LLAMADA: '#2563eb',   // blue
    CIERRE: '#16a34a',    // green
    REUNION: '#7c3aed',   // purple
  }
  return { style: { backgroundColor: colors[event.tipo] ?? '#52525b', border: 'none', borderRadius: '4px' } }
}
```

Features:
- Views: month / week / day (defaultView="week")
- SUPER_ADMIN: agent filter dropdown (shows all agents, filter by selected)
- Click event → modal with full details + edit
- Click empty slot → modal to create new event
- `POST /api/v1/admin/eventos` on create, `PUT /:id` on edit, `DELETE /:id` on delete

Event create form fields: titulo, tipo (select), inicio (datetime), fin (datetime), leadId (optional select), propiedadId (optional select), notas (textarea).

- [ ] Commit: `feat(admin): leads kanban, captaciones, agenda calendar`
