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

const TIPOS = ['VENTA', 'ALQUILER', 'ANTICRETICO']
const TIPOS_INMUEBLE = ['CASA', 'DEPARTAMENTO', 'GARZONIER', 'TERRENO', 'LOCAL', 'OTRO']
const editInputClass = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-amber-500'
const editLabelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500'

interface EditFormState {
  titulo: string; descripcion: string; tipo: string; tipoInmueble: string
  precio: string; moneda: string; ciudad: string; zona: string; direccion: string
  dormitorios: string; banos: string; superficieM2: string
  garage: boolean; amueblado: boolean; piscina: boolean; destacada: boolean
}

function toEditForm(p: PropiedadDetail): EditFormState {
  return {
    titulo: p.titulo, descripcion: p.descripcion, tipo: p.tipo, tipoInmueble: p.tipoInmueble,
    precio: String(p.precio), moneda: p.moneda, ciudad: p.ciudad, zona: p.zona ?? '', direccion: p.direccion ?? '',
    dormitorios: p.dormitorios != null ? String(p.dormitorios) : '',
    banos: p.banos != null ? String(p.banos) : '',
    superficieM2: p.superficieM2 != null ? String(p.superficieM2) : '',
    garage: p.garage, amueblado: p.amueblado, piscina: p.piscina, destacada: p.destacada,
  }
}

export default function PropiedadDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [propiedad, setPropiedad] = useState<PropiedadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'leads' | 'agenda'>('info')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EditFormState | null>(null)

  useEffect(() => {
    if (!id) return
    adminApi.get<PropiedadDetail>(`/admin/propiedades/${id}`)
      .then(p => {
        setPropiedad(p)
        if (searchParams.get('edit') === '1' && p.canEdit) {
          setForm(toEditForm(p))
          setEditing(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const startEdit = () => {
    if (!propiedad) return
    setForm(toEditForm(propiedad))
    setEditing(true)
    setSearchParams({ edit: '1' }, { replace: true })
  }

  const cancelEdit = () => {
    setEditing(false)
    setForm(null)
    setSearchParams({}, { replace: true })
  }

  const setField = <K extends keyof EditFormState>(key: K, value: EditFormState[K]) =>
    setForm(f => f ? { ...f, [key]: value } : f)

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!propiedad || !form) return

    if (!form.titulo.trim() || !form.ciudad.trim()) {
      toast.error('Titulo y ciudad son obligatorios')
      return
    }
    const precioNum = Number(form.precio)
    if (!form.precio || Number.isNaN(precioNum) || precioNum <= 0) {
      toast.error('Ingresa un precio valido')
      return
    }

    setSaving(true)
    try {
      const updated = await adminApi.put<PropiedadDetail>(`/admin/propiedades/${propiedad.id}`, {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        tipo: form.tipo,
        tipoInmueble: form.tipoInmueble,
        precio: precioNum,
        moneda: form.moneda,
        ciudad: form.ciudad.trim(),
        zona: form.zona.trim() || null,
        direccion: form.direccion.trim() || null,
        dormitorios: form.dormitorios ? Number(form.dormitorios) : null,
        banos: form.banos ? Number(form.banos) : null,
        superficieM2: form.superficieM2 ? Number(form.superficieM2) : null,
        garage: form.garage,
        amueblado: form.amueblado,
        piscina: form.piscina,
        destacada: form.destacada,
      })
      setPropiedad(p => p ? { ...p, ...updated } : updated)
      toast.success('Propiedad actualizada')
      cancelEdit()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar la propiedad')
    } finally {
      setSaving(false)
    }
  }

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

  const toggleWeb = async () => {
    if (!propiedad) return
    try {
      const updated = await adminApi.patch<{ activa: boolean; destacada: boolean; canEdit: boolean }>(
        `/admin/propiedades/${propiedad.id}/publicacion`,
        { activa: !propiedad.activa },
      )
      setPropiedad(p => p ? { ...p, activa: updated.activa, destacada: updated.destacada, canEdit: updated.canEdit } : p)
      toast.success(updated.activa ? 'Propiedad visible en web' : 'Propiedad oculta de la web')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar la publicacion')
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
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${propiedad.activa ? 'bg-emerald-500/10 text-emerald-300' : 'bg-zinc-700/50 text-zinc-400'}`}>
              {propiedad.activa ? 'Visible en web' : 'Solo CRM'}
            </span>
            {propiedad.destacada && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">Destacada</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {propiedad.canEdit && (
            <button
              onClick={toggleWeb}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${propiedad.activa ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'}`}
            >
              {propiedad.activa ? 'Ocultar de web' : 'Mostrar en web'}
            </button>
          )}
          <button
            onClick={downloadPdf}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generar PDF
          </button>
          {propiedad.canEdit && !editing && (
            <button
              onClick={startEdit}
              className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors"
            >
              Editar
            </button>
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

      {activeTab === 'info' && editing && form && (
        <form onSubmit={saveEdit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={editLabelClass}>Titulo</label>
              <input value={form.titulo} onChange={e => setField('titulo', e.target.value)} required className={editInputClass} />
            </div>
            <div>
              <label className={editLabelClass}>Operacion</label>
              <select value={form.tipo} onChange={e => setField('tipo', e.target.value)} className={editInputClass}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={editLabelClass}>Tipo de inmueble</label>
              <select value={form.tipoInmueble} onChange={e => setField('tipoInmueble', e.target.value)} className={editInputClass}>
                {TIPOS_INMUEBLE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={editLabelClass}>Precio</label>
              <input value={form.precio} onChange={e => setField('precio', e.target.value)} required inputMode="decimal" className={editInputClass} />
            </div>
            <div>
              <label className={editLabelClass}>Moneda</label>
              <select value={form.moneda} onChange={e => setField('moneda', e.target.value)} className={editInputClass}>
                <option value="BOB">BOB</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className={editLabelClass}>Ciudad</label>
              <input value={form.ciudad} onChange={e => setField('ciudad', e.target.value)} required className={editInputClass} />
            </div>
            <div>
              <label className={editLabelClass}>Zona</label>
              <input value={form.zona} onChange={e => setField('zona', e.target.value)} className={editInputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={editLabelClass}>Direccion interna</label>
              <input value={form.direccion} onChange={e => setField('direccion', e.target.value)} className={editInputClass} />
            </div>
            <div>
              <label className={editLabelClass}>Dormitorios</label>
              <input value={form.dormitorios} onChange={e => setField('dormitorios', e.target.value)} inputMode="numeric" className={editInputClass} />
            </div>
            <div>
              <label className={editLabelClass}>Banos</label>
              <input value={form.banos} onChange={e => setField('banos', e.target.value)} inputMode="numeric" className={editInputClass} />
            </div>
            <div>
              <label className={editLabelClass}>Superficie m2</label>
              <input value={form.superficieM2} onChange={e => setField('superficieM2', e.target.value)} inputMode="decimal" className={editInputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={editLabelClass}>Descripcion</label>
              <textarea value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} rows={5} className={`${editInputClass} resize-none`} />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {([
              ['garage', 'Garage'],
              ['amueblado', 'Amueblado'],
              ['piscina', 'Piscina'],
              ['destacada', 'Destacada'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={form[key]} onChange={e => setField(key, e.target.checked)} className="h-4 w-4 rounded border-zinc-700 bg-zinc-800" />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-55">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={cancelEdit} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-700">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {activeTab === 'info' && !editing && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Descripción</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{propiedad.descripcion}</p>
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
