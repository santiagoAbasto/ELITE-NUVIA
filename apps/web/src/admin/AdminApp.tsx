import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Sidebar and Topbar will be built in plan 05-admin-layout-dashboard
// This is the structural shell wired up now so routing works end-to-end

export default function AdminApp() {
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #3f3f46',
          },
        }}
      />
      {/* Sidebar placeholder — replaced in plan 05 */}
      <aside className="w-60 border-r border-zinc-800 bg-zinc-900 flex-shrink-0" />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar placeholder — replaced in plan 05 */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center px-6">
          <span className="text-zinc-500 text-sm">ELITE Nuvia Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
