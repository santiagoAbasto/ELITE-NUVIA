import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import LoginPage from './login/LoginPage'
import AdminApp from './AdminApp'

const DashboardPage    = lazy(() => import('./dashboard/DashboardPage'))
const CmsShell         = lazy(() => import('./cms/CmsShell'))
const PropiedadesPage  = lazy(() => import('./crm/propiedades/PropiedadesPage'))
const PropiedadDetail  = lazy(() => import('./crm/propiedades/PropiedadDetail'))
const AgentesPage      = lazy(() => import('./crm/agentes/AgentesPage'))
const AgenteDetail     = lazy(() => import('./crm/agentes/AgenteDetail'))
const AgenteForm       = lazy(() => import('./crm/agentes/AgenteForm'))

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
        <Route path="cms/:seccion" element={<S><CmsShell /></S>} />

        {/* CRM — Propiedades */}
        <Route path="propiedades" element={<S><PropiedadesPage /></S>} />
        <Route path="propiedades/:id" element={<S><PropiedadDetail /></S>} />

        {/* CRM — Agentes */}
        <Route path="agentes" element={<S><AgentesPage /></S>} />
        <Route path="agentes/nuevo" element={<S><AgenteForm /></S>} />
        <Route path="agentes/:id" element={<S><AgenteDetail /></S>} />
        <Route path="agentes/:id/editar" element={<S><AgenteForm /></S>} />

        {/* Remaining — plan 08 */}
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
