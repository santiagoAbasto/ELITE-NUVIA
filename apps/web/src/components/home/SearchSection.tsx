import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPanel } from './MapPanel'

const TABS = ['VENTA', 'ALQUILER', 'ANTICRETICO'] as const
type Tab = typeof TABS[number]

const CIUDADES = ['Cochabamba', 'Santa Cruz', 'La Paz', 'Oruro']
const TIPOS_INMUEBLE = ['CASA', 'DEPARTAMENTO', 'GARZONIER', 'TERRENO', 'LOCAL']
const TIPO_LABELS: Record<string, string> = {
  CASA: 'Casa',
  DEPARTAMENTO: 'Departamento',
  GARZONIER: 'Garzonier',
  TERRENO: 'Terreno',
  LOCAL: 'Local comercial',
}

export function SearchSection() {
  const [activeTab, setActiveTab] = useState<Tab>('VENTA')
  const [ciudad, setCiudad] = useState('')
  const [tipoInmueble, setTipoInmueble] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [dormitorios, setDormitorios] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [garage, setGarage] = useState(false)
  const [amueblado, setAmueblado] = useState(false)
  const [piscina, setPiscina] = useState(false)
  const navigate = useNavigate()

  function handleSearch() {
    const params = new URLSearchParams()
    params.set('tipo', activeTab)
    if (ciudad) params.set('ciudad', ciudad)
    if (tipoInmueble) params.set('tipoInmueble', tipoInmueble)
    if (precioMax) params.set('precioMax', precioMax)
    if (dormitorios) params.set('dormitorios', dormitorios)
    if (garage) params.set('garage', 'true')
    if (amueblado) params.set('amueblado', 'true')
    if (piscina) params.set('piscina', 'true')
    navigate(`/propiedades?${params.toString()}`)
  }

  const selectCls =
    'w-full bg-white border border-[#e8e3d8] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111810] focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none'

  return (
    <section className="relative z-10" style={{ marginTop: '-48px' }}>
      <div className="wrap">
        <motion.div
          className="bg-white rounded-[20px] overflow-hidden"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.13)' }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Tabs */}
          <LayoutGroup>
            <div className="flex border-b border-[#f0ede4]">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative flex-1 py-4 text-[12.5px] font-semibold tracking-wider uppercase transition-colors"
                  style={{ color: activeTab === tab ? '#0D3B27' : '#8a9080' }}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </LayoutGroup>

          <div className="p-6">
            {/* Filtros principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="relative">
                <select
                  value={ciudad}
                  onChange={e => setCiudad(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Ciudad</option>
                  {CIUDADES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9080] text-xs">
                  ▾
                </div>
              </div>

              <div className="relative">
                <select
                  value={tipoInmueble}
                  onChange={e => setTipoInmueble(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Tipo de inmueble</option>
                  {TIPOS_INMUEBLE.map(t => (
                    <option key={t} value={t}>
                      {TIPO_LABELS[t]}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9080] text-xs">
                  ▾
                </div>
              </div>

              <div className="relative">
                <select
                  value={dormitorios}
                  onChange={e => setDormitorios(e.target.value)}
                  className={selectCls}
                >
                  <option value="">Dormitorios</option>
                  {['1', '2', '3', '4'].map(n => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9080] text-xs">
                  ▾
                </div>
              </div>

              <input
                type="number"
                placeholder="Precio máximo (Bs.)"
                value={precioMax}
                onChange={e => setPrecioMax(e.target.value)}
                className={selectCls}
              />
            </div>

            {/* Toggle más filtros */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-[12px] text-[#0D3B27] font-semibold mb-3 flex items-center gap-1.5 hover:text-gold transition-colors"
            >
              <motion.span
                animate={{ rotate: showMore ? 180 : 0 }}
                className="inline-block"
              >
                ▾
              </motion.span>
              {showMore ? 'Menos filtros' : 'Más filtros'}
            </button>

            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-5 mb-4 pb-4 border-b border-[#f0ede4]">
                    {[
                      { label: 'Garage', value: garage, set: setGarage },
                      { label: 'Amueblado', value: amueblado, set: setAmueblado },
                      { label: 'Piscina', value: piscina, set: setPiscina },
                    ].map(f => (
                      <label
                        key={f.label}
                        className="flex items-center gap-2 cursor-pointer select-none"
                      >
                        <div
                          onClick={() => f.set(!f.value)}
                          className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                          style={{
                            borderColor: f.value ? '#0D3B27' : '#ccc',
                            background: f.value ? '#0D3B27' : 'transparent',
                          }}
                        >
                          {f.value && <div className="w-2 h-2 rounded-sm bg-gold" />}
                        </div>
                        <span className="text-[13px] text-[#4a5240]">{f.label}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mapa + Botón */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-4 items-end">
              <MapPanel ciudad={ciudad} />
              <button
                onClick={handleSearch}
                className="h-[52px] rounded-xl font-bold text-[13px] transition-colors"
                style={{ background: '#0D3B27', color: '#C9A84C' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1a5c3a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0D3B27')}
              >
                Buscar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
