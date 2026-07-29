import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Agente { id: string; nombre: string; apellido: string }
interface Captacion {
  id: string; propietarioNombre: string; propietarioTelefono: string
  tipo: string; tipoInmueble: string; ciudad: string; zona?: string
  precioSolicitado: number; moneda: string; estado: string
  agente: { nombre: string; apellido: string }
  propiedad?: { id: string; titulo: string; activa: boolean } | null
  createdAt: string
}

const ESTADO_META: Record<string, { label: string; color: string }> = {
  EN_NEGOCIACION: { label: 'En negociación', color: 'border-white/[0.10] bg-white/[0.03] text-white/[0.50]' },
  CAPTADA:        { label: 'Captada',         color: 'border-sky-400/[0.24] bg-sky-400/[0.08] text-sky-300' },
  PUBLICADA:      { label: 'Publicada',        color: 'border-gold/[0.28] bg-gold/[0.10] text-gold' },
  EN_CIERRE:      { label: 'En cierre',        color: 'border-amber-300/[0.28] bg-amber-300/[0.08] text-amber-300' },
  CERRADA:        { label: 'Cerrada',          color: 'border-emerald-400/[0.24] bg-emerald-400/[0.08] text-emerald-300' },
  EXPIRADA:       { label: 'Expirada',         color: 'border-red-400/[0.18] bg-red-400/[0.06] text-red-400/[0.70]' },
}

const ESTADOS = Object.keys(ESTADO_META)
const TIPOS = ['VENTA', 'ALQUILER', 'ANTICRETICO']

export default function CaptacionesPage() {
  const { user } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [captaciones, setCaptaciones] = useState<Captacion[]>([])
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    q: '',
    estado: '',
    tipo: '',
    ciudad: '',
    agenteId: searchParams.get('agenteId') ?? '',
  })

  const isAgent = user?.rol === 'AGENTE'

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ pageSize: '50' })
    if (filters.q) params.set('q', filters.q)
    if (filters.estado) params.set('estado', filters.estado)
    if (filters.tipo) params.set('tipo', filters.tipo)
    if (filters.ciudad) params.set('ciudad', filters.ciudad)
    if (filters.agenteId) params.set('agenteId', filters.agenteId)
    adminApi.get<{ data: Captacion[] }>(`/admin/captaciones?${params}`)
      .then(r => setCaptaciones(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters])
  useEffect(() => {
    if (!isAgent) {
      adminApi.get<Agente[]>('/admin/agentes')
        .then(setAgentes)
        .catch(() => setAgentes([]))
    }
  }, [isAgent])

  const selectClass = 'rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none focus:border-gold/[0.40]'
  const setFilter = (key: keyof typeof filters, value: string) => setFilters(f => ({ ...f, [key]: value }))

  return (
    <div className="mx-auto max-w-[1520px] space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">CRM</span>
          <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">Captaciones</h1>
          <p className="mt-1 text-[13px] text-white/[0.42]">{captaciones.length} captaciones registradas</p>
        </div>
        <button
          onClick={() => navigate('/admin/captaciones/nueva')}
          className="flex items-center gap-2 rounded-2xl border border-gold/[0.26] bg-gold/[0.10] px-4 py-2.5 text-[13px] font-bold text-gold transition-colors hover:bg-gold/[0.18]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Nueva captación
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,minmax(150px,1fr))]">
        <input
          value={filters.q}
          onChange={e => setFilter('q', e.target.value)}
          placeholder="Buscar propietario, telefono o zona..."
          className={selectClass}
        />
        <select value={filters.estado} onChange={e => setFilter('estado', e.target.value)} className={selectClass}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{ESTADO_META[s].label}</option>)}
        </select>
        <select value={filters.tipo} onChange={e => setFilter('tipo', e.target.value)} className={selectClass}>
          <option value="">Todas las operaciones</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          value={filters.ciudad}
          onChange={e => setFilter('ciudad', e.target.value)}
          placeholder="Ciudad"
          className={selectClass}
        />
        {!isAgent && (
          <select value={filters.agenteId} onChange={e => setFilter('agenteId', e.target.value)} className={selectClass}>
            <option value="">Todos los asesores</option>
            {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : captaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-gold/[0.08] bg-white/[0.02] py-16">
          <p className="text-[14px] text-white/[0.38]">No hay captaciones con estos filtros</p>
          <button onClick={() => navigate('/admin/captaciones/nueva')} className="mt-4 text-[13px] text-gold hover:underline">Crear primera captación</button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-gold/[0.10] bg-[#0b130d]/[0.86]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['Propietario', 'Inmueble', 'Precio', 'Agente', 'Estado', 'Web', 'Fecha', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {captaciones.map(c => {
                const estado = ESTADO_META[c.estado] ?? ESTADO_META.EN_NEGOCIACION
                return (
                  <tr key={c.id} className="transition-colors hover:bg-white/[0.025]">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{c.propietarioNombre}</p>
                      <p className="text-[11px] text-white/[0.38]">{c.propietarioTelefono}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{c.tipoInmueble}</p>
                      <p className="text-[11px] text-white/[0.38]">{c.tipo} · {c.ciudad}{c.zona ? ` — ${c.zona}` : ''}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                      {c.moneda} {Number(c.precioSolicitado).toLocaleString('es-BO')}
                    </td>
                    <td className="px-4 py-3 text-white/[0.50]">
                      {c.agente.nombre} {c.agente.apellido}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${estado.color}`}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.propiedad ? (
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${c.propiedad.activa ? 'border-emerald-400/[0.24] bg-emerald-400/[0.08] text-emerald-300' : 'border-white/[0.10] bg-white/[0.04] text-white/[0.38]'}`}>
                          {c.propiedad.activa ? 'Visible' : 'Solo CRM'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/[0.28]">Sin propiedad</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-white/[0.34]">
                      {new Date(c.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => navigate(`/admin/captaciones/${c.id}`)}
                          className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11px] font-semibold text-white/[0.54] hover:border-gold/[0.20] hover:text-gold transition-colors">
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
