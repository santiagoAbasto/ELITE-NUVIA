import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import LoginPage from './login/LoginPage'
import AdminApp from './AdminApp'

const DashboardPage = lazy(() => import('./dashboard/DashboardPage'))

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Guard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  if (loading) return <div className="min-h-screen bg-zinc-950" />
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route
        path="*"
        element={
          <Guard>
            <AdminApp />
          </Guard>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<Spinner />}><DashboardPage /></Suspense>} />
        {/* Remaining routes wired in plans 06–08 */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-64">
            <p className="text-zinc-500 text-sm">Módulo en construcción</p>
          </div>
        } />
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
