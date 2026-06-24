# 10 — Testing, Build & Deploy

## Verification steps after each phase

---

## Phase gates (run after each plan file is completed)

### After 02 (routing + auth):
- [ ] `pnpm --filter @elite/web typecheck` — no errors
- [ ] Open `http://localhost:3000/admin/login` — login form renders
- [ ] Login with wrong credentials → error message shown
- [ ] Login with valid SUPER_ADMIN → redirects to `/admin/dashboard`
- [ ] Refresh page on `/admin/dashboard` → stays logged in (JWT cookie persists)
- [ ] Access `/admin/dashboard` without login → redirects to `/admin/login`

### After 03 (DB migrations):
- [ ] `pnpm --filter @elite/api db:migrate` exits 0
- [ ] `pnpm --filter @elite/api db:generate` exits 0
- [ ] `pnpm --filter @elite/api typecheck` — no errors
- [ ] `pnpm --filter @elite/api db:studio` — new tables visible: site_content, captaciones, eventos, interacciones, notificaciones, actividades_captacion

### After 04 (API routes):
- [ ] `pnpm --filter @elite/api typecheck` — no errors
- [ ] `curl -s -b cookies.txt http://localhost:4000/api/v1/cms/hero` → returns `{ seccion: 'hero', datos: {} }`
- [ ] `curl -s -X PUT -b cookies.txt -H 'Content-Type: application/json' -d '{"titulo":"Test"}' http://localhost:4000/api/v1/cms/hero` → 200 with saved data
- [ ] AGENTE token cannot PUT /cms/* → 403
- [ ] AGENTE cannot edit property not owned → 403

### After 05 (admin layout):
- [ ] Sidebar renders all sections matching public nav order
- [ ] AGENTE login → CMS section NOT visible in sidebar
- [ ] COORDINADOR login → CMS section NOT visible, Agentes management visible
- [ ] Notification bell shows unread count badge
- [ ] Dashboard loads without errors, charts render

### After 06 (CMS + properties):
- [ ] Edit Hero section: change titulo, save → `GET /api/v1/cms/hero` returns new titulo
- [ ] Upload image in CMS → Cloudinary URL saved
- [ ] Properties list renders with filters working
- [ ] AGENTE sees "Editar" button only on owned properties
- [ ] PDF download triggers browser download

### After 07 (agents):
- [ ] Create agent → user login works with temporary password
- [ ] Contract expiry warning shows when < 30 days remaining
- [ ] Age calculated correctly from fecha de nacimiento

### After 08 (leads, captaciones, agenda):
- [ ] Drag lead card between kanban columns → estado updates in DB
- [ ] Create captacion → appears in list with EN_NEGOCIACION estado
- [ ] Advance captacion to CAPTADA → Propiedad created automatically, propiedadId linked
- [ ] Add actividad to captacion → appears in timeline
- [ ] Create calendar event → appears in react-big-calendar view
- [ ] SUPER_ADMIN agent filter on calendar → shows only selected agent events

---

## Final build check

- [ ] `pnpm build` from root — both `api` and `web` must build with 0 errors
- [ ] `pnpm typecheck` from root — 0 errors
- [ ] Check bundle: `ls -lh apps/web/dist/assets/*.js` — admin chunk should be separate from main bundle (lazy load working)

---

## Types package update

- [ ] Add to `packages/types/src/index.ts`:

```ts
export type TipoEvento = 'VISITA' | 'LLAMADA' | 'CIERRE' | 'REUNION'
export type EstadoCaptacion = 'EN_NEGOCIACION' | 'CAPTADA' | 'PUBLICADA' | 'EN_CIERRE' | 'CERRADA' | 'EXPIRADA'
export type Temperatura = 'FRIO' | 'TIBIO' | 'CALIENTE'

export interface AdminAgente {
  id: string; nombre: string; primerApellido: string; segundoApellido?: string
  email: string; telefono: string; whatsapp: string; foto?: string; activo: boolean
  contratoFin?: string; captacionesCount?: number; leadsCount?: number
}

export interface Captacion {
  id: string; estado: EstadoCaptacion; agenteId: string
  propietarioNombre: string; propietarioTelefono: string
  tipoInmueble: TipoInmueble; tipo: TipoOperacion
  ciudad: string; precioSolicitado: number; moneda: string
  createdAt: string; updatedAt: string
}

export interface Evento {
  id: string; titulo: string; tipo: TipoEvento
  inicio: string; fin: string; agenteId: string
  leadId?: string; propiedadId?: string; notas?: string
}
```

- [ ] `pnpm --filter @elite/types build`
- [ ] Final commit: `feat(admin): complete CMS + CRM admin panel`
