import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { PropertyCard } from '../components/home/PropertyCard'
import type { PropiedadPublica, TipoOperacion, TipoInmueble } from '@elite/types'

const TABS: { value: TipoOperacion | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'VENTA', label: 'Venta' },
  { value: 'ALQUILER', label: 'Alquiler' },
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

const selectCls = 'bg-white/06 border border-white/10 rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none w-full'

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
    api.propiedades.list({
      tipo: tipo || undefined,
      tipoInmueble: tipoInmueble || undefined,
      ciudad: ciudad || undefined,
      page,
      pageSize: 12,
    }).then(r => {
      setPropiedades(r.data)
      setTotal(r.total)
      setTotalPages(r.totalPages)
    }).finally(() => setLoading(false))
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Header */}
      <div className="pt-28 pb-10" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="wrap">
          <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-3">Inmuebles</div>
          <h1 className="text-[40px] font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            Propiedades
          </h1>
          <p className="text-white/45 text-[14px]">{total} inmuebles disponibles</p>
        </div>
      </div>

      <div className="wrap pb-24">
        {/* Tabs tipo operación */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setFilter('tipo', t.value)}
              className="px-5 py-2 rounded-full text-[12.5px] font-semibold transition-all"
              style={{
                background: tipo === t.value ? '#C9A84C' : 'rgba(255,255,255,0.06)',
                color: tipo === t.value ? '#0A2416' : 'rgba(255,255,255,0.6)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtros secundarios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="relative">
            <select value={ciudad} onChange={e => setFilter('ciudad', e.target.value)} className={selectCls}>
              {CIUDADES.map(c => <option key={c} value={c} style={{ background: '#0d1a10' }}>{c || 'Todas las ciudades'}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold text-xs">▾</div>
          </div>

          <div className="relative">
            <select value={tipoInmueble} onChange={e => setFilter('tipoInmueble', e.target.value)} className={selectCls}>
              {TIPOS.map(t => <option key={t.value} value={t.value} style={{ background: '#0d1a10' }}>{t.label}</option>)}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gold text-xs">▾</div>
          </div>

          <button
            onClick={() => { setParams(new URLSearchParams()) }}
            className="text-white/40 text-[12px] hover:text-white/70 transition-colors text-left px-3"
          >
            ✕ Limpiar filtros
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-[16px] bg-white/04 animate-pulse" />
            ))}
          </div>
        ) : propiedades.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-white/20 text-6xl mb-4">🏠</div>
            <div className="text-white/50 text-lg">No se encontraron propiedades con estos filtros.</div>
            <button onClick={() => setParams(new URLSearchParams())} className="mt-4 text-gold text-[13px] underline">
              Ver todas las propiedades
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${tipo}-${tipoInmueble}-${ciudad}-${page}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]"
            >
              {propiedades.map(p => (
                <PropertyCard key={p.id} propiedad={p} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => goPage(p)}
                className="w-9 h-9 rounded-lg text-[13px] font-semibold transition-all"
                style={{
                  background: p === page ? '#C9A84C' : 'rgba(255,255,255,0.06)',
                  color: p === page ? '#0A2416' : 'rgba(255,255,255,0.5)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
