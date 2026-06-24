import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface AgenteItem {
  id: string
  nombre: string
  apellido: string
  primerApellido?: string
  segundoApellido?: string
  email: string
  telefono: string
  foto?: string | null
  activo: boolean
  contratoFin?: string | null
  fechaNacimiento?: string | null
  _count: { propiedades: number; captaciones: number; leads: number }
  user?: { activo: boolean }
}

function diasParaVencer(fecha: string): number {
  return Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function Avatar({ agente }: { agente: AgenteItem }) {
  const initials = `${agente.nombre[0]}${(agente.primerApellido ?? agente.apellido)[0]}`.toUpperCase()
  if (agente.foto) return <img src={agente.foto} alt="" className="h-10 w-10 rounded-2xl object-cover ring-1 ring-gold/20" />
  return (
    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/[0.12] ring-1 ring-gold/[0.22]">
      <span className="text-[13px] font-black text-gold">{initials}</span>
    </div>
  )
}

export default function AgentesPage() {
  const { user } = useAdminAuth()
  const navigate = useNavigate()
  const [agentes, setAgentes] = useState<AgenteItem[]>([])
  const [loading, setLoading] = useState(true)
  const isSuperAdmin = user?.rol === 'SUPER_ADMIN'

  useEffect(() => {
    adminApi.get<AgenteItem[]>('/admin/agentes')
      .then(setAgentes).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleEstado = async (id: string, activo: boolean) => {
    await adminApi.patch(`/admin/agentes/${id}/estado`, { activo: !activo })
    setAgentes(prev => prev.map(a => a.id === id ? { ...a, activo: !activo } : a))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1520px] space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-3xl border border-gold/[0.08] bg-white/[0.03]" />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            Equipo
          </span>
          <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">
            Agentes
          </h1>
          <p className="mt-1 text-[13px] text-white/[0.42]">
            {agentes.length} agentes registrados
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => navigate('/admin/agentes/nuevo')}
            className="flex items-center gap-2 rounded-2xl border border-gold/[0.26] bg-gold/[0.10] px-4 py-2.5 text-[13px] font-bold text-gold transition-colors hover:bg-gold/[0.18]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo agente
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agentes.map(agente => {
          const dias = agente.contratoFin ? diasParaVencer(agente.contratoFin) : null
          const contratoPorVencer = dias !== null && dias <= 30

          return (
            <article
              key={agente.id}
              className="relative overflow-hidden rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.20)] transition-colors hover:border-gold/[0.22]"
            >
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.28] to-transparent" />

              {/* Top row */}
              <div className="flex items-start gap-3">
                <Avatar agente={agente} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-white">
                    {agente.nombre} {agente.primerApellido ?? agente.apellido}
                    {agente.segundoApellido ? ` ${agente.segundoApellido}` : ''}
                  </p>
                  <p className="truncate text-[12px] text-white/[0.42]">{agente.email}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${agente.activo ? 'bg-emerald-400/[0.10] text-emerald-300 border border-emerald-400/[0.20]' : 'bg-white/[0.05] text-white/[0.30] border border-white/[0.08]'}`}>
                  {agente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Propiedades', val: agente._count.propiedades },
                  { label: 'Captaciones', val: agente._count.captaciones },
                  { label: 'Leads', val: agente._count.leads },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-center">
                    <p className="text-[20px] font-black leading-none text-white">{s.val}</p>
                    <p className="mt-0.5 text-[10px] text-white/[0.36]">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contract warning */}
              {contratoPorVencer && dias !== null && (
                <div className="mt-3 flex items-center gap-2 rounded-2xl border border-amber-400/[0.24] bg-amber-400/[0.08] px-3 py-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Contrato vence en {dias} día{dias !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/admin/agentes/${agente.id}`)}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.035] py-2 text-[12px] font-semibold text-white/[0.68] transition-colors hover:border-gold/[0.20] hover:text-gold"
                >
                  Ver ficha
                </button>
                {isSuperAdmin && (
                  <>
                    <button
                      onClick={() => navigate(`/admin/agentes/${agente.id}/editar`)}
                      className="flex-1 rounded-xl border border-gold/[0.18] bg-gold/[0.08] py-2 text-[12px] font-semibold text-gold transition-colors hover:bg-gold/[0.16]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleEstado(agente.id, agente.activo)}
                      className={`rounded-xl border px-3 py-2 text-[12px] font-semibold transition-colors ${agente.activo ? 'border-red-400/[0.20] bg-red-400/[0.08] text-red-300 hover:bg-red-400/[0.14]' : 'border-emerald-400/[0.20] bg-emerald-400/[0.08] text-emerald-300 hover:bg-emerald-400/[0.14]'}`}
                    >
                      {agente.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {agentes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-gold/[0.08] bg-white/[0.02] py-16">
          <p className="text-[14px] text-white/[0.38]">No hay agentes registrados</p>
          {isSuperAdmin && (
            <button onClick={() => navigate('/admin/agentes/nuevo')} className="mt-4 text-[13px] text-gold hover:underline">
              Crear el primer agente
            </button>
          )}
        </div>
      )}
    </div>
  )
}
