import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAdminAuth } from '../context/AdminAuthContext'
import NotificationBell from './NotificationBell'

const rolLabel: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  COORDINADOR: 'Coordinador',
  AGENTE: 'Agente',
}

const rolColor: Record<string, string> = {
  SUPER_ADMIN: 'border-gold/[0.26] bg-gold/[0.12] text-gold',
  COORDINADOR: 'border-sky-400/[0.24] bg-sky-400/[0.10] text-sky-300',
  AGENTE: 'border-white/[0.12] bg-white/[0.055] text-white/[0.68]',
}

const cmsNames: Record<string, string> = {
  home: 'Inicio',
  propiedades: 'Propiedades',
  agentes: 'Agentes',
  servicios: 'Servicios',
  nosotros: 'Nosotros',
  contacto: 'Contacto',
  footer: 'Footer',
}

function getRouteMeta(pathname: string) {
  const cmsMatch = pathname.match(/\/admin\/cms\/([^/]+)/)
  if (cmsMatch) {
    const section = cmsNames[cmsMatch[1]] ?? 'Contenido'
    return { eyebrow: 'CMS del sitio público', title: section, detail: 'Edición, guardado y preview' }
  }
  if (pathname.startsWith('/admin/propiedades')) {
    return { eyebrow: 'CRM', title: 'Propiedades', detail: 'Inventario, agentes y permisos' }
  }
  if (pathname.startsWith('/admin/dashboard')) {
    return { eyebrow: 'Operación', title: 'Dashboard', detail: 'Pulso comercial de ELITE Nuvia' }
  }
  return { eyebrow: 'Admin', title: 'Módulo', detail: 'Panel interno' }
}

export default function Topbar() {
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const routeMeta = useMemo(() => getRouteMeta(location.pathname), [location.pathname])
  const today = useMemo(
    () => new Intl.DateTimeFormat('es-BO', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date()),
    [],
  )

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
    navigate('/admin/login')
  }

  return (
    <header className="h-[72px] flex-shrink-0 border-b border-gold/[0.12] bg-[#09110c]/[0.88] px-4 backdrop-blur-xl md:px-7">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-gold/[0.14] bg-gold/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold md:inline-flex">
              {routeMeta.eyebrow}
            </span>
            <span className="text-[12px] font-medium text-white/[0.38]">{today}</span>
          </div>
          <div className="mt-1 flex min-w-0 items-baseline gap-3">
            <h1 className="truncate text-[19px] font-bold tracking-[-0.02em] text-white">{routeMeta.title}</h1>
            <p className="hidden truncate text-[12px] text-white/[0.42] sm:block">{routeMeta.detail}</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-[12px] font-semibold text-white/[0.62] transition-colors hover:border-gold/[0.24] hover:text-gold lg:inline-flex"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
              <path d="M5 5v14h14" />
            </svg>
            Vista pública
          </a>

          <NotificationBell />

          {user && (
            <div className="flex items-center gap-3 border-l border-gold/[0.10] pl-2 md:pl-3">
              <div className="hidden text-right sm:block">
                <p className="text-[13px] font-semibold leading-none text-white">{user.nombre}</p>
                <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${rolColor[user.rol] ?? rolColor.AGENTE}`}>
                  {rolLabel[user.rol] ?? user.rol}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/[0.44] transition-colors hover:border-red-400/[0.28] hover:bg-red-400/[0.08] hover:text-red-300"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 16l4-4-4-4" />
                  <path d="M21 12H9" />
                  <path d="M13 20H6a3 3 0 01-3-3V7a3 3 0 013-3h7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
