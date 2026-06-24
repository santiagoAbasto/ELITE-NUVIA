import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Agente { id: string; nombre: string; apellido: string }
interface Propiedad {
  id: string; slug: string; titulo: string; precio: number; moneda: string
  ciudad: string; zona: string | null; tipo: string; tipoInmueble: string
  activa: boolean; destacada: boolean; canEdit: boolean
  agente: Agente
  fotos: { url: string; urlThumb: string }[]
}
interface PropiedadesRes { data: Propiedad[]; total: number; totalPages: number }

const TIPOS = ['VENTA', 'ALQUILER', 'ANTICRETICO']
const TIPOS_INMUEBLE = ['CASA', 'DEPARTAMENTO', 'GARZONIER', 'TERRENO', 'LOCAL', 'OTRO']

export default function PropiedadesPage() {
  useAdminAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<PropiedadesRes | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ tipo: '', tipoInmueble: '', ciudad: '', activa: '' })

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: '15' })
    if (filters.tipo) params.set('tipo', filters.tipo)
    if (filters.tipoInmueble) params.set('tipoInmueble', filters.tipoInmueble)
    if (filters.ciudad) params.set('ciudad', filters.ciudad)
    if (filters.activa) params.set('activa', filters.activa)
    adminApi.get<PropiedadesRes>(`/admin/propiedades?${params}`)
      .then(setData).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page, filters])

  const selectClass = 'bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500'

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">CRM</p>
          <h1 className="text-xl font-semibold text-white">Propiedades</h1>
        </div>
        <span className="text-sm text-zinc-500">{data?.total ?? 0} propiedades</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filters.tipo} onChange={e => setFilters(f => ({ ...f, tipo: e.target.value }))} className={selectClass}>
          <option value="">Todas las operaciones</option>
          {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.tipoInmueble} onChange={e => setFilters(f => ({ ...f, tipoInmueble: e.target.value }))} className={selectClass}>
          <option value="">Todos los tipos</option>
          {TIPOS_INMUEBLE.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.activa} onChange={e => setFilters(f => ({ ...f, activa: e.target.value }))} className={selectClass}>
          <option value="">Activas e inactivas</option>
          <option value="true">Solo activas</option>
          <option value="false">Solo inactivas</option>
        </select>
        <input
          value={filters.ciudad}
          onChange={e => setFilters(f => ({ ...f, ciudad: e.target.value }))}
          placeholder="Ciudad..."
          className={`${selectClass} w-36`}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium w-14">Foto</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">Propiedad</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">Precio</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium hidden md:table-cell">Agente</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium hidden lg:table-cell">Estado</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data?.data.map(p => (
                <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-4 py-3">
                    {p.fotos[0] ? (
                      <img src={p.fotos[0].urlThumb} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium leading-snug line-clamp-1">{p.titulo}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{p.ciudad}{p.zona ? ` — ${p.zona}` : ''} · {p.tipo} · {p.tipoInmueble}</p>
                  </td>
                  <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                    {p.moneda} {Number(p.precio).toLocaleString('es-BO')}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {p.agente.nombre} {p.agente.apellido}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${p.activa ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700/50 text-zinc-500'}`}>
                      {p.activa ? 'Activa' : 'Inactiva'}
                    </span>
                    {p.destacada && <span className="ml-1.5 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">Destacada</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/admin/propiedades/${p.id}`)}
                        className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                      >
                        Ver
                      </button>
                      {p.canEdit && (
                        <button
                          onClick={() => navigate(`/admin/propiedades/${p.id}?edit=1`)}
                          className="text-xs px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors"
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="text-xs px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg disabled:opacity-40 hover:text-white transition-colors">
                Anterior
              </button>
              <span className="text-xs text-zinc-500">Página {page} de {data.totalPages}</span>
              <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}
                className="text-xs px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg disabled:opacity-40 hover:text-white transition-colors">
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
