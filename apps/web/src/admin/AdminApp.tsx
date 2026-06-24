import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './shared/Sidebar'
import Topbar from './shared/Topbar'

export default function AdminApp() {
  return (
    <div className="admin-shell flex h-screen text-white overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#101812',
            color: '#fff',
            border: '1px solid rgba(201,168,76,0.2)',
            fontSize: '14px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
          },
        }}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="admin-main flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
