import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'

interface Foto { id: string; url: string; urlThumb: string; orden: number }
interface Lead { id: string; nombre: string; telefono: string; estado: string; createdAt: string }
interface Evento { id: string; titulo: string; tipo: string; inicio: string }
interface PropiedadDetail {
  id: string; slug: string; titulo: string; descripcion: string
  tipo: string; tipoInmueble: string; precio: number; moneda: string
  ciudad: string; zona: string | null; direccion: string | null
  dormitorios: number | null; banos: number | null; superficieM2: number | null
  garage: boolean; amueblado: boolean; piscina: boolean
  destacada: boolean; activa: boolean; canEdit: boolean
  fotos: Foto[]
  agente: { id: string; nombre: string; apellido: string; primerApellido?: string; telefono: string; email: string; foto: string | null }
  leads: Lead[]
  eventos: Evento[]
}

export default function PropiedadDetail() {
  const { id } = useParams<{ id: string }>()
  useSearchParams()
  const [propiedad, setPropiedad] = useState<PropiedadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'leads' | 'agenda'>('info')

  useEffect(() => {
    if (!id) return
    adminApi.get<PropiedadDetail>(`/admin/propiedades/${id}`)
      .then(setPropiedad).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const downloadPdf = async () => {
    if (!propiedad) return
    toast.loading('Generando PDF...', { id: 'pdf' })
    try {
      const res = await fetch(`/api/v1/admin/pdf/${propiedad.id}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Error generando PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `ficha-${propiedad.slug}.pdf`; a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF descargado', { id: 'pdf' })
    } catch {
      toast.error('Error al generar PDF', { id: 'pdf' })
    }
  }

  if (loading) return <div className="flex justify-center h-40 items-center"><div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!propiedad) return <p className="text-zinc-500">Propiedad no encontrada</p>

  const tabClass = (t: typeof activeTab) =>
    `px-4 py-2 text-sm font-medium transition-colors ${activeTab === t ? 'text-white border-b-2 border-amber-500' : 'text-zinc-500 hover:text-white'}`

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{propiedad.tipo} · {propiedad.tipoInmueble}</p>
          <h1 className="text-xl font-semibold text-white">{propiedad.titulo}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{propiedad.ciudad}{propiedad.zona ? ` — ${propiedad.zona}` : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={downloadPdf}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generar PDF
          </button>
          {propiedad.canEdit && (
            <span className="px-3 py-2 bg-amber-500/10 text-amber-400 rounded-lg text-sm font-medium">
              Puedes editar
            </span>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {propiedad.fotos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {propiedad.fotos.slice(0, 8).map((f, i) => (
            <img
              key={f.id}
              src={f.url}
              alt=""
              className={`rounded-xl object-cover bg-zinc-800 ${i === 0 ? 'col-span-2 row-span-2 h-56' : 'h-24'}`}
            />
          ))}
        </div>
      )}

      {/* Price + agent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Precio</p>
          <p className="text-2xl font-bold text-white">{propiedad.moneda} {Number(propiedad.precio).toLocaleString('es-BO')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {propiedad.dormitorios != null && <span className="text-xs px-2 py-1 bg-zinc-800 rounded-lg text-zinc-400">{propiedad.dormitorios} dorm.</span>}
            {propiedad.banos != null && <span className="text-xs px-2 py-1 bg-zinc-800 rounded-lg text-zinc-400">{propiedad.banos} baños</span>}
            {propiedad.superficieM2 != null && <span className="text-xs px-2 py-1 bg-zinc-800 rounded-lg text-zinc-400">{propiedad.superficieM2} m²</span>}
            {propiedad.garage && <span className="text-xs px-2 py-1 bg-zinc-800 rounded-lg text-zinc-400">Garage</span>}
            {propiedad.amueblado && <span className="text-xs px-2 py-1 bg-zinc-800 rounded-lg text-zinc-400">Amueblado</span>}
            {propiedad.piscina && <span className="text-xs px-2 py-1 bg-zinc-800 rounded-lg text-zinc-400">Piscina</span>}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Agente responsable</p>
          <div className="flex items-center gap-3">
            {propiedad.agente.foto ? (
              <img src={propiedad.agente.foto} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                <span className="text-zinc-500 text-sm font-medium">{propiedad.agente.nombre[0]}</span>
              </div>
            )}
            <div>
              <p className="text-white font-medium">{propiedad.agente.nombre} {propiedad.agente.apellido}</p>
              <p className="text-xs text-zinc-500">{propiedad.agente.telefono}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 flex gap-0">
        {(['info', 'leads', 'agenda'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={tabClass(t)}>
            {t === 'info' ? 'Información' : t === 'leads' ? `Leads (${propiedad.leads.length})` : `Agenda (${propiedad.eventos.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Descripción</p>
          <div className="prose prose-invert prose-sm max-w-none text-zinc-300" dangerouslySetInnerHTML={{ __html: propiedad.descripcion }} />
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {propiedad.leads.length === 0 ? (
            <p className="text-zinc-500 text-sm p-5">Sin leads vinculados</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Teléfono</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Estado</th>
                <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Fecha</th>
              </tr></thead>
              <tbody className="divide-y divide-zinc-800">
                {propiedad.leads.map(l => (
                  <tr key={l.id} className="hover:bg-zinc-800/50">
                    <td className="px-4 py-3 text-white">{l.nombre}</td>
                    <td className="px-4 py-3 text-zinc-400">{l.telefono}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-300">{l.estado}</span></td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(l.createdAt).toLocaleDateString('es-BO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'agenda' && (
        <div className="space-y-2">
          {propiedad.eventos.length === 0 ? (
            <p className="text-zinc-500 text-sm">Sin eventos vinculados</p>
          ) : propiedad.eventos.map(e => (
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-white">{e.titulo}</p>
                <p className="text-xs text-zinc-500">{e.tipo} · {new Date(e.inicio).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
