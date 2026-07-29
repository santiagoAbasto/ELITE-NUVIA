import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './shared/Sidebar'
import Topbar from './shared/Topbar'

export default function AdminApp() {
  useEffect(() => {
    document.documentElement.classList.add('admin-scroll-lock')
    document.body.classList.add('admin-scroll-lock')
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.scrollTo(0, 0)

    return () => {
      document.documentElement.classList.remove('admin-scroll-lock')
      document.body.classList.remove('admin-scroll-lock')
    }
  }, [])

  return (
    <div className="admin-shell fixed inset-0 flex h-screen min-h-0 text-white overflow-hidden">
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
      <div className="flex min-h-0 flex-1 flex-col min-w-0">
        <Topbar />
        <main className="admin-main min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-7 md:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
