import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './shared/Sidebar'
import Topbar from './shared/Topbar'

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
            fontSize: '14px',
          },
        }}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
