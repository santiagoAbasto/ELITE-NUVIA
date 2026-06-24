import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import NotificationBell from './NotificationBell'
import toast from 'react-hot-toast'

const rolLabel: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  COORDINADOR: 'Coordinador',
  AGENTE: 'Agente',
}

const rolColor: Record<string, string> = {
  SUPER_ADMIN: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  COORDINADOR: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  AGENTE: 'bg-zinc-700/50 text-zinc-300 border-zinc-600/30',
}

export default function Topbar() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/admin/login')
  }

  return (
    <header className="h-14 flex-shrink-0 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-3">
        <NotificationBell />

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium leading-none">{user.nombre}</p>
              <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${rolColor[user.rol] ?? rolColor.AGENTE}`}>
                {rolLabel[user.rol] ?? user.rol}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-800"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
