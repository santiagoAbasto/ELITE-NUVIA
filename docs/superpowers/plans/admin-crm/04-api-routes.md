# 04 — API Routes

## Files to create/modify

- Create: `apps/api/src/routes/cms.ts`
- Create: `apps/api/src/routes/adminAgentes.ts`
- Create: `apps/api/src/routes/adminCaptaciones.ts`
- Create: `apps/api/src/routes/adminEventos.ts`
- Create: `apps/api/src/routes/adminLeads.ts`
- Create: `apps/api/src/routes/adminNotificaciones.ts`
- Modify: `apps/api/src/app.ts` — register all new routers

Pattern from existing code: `try { ... } catch (err) { next(err) }`. All protected routes use `verifyJWT` from `../middleware/auth.js`. Role guard: `requireRole('SUPER_ADMIN', 'COORDINADOR')`.

---

## Task 1 — CMS routes (`/api/v1/cms`)

- [ ] Create `apps/api/src/routes/cms.ts`

```ts
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyJWT, requireRole } from '../middleware/auth.js'

export const cmsRouter = Router()
cmsRouter.use(verifyJWT)

// GET /api/v1/cms/:seccion — public read (no auth needed for public site)
cmsRouter.get('/:seccion', async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findUnique({ where: { seccion: req.params.seccion } })
    res.json(content ?? { seccion: req.params.seccion, datos: {} })
  } catch (err) { next(err) }
})

// PUT /api/v1/cms/:seccion — SUPER_ADMIN only
cmsRouter.put('/:seccion', requireRole('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const content = await prisma.siteContent.upsert({
      where: { seccion: req.params.seccion },
      update: { datos: req.body, updatedBy: req.user!.userId },
      create: { seccion: req.params.seccion, datos: req.body, updatedBy: req.user!.userId },
    })
    res.json(content)
  } catch (err) { next(err) }
})
```

Note: move GET outside `verifyJWT` so the public site can read CMS content without auth.

---

## Task 2 — Admin Agentes (`/api/v1/admin/agentes`)

- [ ] Create `apps/api/src/routes/adminAgentes.ts`

Endpoints:
- `GET /` — list all agentes (SUPER_ADMIN + COORDINADOR)
- `GET /:id` — get one with metrics
- `POST /` — create agente + user (SUPER_ADMIN only), hash password with bcrypt
- `PUT /:id` — update agente fields (SUPER_ADMIN only)
- `PATCH /:id/estado` — activate/deactivate (SUPER_ADMIN only)
- `POST /:id/contrato` — upload contrato PDF URL (SUPER_ADMIN only)

On POST create: `bcrypt.hash(password, 10)`, create `User` with `rol: 'AGENTE'`, link to `Agente` via `agenteId`.

---

## Task 3 — Admin Captaciones (`/api/v1/admin/captaciones`)

- [ ] Create `apps/api/src/routes/adminCaptaciones.ts`

Endpoints:
- `GET /` — SUPER_ADMIN/COORDINADOR see all; AGENTE sees only their `agenteId`
- `GET /:id` — with actividades included
- `POST /` — create captacion, set `agenteId` from auth if AGENTE
- `PUT /:id` — edit if `captacion.agenteId === user.agenteId` OR SUPER_ADMIN
- `PATCH /:id/estado` — advance estado, on `CAPTADA` auto-create `Propiedad` and link `propiedadId`
- `POST /:id/actividad` — append `ActividadCaptacion`

Permission check helper:
```ts
async function canEditCaptacion(captacionId: string, user: AuthPayload): Promise<boolean> {
  if (user.rol !== 'AGENTE') return true
  const agente = await prisma.agente.findFirst({ where: { user: { id: user.userId } } })
  const c = await prisma.captacion.findUnique({ where: { id: captacionId }, select: { agenteId: true } })
  return c?.agenteId === agente?.id
}
```

---

## Task 4 — Admin Propiedades (`/api/v1/admin/propiedades`)

- [ ] Create `apps/api/src/routes/adminPropiedades.ts`

Endpoints:
- `GET /` — all properties with agente + captacion info
- `GET /:id` — full detail
- `PUT /:id` — edit only if `canEditPropiedad` resolves true
- `PATCH /:id/asignar` — SUPER_ADMIN assigns `agenteAsignadoId`

```ts
async function canEditPropiedad(propiedadId: string, user: AuthPayload): Promise<boolean> {
  if (user.rol !== 'AGENTE') return true
  const agente = await prisma.agente.findFirst({ where: { user: { id: user.userId } } })
  const p = await prisma.propiedad.findUnique({
    where: { id: propiedadId },
    include: { captacion: { select: { agenteId: true } } },
  })
  return p?.captacion?.agenteId === agente?.id || p?.agenteAsignadoId === agente?.id
}
```

---

## Task 5 — Admin Leads, Eventos, Notificaciones

- [ ] Create `apps/api/src/routes/adminLeads.ts`
  - `GET /` filtered by rol (AGENTE sees own), `PUT /:id`, `PATCH /:id/estado`, `POST /:id/interaccion`
- [ ] Create `apps/api/src/routes/adminEventos.ts`
  - `GET /` (agente filter), `POST /`, `PUT /:id`, `DELETE /:id`
- [ ] Create `apps/api/src/routes/adminNotificaciones.ts`
  - `GET /` for current user, `PATCH /:id/leer`, `PATCH /leer-todas`

---

## Task 6 — Register routes in app.ts

- [ ] Modify `apps/api/src/app.ts` — add after existing routes:

```ts
import { cmsRouter } from './routes/cms.js'
import { adminAgentesRouter } from './routes/adminAgentes.js'
import { adminCaptacionesRouter } from './routes/adminCaptaciones.js'
import { adminPropiedadesRouter } from './routes/adminPropiedades.js'
import { adminLeadsRouter } from './routes/adminLeads.js'
import { adminEventosRouter } from './routes/adminEventos.js'
import { adminNotificacionesRouter } from './routes/adminNotificaciones.js'

app.use('/api/v1/cms', cmsRouter)
app.use('/api/v1/admin/agentes', verifyJWT, adminAgentesRouter)
app.use('/api/v1/admin/captaciones', verifyJWT, adminCaptacionesRouter)
app.use('/api/v1/admin/propiedades', verifyJWT, adminPropiedadesRouter)
app.use('/api/v1/admin/leads', verifyJWT, adminLeadsRouter)
app.use('/api/v1/admin/eventos', verifyJWT, adminEventosRouter)
app.use('/api/v1/admin/notificaciones', verifyJWT, adminNotificacionesRouter)
```

- [ ] `pnpm --filter @elite/api typecheck` — must pass
- [ ] Commit: `feat(api): add CMS + CRM admin routes`
