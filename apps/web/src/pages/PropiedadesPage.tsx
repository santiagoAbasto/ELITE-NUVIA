import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { api } from '../lib/api'
import { PropertyCard } from '../components/home/PropertyCard'
import { PageHeader } from '../components/ui/PageHeader'
import type { PropiedadPublica, TipoOperacion, TipoInmueble } from '@elite/types'

const TABS: { value: TipoOperacion | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'VENTA', label: 'En Venta' },
  { value: 'ALQUILER', label: 'En Alquiler' },
  { value: 'ANTICRETICO', label: 'Anticretico' },
]

const TIPOS: { value: TipoInmueble | ''; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'CASA', label: 'Casa' },
  { value: 'DEPARTAMENTO', label: 'Departamento' },
  { value: 'GARZONIER', label: 'Garzonier' },
  { value: 'TERRENO', label: 'Terreno' },
  { value: 'LOCAL', label: 'Local comercial' },
]

const CIUDADES = ['', 'Cochabamba', 'Santa Cruz', 'La Paz', 'Oruro']

const selectCls =
  'bg-white/[0.06] border border-white/10 rounded-lg px-3.5 py-2 text-[12.5px] text-white focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer transition-all w-full'

export default function PropiedadesPage() {
  const [params, setParams] = useSearchParams()

  const tipo = (params.get('tipo') ?? '') as TipoOperacion | ''
  const tipoInmueble = (params.get('tipoInmueble') ?? '') as TipoInmueble | ''
  const ciudad = params.get('ciudad') ?? ''
  const page = Number(params.get('page') ?? '1')

  const [propiedades, setPropiedades] = useState<PropiedadPublica[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    api.propiedades
      .list({
        tipo: tipo || undefined,
        tipoInmueble: tipoInmueble || undefined,
        ciudad: ciudad || undefined,
        page,
        pageSize: 12,
      })
      .then(r => {
        setPropiedades(r.data)
        setTotal(r.total)
        setTotalPages(r.totalPages)
      })
      .finally(() => setLoading(false))
  }, [tipo, tipoInmueble, ciudad, page])

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  function goPage(p: number) {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  const tipoLabel = TABS.find(t => t.value === tipo)?.label ?? 'Todos'
  const headerTitle = tipo ? (
    <>
      Propiedades en{' '}
      <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
        {tipoLabel}
      </em>
    </>
  ) : (
    <>
      Todas las{' '}
      <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
        Propiedades
      </em>
    </>
  )

  const metaText = loading
    ? 'Buscando...'
    : `${total} inmueble${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}${ciudad ? ` en ${ciudad}` : ''}`

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Page header */}
      <PageHeader eyebrow="Inmuebles" title={headerTitle} meta={metaText} />

      {/* Sticky filter bar */}
      <div
        className="sticky z-40 border-b"
        style={{
          top: '68px',
          background: 'rgba(8,14,9,0.92)',
          backdropFilter: 'blur(16px)',
          borderColor: 'rgba(201,168,76,0.08)',
        }}
      >
        <div className="wrap py-3">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Tabs tipo con LayoutGroup + pill animado */}
            <LayoutGroup>
              <div className="flex gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 flex-shrink-0">
                {TABS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setFilter('tipo', t.value)}
                    className="relative px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    style={{
                      color: tipo === t.value ? '#0A2416' : 'rgba(255,255,255,0.45)',
                      zIndex: 1,
                    }}
                  >
                    {tipo === t.value && (
                      <motion.div
                        layoutId="tipo-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: '#C9A84C' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>

            <div className="flex gap-2 flex-1">
              {/* Ciudad */}
              <div className="relative flex-1">
                <select
                  value={ciudad}
                  onChange={e => setFilter('ciudad', e.target.value)}
                  className={selectCls}
                >
                  {CIUDADES.map(c => (
                    <option key={c} value={c} style={{ background: '#0d1a10' }}>
                      {c || 'Todas las ciudades'}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gold/60 text-[10px]">
                  ▾
                </div>
              </div>

              {/* Tipo inmueble */}
              <div className="relative flex-1">
                <select
                  value={tipoInmueble}
                  onChange={e => setFilter('tipoInmueble', e.target.value)}
                  className={selectCls}
                >
                  {TIPOS.map(t => (
                    <option key={t.value} value={t.value} style={{ background: '#0d1a10' }}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gold/60 text-[10px]">
                  ▾
                </div>
              </div>

              {(tipo || tipoInmueble || ciudad) && (
                <button
                  onClick={() => setParams(new URLSearchParams())}
                  className="px-3 py-2 text-white/35 text-[12px] hover:text-white/60 transition-colors border border-white/[0.06] rounded-lg flex-shrink-0"
                  title="Limpiar filtros"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="wrap pb-24" style={{ paddingTop: '40px' }}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-[420px] rounded-[16px]"
                style={{ background: 'rgba(255,255,255,0.03)' }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        ) : propiedades.length === 0 ? (
          <div className="text-center py-28">
            <div
              className="w-16 h-16 rounded-2xl border border-white/[0.08] flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h2 className="text-white font-bold text-[22px] mb-2">Sin resultados</h2>
            <p className="text-white/40 text-[14px] mb-6 max-w-xs mx-auto">
              No encontramos propiedades con esos filtros. Intenta con otros criterios.
            </p>
            <button
              onClick={() => setParams(new URLSearchParams())}
              className="inline-flex items-center gap-2 border border-gold/30 text-gold px-6 py-3 rounded-xl text-[13px] font-semibold hover:bg-gold/[0.08] transition-colors"
            >
              Ver todas las propiedades →
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tipo}-${tipoInmueble}-${ciudad}-${page}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]"
            >
              {propiedades.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PropertyCard propiedad={p} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-14 flex-wrap">
            {page > 1 && (
              <button
                onClick={() => goPage(page - 1)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 text-[13px] hover:bg-white/[0.05] transition-colors"
              >
                ← Anterior
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => goPage(p)}
                className="w-10 h-10 rounded-lg text-[13px] font-semibold transition-all"
                style={{
                  background: p === page ? '#C9A84C' : 'rgba(255,255,255,0.05)',
                  color: p === page ? '#0A2416' : 'rgba(255,255,255,0.45)',
                }}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button
                onClick={() => goPage(page + 1)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/50 text-[13px] hover:bg-white/[0.05] transition-colors"
              >
                Siguiente →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
