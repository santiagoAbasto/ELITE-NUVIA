import { useState } from 'react'
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
  { to: '/admin/dashboard', label: 'Dashboard', roles: [] },
  { to: '/admin/propiedades', label: 'Propiedades', roles: [] },
  { to: '/admin/captaciones', label: 'Captaciones', roles: [] },
  { to: '/admin/leads', label: 'Leads', roles: [] },
  { to: '/admin/agenda', label: 'Agenda', roles: [] },
  { to: '/admin/agentes', label: 'Agentes', roles: ['SUPER_ADMIN', 'COORDINADOR'] },
  { to: '/admin/reportes', label: 'Reportes', roles: [] },
]

type Rol = 'SUPER_ADMIN' | 'COORDINADOR' | 'AGENTE'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-lg text-sm transition-colors ${
    isActive
      ? 'bg-amber-500/10 text-amber-400 font-medium'
      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
  }`

export default function Sidebar() {
  const { user } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)
  const rol = user?.rol as Rol | undefined

  const visibleCrm = crmLinks.filter(l => l.roles.length === 0 || (rol && l.roles.includes(rol)))

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-60'} flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-200`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-800">
        {!collapsed && (
          <span className="text-white font-semibold text-sm tracking-wide">ELITE Nuvia</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-zinc-500 hover:text-white transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-2">
        {/* CMS — SUPER_ADMIN only */}
        {rol === 'SUPER_ADMIN' && !collapsed && (
          <div>
            <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
              Sitio Web
            </p>
            <nav className="space-y-0.5">
              {cmsLinks.map(l => (
                <NavLink key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* CRM */}
        <div>
          {!collapsed && (
            <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
              CRM
            </p>
          )}
          <nav className="space-y-0.5">
            {visibleCrm.map(l => (
              <NavLink key={l.to} to={l.to} className={collapsed ? 'flex justify-center py-2.5' : linkClass}>
                {collapsed ? (
                  <span className="text-zinc-400 text-xs font-medium">{l.label.slice(0, 2)}</span>
                ) : (
                  l.label
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-t border-zinc-800">
          <p className="text-xs text-white font-medium truncate">{user.nombre}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">{user.rol.replace('_', ' ')}</p>
        </div>
      )}
    </aside>
  )
}
