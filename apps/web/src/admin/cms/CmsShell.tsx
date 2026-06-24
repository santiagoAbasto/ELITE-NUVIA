import { type ComponentType, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../shared/adminApi'
import { CMS_SECTION_META, DEFAULT_CMS_DATA, type CmsSectionMeta, withCmsDefaults } from '../../lib/cmsDefaults'
import AgentesEditor from './sections/AgentesEditor'
import ContactoEditor from './sections/ContactoEditor'
import FooterEditor from './sections/FooterEditor'
import HeroEditor from './sections/HeroEditor'
import NosotrosEditor from './sections/NosotrosEditor'
import PropiedadesEditor from './sections/PropiedadesEditor'
import ServiciosEditor from './sections/ServiciosEditor'

type SectionEditor = ComponentType<{ datos: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }>
type PreviewMode = 'desktop' | 'mobile'

interface SectionConfig extends CmsSectionMeta {
  component: SectionEditor
}

interface SiteContentResponse {
  seccion: string
  datos: Record<string, unknown>
}

const SECCIONES: Record<string, SectionConfig> = {
  home: { ...CMS_SECTION_META.home, component: HeroEditor as unknown as SectionEditor },
  propiedades: { ...CMS_SECTION_META.propiedades, component: PropiedadesEditor as unknown as SectionEditor },
  agentes: { ...CMS_SECTION_META.agentes, component: AgentesEditor as unknown as SectionEditor },
  servicios: { ...CMS_SECTION_META.servicios, component: ServiciosEditor as unknown as SectionEditor },
  nosotros: { ...CMS_SECTION_META.nosotros, component: NosotrosEditor as unknown as SectionEditor },
  contacto: { ...CMS_SECTION_META.contacto, component: ContactoEditor as unknown as SectionEditor },
  footer: { ...CMS_SECTION_META.footer, component: FooterEditor as unknown as SectionEditor },
}

function previewUrl(path: string, revision: number) {
  const [base, hash] = path.split('#')
  const separator = base.includes('?') ? '&' : '?'
  return `${base}${separator}adminPreview=${revision}${hash ? `#${hash}` : ''}`
}

function EditorSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-36 rounded-full bg-white/[0.06]" />
          <div className="h-11 rounded-xl bg-white/[0.045]" />
        </div>
      ))}
    </div>
  )
}

