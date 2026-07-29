import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAdminAuth, type AdminModulo } from '../context/AdminAuthContext'

type Rol = 'SUPER_ADMIN' | 'COORDINADOR' | 'AGENTE'
type AdminUserLike = { rol: Rol; permisos: AdminModulo[] }

interface NavItem {
  to: string
  label: string
  description: string
  icon: ReactNode
  // Restricts to specific roles regardless of permisos (e.g. team/user management).
  roles?: Rol[]
  // Gated by the user's assigned permisos when rol === COORDINADOR.
  // SUPER_ADMIN and AGENTE always pass a modulo check.
  modulo?: AdminModulo
}

function canSeeItem(user: AdminUserLike | null, item: NavItem): boolean {
  if (!user) return false
  if (item.roles && !item.roles.includes(user.rol)) return false
  if (item.modulo && user.rol === 'COORDINADOR' && !user.permisos.includes(item.modulo)) return false
  return true
}

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9 21v-6h6v6" />
  </svg>
)

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21h16" />
    <path d="M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
    <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" />
  </svg>
)

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
)

const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 6V5a2 2 0 012-2h0a2 2 0 012 2v1" />
    <rect x="3" y="6" width="18" height="14" rx="2" />
    <path d="M3 12h18" />
  </svg>
)

const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
)

const IconMessage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" />
  </svg>
)

const IconLayout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M9 10v10" />
  </svg>
)

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M8 16v-5M12 16V8M16 16v-3" />
  </svg>
)

const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

const IconFooter = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 16h16" />
  </svg>
)

const IconChevron = ({ collapsed }: { collapsed: boolean }) => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={collapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'} />
  </svg>
)

const cmsLinks: NavItem[] = [
  { to: '/admin/cms/home', label: 'Inicio', description: 'Hero y llamada principal', icon: <IconHome /> },
  { to: '/admin/cms/propiedades', label: 'Propiedades', description: 'Listados y filtros públicos', icon: <IconBuilding /> },
  { to: '/admin/cms/agentes', label: 'Agentes', description: 'Bloque de equipo público', icon: <IconUsers /> },
  { to: '/admin/cms/servicios', label: 'Servicios', description: 'Venta, alquiler y anticretico', icon: <IconBriefcase /> },
  { to: '/admin/cms/nosotros', label: 'Nosotros', description: 'Historia, valores y stats', icon: <IconInfo /> },
  { to: '/admin/cms/contacto', label: 'Contacto', description: 'Teléfono, mapa y horarios', icon: <IconMessage /> },
  { to: '/admin/cms/footer', label: 'Footer', description: 'Links, redes y legal', icon: <IconFooter /> },
]

const crmLinks: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', description: 'Actividad y operación', icon: <IconLayout /> },
  { to: '/admin/propiedades', label: 'Propiedades', description: 'Inventario y permisos', icon: <IconBuilding />, modulo: 'propiedades' },
  { to: '/admin/captaciones', label: 'Captaciones', description: 'Prospectos a publicación', icon: <IconBriefcase />, modulo: 'captaciones' },
  { to: '/admin/leads', label: 'Leads', description: 'Pipeline comercial', icon: <IconMessage />, modulo: 'leads' },
  { to: '/admin/agenda', label: 'Agenda', description: 'Visitas, llamadas y cierres', icon: <IconCalendar />, modulo: 'agenda' },
  { to: '/admin/agentes', label: 'Agentes', description: 'Equipo y contratos', icon: <IconUsers />, roles: ['SUPER_ADMIN'] },
  { to: '/admin/reportes', label: 'Reportes', description: 'Métricas por zona y agente', icon: <IconChart />, modulo: 'reportes' },
  { to: '/admin/usuarios', label: 'Usuarios', description: 'Cuentas admin y permisos', icon: <IconUsers />, roles: ['SUPER_ADMIN'] },
]

const rolLabel: Record<Rol, string> = {
  SUPER_ADMIN: 'Super Admin',
  COORDINADOR: 'Coordinador',
  AGENTE: 'Agente',
}

