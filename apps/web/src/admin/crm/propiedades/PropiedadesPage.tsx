import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Agente { id: string; nombre: string; apellido: string }
interface Propiedad {
  id: string
  slug: string
  titulo: string
  precio: number
  moneda: string
  ciudad: string
  zona: string | null
  tipo: string
  tipoInmueble: string
  activa: boolean
  destacada: boolean
  canEdit: boolean
  agente: Agente
  fotos: { url: string; urlThumb: string }[]
}
interface PropiedadesRes { data: Propiedad[]; total: number; page: number; pageSize: number; totalPages: number }

const TIPOS = ['VENTA', 'ALQUILER', 'ANTICRETICO']
const TIPOS_INMUEBLE = ['CASA', 'DEPARTAMENTO', 'GARZONIER', 'TERRENO', 'LOCAL', 'OTRO']

const selectClass = 'rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2.5 text-[13px] text-white outline-none transition-colors focus:border-gold/[0.42]'

function formatType(value: string) {
  return value.replace(/_/g, ' ')
}

function VisibilitySwitch({ checked, disabled, onChange }: {
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${checked ? 'border-emerald-400/[0.34] bg-emerald-400/[0.22]' : 'border-white/[0.12] bg-white/[0.06]'}`}
      aria-label={checked ? 'Ocultar de la web' : 'Mostrar en web'}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full transition-transform ${checked ? 'translate-x-6 bg-emerald-300' : 'translate-x-1 bg-white/[0.72]'}`} />
    </button>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${active ? 'border-emerald-400/[0.22] bg-emerald-400/[0.08] text-emerald-300' : 'border-white/[0.10] bg-white/[0.04] text-white/[0.38]'}`}>
      {active ? 'Web' : 'CRM'}
    </span>
  )
}

export default function PropiedadesPage() {
  const { user } = useAdminAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<PropiedadesRes | null>(null)
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    q: '',
    tipo: '',
    tipoInmueble: '',
    ciudad: '',
    activa: '',
    destacada: '',
    agenteId: searchParams.get('agenteId') ?? '',
  })

  const isAgent = user?.rol === 'AGENTE'

  useEffect(() => {
    if (!isAgent) {
      adminApi.get<Agente[]>('/admin/agentes')
        .then(setAgentes)
        .catch(() => setAgentes([]))
    }
  }, [isAgent])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '15' })
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    adminApi.get<PropiedadesRes>(`/admin/propiedades?${params}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [page, filters])

  const pageRows = data?.data ?? []
  const activeRows = useMemo(() => pageRows.filter(p => p.activa).length, [pageRows])
  const draftRows = useMemo(() => pageRows.filter(p => !p.activa).length, [pageRows])

  const setFilter = (key: keyof typeof filters, value: string) => {
    setPage(1)
    setFilters(f => ({ ...f, [key]: value }))
  }

  const patchRow = (updated: Propiedad) => {
    setData(prev => prev
      ? { ...prev, data: prev.data.map(item => item.id === updated.id ? { ...item, ...updated } : item) }
      : prev)
  }

  const togglePublicacion = async (propiedad: Propiedad, activa: boolean) => {
    try {
      const updated = await adminApi.patch<Propiedad>(`/admin/propiedades/${propiedad.id}/publicacion`, { activa })
      patchRow(updated)
      toast.success(activa ? 'Propiedad visible en web' : 'Propiedad oculta de la web')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la publicacion')
    }
  }

  const downloadPdf = async (propiedad: Propiedad) => {
    toast.loading('Generando PDF...', { id: `pdf-${propiedad.id}` })
    try {
      const res = await fetch(`/api/v1/admin/pdf/${propiedad.id}`, { credentials: 'include' })
      if (!res.ok) throw new Error('No se pudo generar el PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ficha-${propiedad.slug}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF descargado', { id: `pdf-${propiedad.id}` })
    } catch {
      toast.error('No se pudo generar el PDF', { id: `pdf-${propiedad.id}` })
    }
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-6">
      <section className="rounded-[30px] border border-gold/[0.14] bg-[#0b130d]/[0.90] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              Inventario CRM
            </span>
            <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">Propiedades</h1>
            <p className="mt-1 text-[13px] text-white/[0.46]">
              {data?.total ?? 0} inmuebles en inventario. {isAgent ? 'Tu dashboard y reportes muestran solo tus datos.' : 'Puedes filtrar por asesor y estado de publicacion.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/propiedades/nueva')}
            className="rounded-2xl bg-gold px-4 py-3 text-[13px] font-black text-green-deep transition-colors hover:bg-gold-light"
          >
            Nueva propiedad
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">Pagina actual</p>
            <p className="mt-2 text-[26px] font-black text-white">{pageRows.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/[0.15] bg-emerald-400/[0.055] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300/[0.70]">Visibles en web</p>
            <p className="mt-2 text-[26px] font-black text-emerald-300">{activeRows}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">Solo CRM</p>
            <p className="mt-2 text-[26px] font-black text-white/[0.72]">{draftRows}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-gold/[0.10] bg-[#0b130d]/[0.78] p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(5,minmax(150px,1fr))]">
          <input
            value={filters.q}
            onChange={e => setFilter('q', e.target.value)}
            placeholder="Buscar por titulo, ciudad o zona..."
            className={`${selectClass} min-w-0`}
          />
          <select value={filters.tipo} onChange={e => setFilter('tipo', e.target.value)} className={selectClass}>
            <option value="">Operaciones</option>
            {TIPOS.map(t => <option key={t} value={t}>{formatType(t)}</option>)}
          </select>
          <select value={filters.tipoInmueble} onChange={e => setFilter('tipoInmueble', e.target.value)} className={selectClass}>
            <option value="">Tipos</option>
            {TIPOS_INMUEBLE.map(t => <option key={t} value={t}>{formatType(t)}</option>)}
          </select>
          <select value={filters.activa} onChange={e => setFilter('activa', e.target.value)} className={selectClass}>
            <option value="">Web y CRM</option>
            <option value="true">Visible en web</option>
            <option value="false">Solo CRM</option>
          </select>
          <select value={filters.destacada} onChange={e => setFilter('destacada', e.target.value)} className={selectClass}>
            <option value="">Destacadas y normales</option>
            <option value="true">Solo destacadas</option>
            <option value="false">No destacadas</option>
          </select>
          {!isAgent && (
            <select value={filters.agenteId} onChange={e => setFilter('agenteId', e.target.value)} className={selectClass}>
              <option value="">Todos los asesores</option>
              {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
            </select>
          )}
        </div>
      </section>

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
          ))}
        </div>
      ) : pageRows.length === 0 ? (
        <div className="rounded-[28px] border border-gold/[0.08] bg-white/[0.02] px-5 py-16 text-center">
          <p className="text-[14px] text-white/[0.42]">No hay propiedades con estos filtros.</p>
          <button onClick={() => navigate('/admin/propiedades/nueva')} className="mt-4 text-[13px] font-bold text-gold hover:underline">
            Crear propiedad
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-gold/[0.10] bg-[#0b130d]/[0.86]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['Inmueble', 'Precio', 'Asesor', 'Estado web', 'PDF', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {pageRows.map(p => (
                <tr key={p.id} className="transition-colors hover:bg-white/[0.025]">
                  <td className="px-4 py-3">
                    <div className="flex min-w-[320px] items-center gap-3">
                      {p.fotos[0] ? (
                        <img src={p.fotos[0].urlThumb || p.fotos[0].url} alt="" className="h-12 w-12 rounded-2xl object-cover bg-white/[0.04]" />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/[0.12] bg-gold/[0.06] text-gold">
                          <span className="text-[13px] font-black">EN</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-bold text-white">{p.titulo}</p>
                        <p className="mt-0.5 text-[11px] text-white/[0.38]">{p.ciudad}{p.zona ? `, ${p.zona}` : ''} - {formatType(p.tipo)} - {formatType(p.tipoInmueble)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-black text-white">
                    {p.moneda} {Number(p.precio).toLocaleString('es-BO')}
                  </td>
                  <td className="px-4 py-3 text-white/[0.54] whitespace-nowrap">
                    {p.agente.nombre} {p.agente.apellido}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <VisibilitySwitch checked={p.activa} disabled={!p.canEdit} onChange={next => togglePublicacion(p, next)} />
                      <StatusBadge active={p.activa} />
                      {p.destacada && <span className="rounded-full border border-gold/[0.22] bg-gold/[0.08] px-2 py-1 text-[10px] font-black text-gold">Destacada</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => downloadPdf(p)}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-bold text-white/[0.58] transition-colors hover:border-gold/[0.24] hover:text-gold"
                    >
                      Exportar PDF
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/propiedades/${p.id}`)}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-bold text-white/[0.58] transition-colors hover:border-gold/[0.24] hover:text-gold"
                      >
                        Ver
                      </button>
                      {p.canEdit && (
                        <button
                          onClick={() => navigate(`/admin/propiedades/${p.id}?edit=1`)}
                          className="rounded-xl border border-gold/[0.20] bg-gold/[0.08] px-3 py-2 text-[11px] font-bold text-gold transition-colors hover:bg-gold/[0.14]"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-white/[0.08] px-3 py-2 text-[12px] font-bold text-white/[0.50] transition-colors hover:text-white disabled:opacity-35">
                Anterior
              </button>
              <span className="text-[12px] text-white/[0.38]">Pagina {page} de {data.totalPages}</span>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-white/[0.08] px-3 py-2 text-[12px] font-bold text-white/[0.50] transition-colors hover:text-white disabled:opacity-35">
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
