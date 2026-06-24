import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../shared/adminApi'
import HeroEditor from './sections/HeroEditor'
import ServiciosEditor from './sections/ServiciosEditor'
import NosotrosEditor from './sections/NosotrosEditor'
import ContactoEditor from './sections/ContactoEditor'
import FooterEditor from './sections/FooterEditor'

type SectionEditor = React.ComponentType<{ datos: unknown; onChange: (d: unknown) => void }>

const SECCIONES: Record<string, { label: string; component: SectionEditor }> = {
  home: { label: 'Inicio — Hero', component: HeroEditor as unknown as SectionEditor },
  servicios: { label: 'Servicios', component: ServiciosEditor as unknown as SectionEditor },
  nosotros: { label: 'Nosotros', component: NosotrosEditor as unknown as SectionEditor },
  contacto: { label: 'Contacto', component: ContactoEditor as unknown as SectionEditor },
  footer: { label: 'Footer', component: FooterEditor as unknown as SectionEditor },
}

interface SiteContentResponse { seccion: string; datos: Record<string, unknown> }

export default function CmsShell() {
  const { seccion = 'home' } = useParams<{ seccion: string }>()
  const navigate = useNavigate()
  const [datos, setDatos] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setLoading(true)
    setDirty(false)
    adminApi.get<SiteContentResponse>(`/cms/${seccion}`)
      .then(res => setDatos(res.datos ?? {}))
      .catch(() => setDatos({}))
      .finally(() => setLoading(false))
  }, [seccion])

  const handleChange = (newDatos: Record<string, unknown>) => {
    setDatos(newDatos)
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.put(`/cms/${seccion}`, datos)
      toast.success('Sección guardada correctamente')
      setDirty(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const config = SECCIONES[seccion]
  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-zinc-500">Sección no encontrada: <code className="text-amber-400">{seccion}</code></p>
        <button onClick={() => navigate('/admin/cms/home')} className="text-sm text-zinc-400 hover:text-white underline">
          Ir al Hero
        </button>
      </div>
    )
  }

  const EditorComponent = config.component

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">Editor de contenido</p>
          <h1 className="text-xl font-semibold text-white">{config.label}</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
          >
            Vista previa
          </a>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg transition-colors"
          >
            {saving ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Sin cambios'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <EditorComponent datos={datos as unknown} onChange={handleChange as (d: unknown) => void} />
        )}
      </div>

      {dirty && (
        <p className="text-xs text-amber-400/70 text-right">Hay cambios sin guardar</p>
      )}
    </div>
  )
}
