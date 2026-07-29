import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Metricas {
  propiedadesActivas: number
  captacionesActivas: number
  leadsActivos: number
  cierresMes: number
  tasaConversion: number
}

interface AgenteDetailData {
  id: string
  nombre: string
  apellido: string
  primerApellido?: string
  segundoApellido?: string
  fechaNacimiento?: string
  email: string
  telefono: string
  whatsapp: string
  foto?: string | null
  bio?: string | null
  activo: boolean
  contratoUrl?: string | null
  contratoInicio?: string | null
  contratoFin?: string | null
}

function MetricTile({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-3xl border border-gold/[0.10] bg-white/[0.03] p-4 text-center">
      <p className={`text-[32px] font-black leading-none tracking-[-0.04em] ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="mt-1.5 text-[11px] text-white/[0.38]">{label}</p>
    </div>
  )
}

export default function AgenteDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAdminAuth()
  const navigate = useNavigate()
  const isSuperAdmin = user?.rol === 'SUPER_ADMIN'

  const [agente, setAgente] = useState<AgenteDetailData | null>(null)
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      adminApi.get<AgenteDetailData>(`/admin/agentes/${id}`),
      adminApi.get<Metricas>(`/admin/agentes/${id}/metricas`),
    ]).then(([a, m]) => { setAgente(a); setMetricas(m) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </div>
  )

  if (!agente) return <p className="text-white/[0.42]">Agente no encontrado</p>

  const diasContrato = agente.contratoFin
    ? Math.ceil((new Date(agente.contratoFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const nombreCompleto = [agente.nombre, agente.primerApellido ?? agente.apellido, agente.segundoApellido]
    .filter(Boolean).join(' ')

  const apellidoInicial = agente.primerApellido || agente.apellido || ''

  const edad = agente.fechaNacimiento
    ? Math.floor((Date.now() - new Date(agente.fechaNacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/admin/agentes')} className="flex items-center gap-2 text-[13px] text-white/[0.42] hover:text-white transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver a agentes
      </button>

      {/* Hero card */}
      <section className="relative overflow-hidden rounded-[32px] border border-gold/[0.14] bg-[#0b130d]/[0.90] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.38] to-transparent" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {agente.foto ? (
              <img src={agente.foto} alt={nombreCompleto} className="h-24 w-24 rounded-3xl object-cover ring-2 ring-gold/[0.24]" />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gold/[0.12] ring-2 ring-gold/[0.20]">
                <span className="text-[28px] font-black text-gold">{agente.nombre[0] ?? ''}{apellidoInicial[0] ?? ''}</span>
              </div>
            )}
            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0b130d] ${agente.activo ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[26px] font-black tracking-[-0.04em] text-white">{nombreCompleto}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${agente.activo ? 'border-emerald-400/[0.24] bg-emerald-400/[0.10] text-emerald-300' : 'border-white/[0.10] bg-white/[0.04] text-white/[0.38]'}`}>
                {agente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/[0.50]">
              <span>{agente.email}</span>
              <span>{agente.telefono}</span>
              {edad !== null && <span>{edad} años</span>}
            </div>

            {agente.bio && (
              <p className="mt-3 max-w-none whitespace-pre-wrap text-[13px] leading-relaxed text-white/[0.56]">{agente.bio}</p>
            )}
          </div>

          {/* Actions */}
          {isSuperAdmin && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/agentes/${id}/editar`)}
                className="rounded-2xl border border-gold/[0.22] bg-gold/[0.10] px-4 py-2 text-[13px] font-bold text-gold hover:bg-gold/[0.18] transition-colors"
              >
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Contract info */}
        {(agente.contratoInicio || agente.contratoFin) && (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
            {agente.contratoInicio && (
              <div>
                <p className="text-[10px] text-white/[0.36] uppercase tracking-wider">Inicio contrato</p>
                <p className="text-[13px] font-semibold text-white">{new Date(agente.contratoInicio).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            )}
            {agente.contratoFin && (
              <div>
                <p className="text-[10px] text-white/[0.36] uppercase tracking-wider">Fin contrato</p>
                <p className="text-[13px] font-semibold text-white">{new Date(agente.contratoFin).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            )}
            {diasContrato !== null && diasContrato <= 30 && (
              <div className="ml-auto flex items-center gap-2 rounded-2xl border border-amber-400/[0.26] bg-amber-400/[0.09] px-3 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <p className="text-[12px] font-bold text-amber-300">Vence en {diasContrato} días</p>
              </div>
            )}
            {agente.contratoUrl && (
              <a href={agente.contratoUrl} target="_blank" rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 text-[12px] text-gold hover:underline">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Ver contrato
              </a>
            )}
          </div>
        )}
      </section>

      {/* Metrics */}
      {metricas && (
        <section>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.20em] text-white/[0.36]">Rendimiento</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <MetricTile label="Props. activas" value={metricas.propiedadesActivas} />
            <MetricTile label="Captaciones" value={metricas.captacionesActivas} />
            <MetricTile label="Leads activos" value={metricas.leadsActivos} />
            <MetricTile label="Cierres mes" value={metricas.cierresMes} accent />
            <MetricTile label="Conversión" value={`${metricas.tasaConversion}%`} accent />
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Ver sus propiedades', to: `/admin/propiedades?agenteId=${id}`, desc: 'Inventario asignado' },
          { label: 'Ver sus captaciones', to: `/admin/captaciones?agenteId=${id}`, desc: 'Proceso de captación' },
          { label: 'Ver su agenda', to: `/admin/agenda?agenteId=${id}`, desc: 'Visitas y cierres' },
        ].map(a => (
          <button key={a.to} onClick={() => navigate(a.to)}
            className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-4 text-left transition-colors hover:border-gold/[0.18] hover:bg-gold/[0.04]"
          >
            <p className="text-[14px] font-bold text-white">{a.label}</p>
            <p className="mt-0.5 text-[12px] text-white/[0.38]">{a.desc}</p>
          </button>
        ))}
      </section>
    </div>
  )
}