function SectionTitle({ children, collapsed }: { children: ReactNode; collapsed: boolean }) {
  if (collapsed) return <div className="mx-auto my-3 h-px w-7 bg-gold/20" />
  return (
    <div className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gold/[0.48]">
      {children}
    </div>
  )
}

function NavigationLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl border transition-all duration-200',
          collapsed ? 'mx-auto h-10 w-10 justify-center p-0' : 'px-3 py-2.5',
          isActive
            ? 'border-gold/[0.28] bg-gold/[0.12] text-gold shadow-[0_14px_36px_rgba(0,0,0,0.22)]'
            : 'border-transparent text-white/[0.54] hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${isActive ? 'bg-gold text-green-deep' : 'bg-white/[0.035] text-gold/70 group-hover:text-gold'}`}>
            <span className="block [&>svg]:h-[18px] [&>svg]:w-[18px]">{item.icon}</span>
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold leading-tight">{item.label}</span>
              <span className="mt-0.5 block truncate text-[11px] leading-tight text-white/[0.34] group-hover:text-white/[0.46]">
                {item.description}
              </span>
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user } = useAdminAuth()
  const [collapsed, setCollapsed] = useState(false)
  const rol = user?.rol as Rol | undefined
  const visibleCrm = crmLinks.filter(l => canSeeItem(user, l))
  const canSeeCms = rol === 'SUPER_ADMIN' || (rol === 'COORDINADOR' && !!user?.permisos.includes('cms'))

  return (
    <aside
      className={`${collapsed ? 'w-[76px]' : 'w-[292px]'} relative h-full min-h-0 flex-shrink-0 border-r border-gold/[0.12] bg-[#07100b]/[0.92] shadow-[24px_0_90px_rgba(0,0,0,0.28)] transition-[width] duration-200`}
    >
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-gold/[0.28] to-transparent" />
      <div className="flex h-full flex-col">
        <div className={`${collapsed ? 'px-3' : 'px-4'} border-b border-gold/[0.10] py-4`}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl border border-gold/[0.24] bg-gold/[0.10] text-gold shadow-[0_18px_42px_rgba(0,0,0,0.24)]">
              <span className="text-[13px] font-black tracking-[0.22em]">EN</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[15px] font-black tracking-[0.18em] text-white">ELITE</div>
                <div className="-mt-1 font-serif text-[19px] italic text-gold">Nuvia</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed(c => !c)}
              className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/[0.42] transition-colors hover:border-gold/[0.24] hover:text-gold"
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <IconChevron collapsed={collapsed} />
            </button>
          </div>
          {!collapsed && (
            <div className="mt-4 rounded-2xl border border-gold/[0.12] bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-white/[0.58]">Panel operativo</span>
                <span className="rounded-full bg-emerald-400/[0.12] px-2 py-0.5 text-[10px] font-bold text-emerald-300">Activo</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-[72%] rounded-full bg-gold" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {canSeeCms && (
            <div>
              <SectionTitle collapsed={collapsed}>Sitio web</SectionTitle>
              <nav className="space-y-1">
                {cmsLinks.map(item => (
                  <NavigationLink key={item.to} item={item} collapsed={collapsed} />
                ))}
              </nav>
            </div>
          )}

          <div>
            <SectionTitle collapsed={collapsed}>CRM</SectionTitle>
            <nav className="space-y-1">
              {visibleCrm.map(item => (
                <NavigationLink key={item.to} item={item} collapsed={collapsed} />
              ))}
            </nav>
          </div>
        </div>

        <div className={`${collapsed ? 'px-2' : 'px-4'} border-t border-gold/[0.10] py-4`}>
          {user && !collapsed ? (
            <div className="rounded-2xl border border-white/[0.08] bg-black/[0.16] p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold text-green-deep text-[12px] font-black">
                  {user.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-white">{user.nombre}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.36]">
                    {rol ? rolLabel[rol] : user.rol.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gold text-green-deep text-[12px] font-black" title={user.nombre}>
              {user.nombre.slice(0, 2).toUpperCase()}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
