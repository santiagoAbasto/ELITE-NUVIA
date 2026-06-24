# Admin CMS + CRM — Implementation Plan Overview

> **Workers:** Use `superpowers:subagent-driven-development` to execute task by task.

**Goal:** Panel admin completo en `/admin/*` dentro de `apps/web` (React/Vite port 3000).

**Architecture:** Lazy-loaded module en `apps/web/src/admin/`. Public bundle no carga nada del admin. API Express existente extendida con nuevas rutas bajo `/api/v1/admin/*` y `/api/v1/cms/*`.

**Tech Stack:** React 18 + Vite + TailwindCSS + TipTap + react-big-calendar + @dnd-kit + recharts + react-hook-form + zod + react-hot-toast. Backend: Express 5 + Prisma 5 + PostgreSQL + Cloudinary + Puppeteer.

---

## Execution Order

| File | Scope |
|---|---|
| `02-routing-auth-admin.md` | App.tsx lazy route + AdminApp layout + auth context |
| `03-data-models-prisma.md` | Migraciones Prisma: SiteContent, Captacion, Evento, Interaccion, Notificacion |
| `04-api-routes.md` | Rutas API: /cms/*, /admin/agentes, /admin/captaciones, /admin/eventos, /admin/leads, /admin/notificaciones |
| `05-admin-layout-dashboard.md` | Sidebar, topbar, dashboard home con métricas |
| `06-properties-cms.md` | CMS editor (TipTap + Cloudinary) + módulo propiedades (view + conditional edit) |
| `07-agents-users-roles.md` | CRUD agentes, subida contrato, permisos por rol |
| `08-leads-crm.md` | Kanban leads + captaciones + agenda calendario |
| `09-pdf-generator.md` | Ficha PDF propiedad con datos agente (ya existe base en api/src/lib/pdf.ts) |
| `10-testing-build-deploy.md` | Typecheck, build, smoke tests |

## Key Constraints

- Agente: ve todas las propiedades (solo lectura). Edita SOLO si `propiedad.captacion.agenteId === user.agenteId` OR `propiedad.agenteAsignadoId === user.agenteId`
- SUPER_ADMIN: acceso total + CMS
- COORDINADOR: CRM completo, sin CMS
- Auth: httpOnly cookie JWT ya implementada en `apps/api/src/routes/auth.ts`
- `verifyJWT` y `requireRole` ya existen en `apps/api/src/middleware/auth.ts`

## New packages to install

```bash
# apps/web
pnpm --filter @elite/web add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image react-big-calendar date-fns @dnd-kit/core @dnd-kit/sortable recharts react-hook-form zod @hookform/resolvers react-hot-toast

# apps/api (already has cloudinary, puppeteer, bcryptjs, jsonwebtoken)
pnpm --filter @elite/api add nodemailer
pnpm --filter @elite/api add -D @types/nodemailer
```
