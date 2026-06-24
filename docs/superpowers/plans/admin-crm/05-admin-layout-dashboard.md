# 05 — Admin Layout & Dashboard

## Files to create

- `apps/web/src/admin/AdminApp.tsx` — root layout
- `apps/web/src/admin/shared/Sidebar.tsx`
- `apps/web/src/admin/shared/Topbar.tsx`
- `apps/web/src/admin/shared/NotificationBell.tsx`
- `apps/web/src/admin/dashboard/DashboardPage.tsx`

---

## Task 1 — AdminApp layout shell

- [ ] Create `apps/web/src/admin/AdminApp.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './shared/Sidebar'
import Topbar from './shared/Topbar'

export default function AdminApp() {
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #3f3f46' } }} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

---

## Task 2 — Sidebar

- [ ] Create `apps/web/src/admin/shared/Sidebar.tsx`

Sidebar sections — order matches public navbar + CRM modules:

**SUPER_ADMIN only — CMS:**
- Inicio (Home hero)
- Propiedades (section)
- Agentes (section)
- Servicios
- Nosotros
- Contacto
- Footer

**All roles — CRM:**
- Dashboard
- Propiedades CRM
- Captaciones
- Leads
- Agenda
- Agentes (solo SUPER_ADMIN + COORDINADOR)
- Reportes
- Notificaciones

Style: dark zinc background, amber accent for active route, `NavLink` from react-router-dom for active class.

```tsx
import { NavLink } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const cmsLinks = [
  { to: '/admin/cms/home', label: 'Inicio' },
  { to: '/admin/cms/propiedades', label: 'Propiedades' },
  { to: '/admin/cms/agentes', label: 'Agentes' },
  { to: '/admin/cms/servicios', label: 'Servicios' },
  { to: '/admin/cms/nosotros', label: 'Nosotros' },
  { to: '/admin/cms/contacto', label: 'Contacto' },
  { to: '/admin/cms/footer', label: 'Footer' },
]

const crmLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/propiedades', label: 'Propiedades' },
  { to: '/admin/captaciones', label: 'Captaciones' },
  { to: '/admin/leads', label: 'Leads' },
  { to: '/admin/agenda', label: 'Agenda' },
  { to: '/admin/agentes', label: 'Agentes', roles: ['SUPER_ADMIN', 'COORDINADOR'] },
  { to: '/admin/reportes', label: 'Reportes' },
  { to: '/admin/notificaciones', label: 'Notificaciones' },
]
// Render both groups, filter crmLinks by role, show CMS group only for SUPER_ADMIN
```

---

## Task 3 — Topbar with notification bell

- [ ] Create `apps/web/src/admin/shared/Topbar.tsx`
  - Shows current user name + rol badge
  - `NotificationBell` component (unread count badge, dropdown last 5)
  - Logout button

- [ ] Create `apps/web/src/admin/shared/NotificationBell.tsx`
  - Polls `GET /api/v1/admin/notificaciones` every 60s
  - Shows unread count badge (amber dot)
  - Click opens dropdown with last 5 notifications
  - "Marcar todas leídas" button calls `PATCH /api/v1/admin/notificaciones/leer-todas`

---

## Task 4 — Dashboard Page

- [ ] Create `apps/web/src/admin/dashboard/DashboardPage.tsx`

Fetches in parallel on mount:
- `GET /api/v1/propiedades/count` — property totals
- `GET /api/v1/admin/leads?pageSize=5` — recent leads
- `GET /api/v1/admin/captaciones?pageSize=5` — recent captaciones
- `GET /api/v1/admin/notificaciones` — unread

Cards to show (recharts for charts):
- Total propiedades activas (venta / alquiler / anticretico)
- Leads por estado (BarChart)
- Captaciones por estado (BarChart)
- Próximos eventos (next 3 from agenda)
- Últimos leads (table, 5 rows)

AGENTE view: only their own metrics.
SUPER_ADMIN/COORDINADOR: global + per-agent breakdown.

- [ ] Commit: `feat(admin): layout shell, sidebar, topbar, dashboard`
