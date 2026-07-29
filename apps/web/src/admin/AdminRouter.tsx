import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import LoginPage from './login/LoginPage'
import AdminApp from './AdminApp'

const DashboardPage     = lazy(() => import('./dashboard/DashboardPage'))
const CmsShell          = lazy(() => import('./cms/CmsShell'))
const PropiedadesPage   = lazy(() => import('./crm/propiedades/PropiedadesPage'))
const PropiedadDetail   = lazy(() => import('./crm/propiedades/PropiedadDetail'))
const PropiedadForm     = lazy(() => import('./crm/propiedades/PropiedadForm'))
const AgentesPage       = lazy(() => import('./crm/agentes/AgentesPage'))
const AgenteDetail      = lazy(() => import('./crm/agentes/AgenteDetail'))
const AgenteForm        = lazy(() => import('./crm/agentes/AgenteForm'))
const LeadsKanban       = lazy(() => import('./crm/leads/LeadsKanban'))
const LeadDetail        = lazy(() => import('./crm/leads/LeadDetail'))
const CaptacionesPage   = lazy(() => import('./crm/captaciones/CaptacionesPage'))
const CaptacionDetail   = lazy(() => import('./crm/captaciones/CaptacionDetail'))
const CaptacionForm     = lazy(() => import('./crm/captaciones/CaptacionForm'))
const AgendaPage        = lazy(() => import('./crm/agenda/AgendaPage'))
const ReportesPage      = lazy(() => import('./crm/reportes/ReportesPage'))
const UsuariosPage      = lazy(() => import('./crm/usuarios/UsuariosPage'))

function Spinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  )
}

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-[#07100b]" />
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-[#07100b]" />
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.rol !== 'SUPER_ADMIN') return <Navigate to="/admin/dashboard" replace />
  return <>{children}</>
}

function ModuloGuard({ modulo, children }: { modulo: 'cms' | 'propiedades' | 'captaciones' | 'leads' | 'agenda' | 'reportes'; children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-[#07100b]" />
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.rol === 'COORDINADOR' && !user.permisos.includes(modulo)) return <Navigate to="/admin/dashboard" replace />
  return <>{children}</>
}

function Placeholder() {
  return (
    <div className="flex h-64 items-center justify-center rounded-[28px] border border-gold/[0.08] bg-white/[0.02]">
      <p className="text-[14px] text-white/[0.36]">Módulo en construcción</p>
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spinner />}>{children}</Suspense>
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="*" element={<Guard><AdminApp /></Guard>}>

        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<S><DashboardPage /></S>} />

        {/* CMS */}
        <Route path="cms" element={<Navigate to="/admin/cms/home" replace />} />
        <Route path="cms/:seccion" element={<ModuloGuard modulo="cms"><S><CmsShell /></S></ModuloGuard>} />

        {/* Propiedades */}
        <Route path="propiedades" element={<ModuloGuard modulo="propiedades"><S><PropiedadesPage /></S></ModuloGuard>} />
        <Route path="propiedades/nueva" element={<ModuloGuard modulo="propiedades"><S><PropiedadForm /></S></ModuloGuard>} />
        <Route path="propiedades/:id" element={<ModuloGuard modulo="propiedades"><S><PropiedadDetail /></S></ModuloGuard>} />

        {/* Agentes (equipo interno) — solo Super Admin */}
        <Route path="agentes" element={<SuperAdminGuard><S><AgentesPage /></S></SuperAdminGuard>} />
        <Route path="agentes/nuevo" element={<SuperAdminGuard><S><AgenteForm /></S></SuperAdminGuard>} />
        <Route path="agentes/:id" element={<SuperAdminGuard><S><AgenteDetail /></S></SuperAdminGuard>} />
        <Route path="agentes/:id/editar" element={<SuperAdminGuard><S><AgenteForm /></S></SuperAdminGuard>} />

        {/* Usuarios administrativos — solo Super Admin */}
        <Route path="usuarios" element={<SuperAdminGuard><S><UsuariosPage /></S></SuperAdminGuard>} />

        {/* Leads */}
        <Route path="leads" element={<ModuloGuard modulo="leads"><S><LeadsKanban /></S></ModuloGuard>} />
        <Route path="leads/:id" element={<ModuloGuard modulo="leads"><S><LeadDetail /></S></ModuloGuard>} />

        {/* Captaciones */}
        <Route path="captaciones" element={<ModuloGuard modulo="captaciones"><S><CaptacionesPage /></S></ModuloGuard>} />
        <Route path="captaciones/nueva" element={<ModuloGuard modulo="captaciones"><S><CaptacionForm /></S></ModuloGuard>} />
        <Route path="captaciones/:id" element={<ModuloGuard modulo="captaciones"><S><CaptacionDetail /></S></ModuloGuard>} />

        {/* Agenda */}
        <Route path="agenda" element={<ModuloGuard modulo="agenda"><S><AgendaPage /></S></ModuloGuard>} />

        {/* Reportes */}
        <Route path="reportes" element={<ModuloGuard modulo="reportes"><S><ReportesPage /></S></ModuloGuard>} />

        <Route path="*" element={<Placeholder />} />
      </Route>
    </Routes>
  )
}

export default function AdminRouter() {
  return (
    <AdminAuthProvider>
      <AdminRoutes />
    </AdminAuthProvider>
  )
}