export default function CmsShell() {
  const { seccion = 'home' } = useParams<{ seccion: string }>()
  const navigate = useNavigate()
  const [datos, setDatos] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [previewRevision, setPreviewRevision] = useState(0)

  const config = SECCIONES[seccion]
  const previewSrc = useMemo(
    () => previewUrl(config?.publicPath ?? '/', previewRevision),
    [config?.publicPath, previewRevision],
  )

  useEffect(() => {
    let active = true

    if (!SECCIONES[seccion]) {
      setDatos({})
      setLoading(false)
      setDirty(false)
      return () => { active = false }
    }

    setLoading(true)
    setDirty(false)
    adminApi.get<SiteContentResponse>(`/cms/${seccion}`)
      .then(res => {
        if (active) setDatos(withCmsDefaults(seccion, res.datos ?? {}))
      })
      .catch(() => {
        if (active) setDatos(withCmsDefaults(seccion, {}))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
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
      setPreviewRevision(r => r + 1)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const restorePublicDefaults = () => {
    setDatos(DEFAULT_CMS_DATA[seccion] ?? {})
    setDirty(true)
    toast.success('Contenido público recuperado')
  }

  if (!config) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="max-w-md rounded-3xl border border-gold/[0.14] bg-white/[0.035] p-8 text-center">
          <p className="text-sm text-white/[0.52]">Sección no encontrada</p>
          <code className="mt-2 block text-gold">{seccion}</code>
          <button
            type="button"
            onClick={() => navigate('/admin/cms/home')}
            className="mt-5 rounded-xl bg-gold px-4 py-2 text-sm font-bold text-green-deep hover:bg-gold-light"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  const EditorComponent = config.component

  return (
    <div className="mx-auto max-w-[1680px] space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-gold/[0.14] bg-[#0b130d]/[0.88] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
        <div className="border-b border-gold/[0.10] p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                  Editor de contenido
                </span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${dirty ? 'bg-gold/[0.12] text-gold' : 'bg-emerald-400/[0.10] text-emerald-300'}`}>
                  {dirty ? 'Cambios pendientes' : 'Sin cambios'}
                </span>
              </div>
              <h2 className="mt-3 text-[30px] font-black tracking-[-0.035em] text-white md:text-[38px]">
                {config.label}
              </h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/[0.50]">
                {config.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={restorePublicDefaults}
                className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white/[0.62] transition-colors hover:border-gold/[0.24] hover:text-gold"
              >
                Recuperar público
              </button>
              <a
                href={config.publicPath}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-sm font-semibold text-white/[0.62] transition-colors hover:border-gold/[0.24] hover:text-gold"
              >
                Abrir sitio
              </a>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="rounded-xl bg-gold px-5 py-2.5 text-sm font-black text-green-deep transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Sin cambios'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {Object.entries(CMS_SECTION_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(`/admin/cms/${key}`)}
                className={`flex-shrink-0 rounded-xl border px-3 py-2 text-left transition-colors ${
                  key === seccion
                    ? 'border-gold/[0.26] bg-gold/[0.12] text-gold'
                    : 'border-white/[0.08] bg-white/[0.025] text-white/[0.48] hover:border-white/[0.16] hover:text-white'
                }`}
              >
                <span className="block text-[12px] font-bold">{meta.shortLabel}</span>
                <span className="mt-0.5 block text-[10px] text-current opacity-60">{meta.publicLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.78fr)]">
        <section className="overflow-hidden rounded-[28px] border border-gold/[0.12] bg-[#0b130d]/[0.82] shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3 border-b border-gold/[0.10] px-5 py-4">
            <div>
              <p className="text-[12px] font-semibold text-white/[0.52]">Campos editables</p>
              <p className="mt-0.5 text-[11px] text-white/[0.32]">La API guarda JSON por sección.</p>
            </div>
            {dirty && (
              <span className="rounded-full bg-gold/[0.10] px-3 py-1 text-[11px] font-semibold text-gold">
                Guarda para publicar
              </span>
            )}
          </div>
          <div className="p-5 md:p-6">
            {loading ? (
              <EditorSkeleton />
            ) : (
              <EditorComponent datos={datos} onChange={handleChange} />
            )}
          </div>
        </section>

        <aside className="xl:sticky xl:top-0 xl:self-start">
          <section className="overflow-hidden rounded-[28px] border border-gold/[0.14] bg-[#07100b] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-3 border-b border-gold/[0.10] px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[12px] font-semibold text-white">Preview público</p>
                <p className="mt-0.5 text-[11px] text-white/[0.38]">{config.publicLabel}: {config.publicPath}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.035] p-1">
                  {(['desktop', 'mobile'] as PreviewMode[]).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreviewMode(mode)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors ${
                        previewMode === mode ? 'bg-gold text-green-deep' : 'text-white/[0.48] hover:text-white'
                      }`}
                    >
                      {mode === 'desktop' ? 'Desktop' : 'Mobile'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewRevision(r => r + 1)}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/[0.52] transition-colors hover:border-gold/[0.24] hover:text-gold"
                  aria-label="Recargar preview"
                  title="Recargar preview"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 11-2.64-6.36" />
                    <path d="M21 3v6h-6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-[#050805] p-3 md:p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/[0.72]" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold/[0.72]" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/[0.72]" />
                <div className="ml-2 min-w-0 flex-1 rounded-full border border-white/[0.06] bg-white/[0.035] px-3 py-1 text-[11px] text-white/[0.34]">
                  {previewSrc}
                </div>
              </div>
              <div className={`${previewMode === 'mobile' ? 'mx-auto max-w-[390px]' : 'w-full'} overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080e09]`}>
                <iframe
                  key={previewSrc}
                  title={`Preview ${config.label}`}
                  src={previewSrc}
                  className="h-[620px] w-full bg-[#080e09]"
                />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
