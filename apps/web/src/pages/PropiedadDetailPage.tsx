import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { formatPrice, badgeConfig, whatsappUrl } from '../lib/utils'
import type { PropiedadPublica } from '@elite/types'

export default function PropiedadDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [propiedad, setPropiedad] = useState<PropiedadPublica | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.propiedades.bySlug(slug)
      .then(setPropiedad)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080e09' }}>
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  )

  if (notFound || !propiedad) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080e09' }}>
      <div className="text-white/20 text-6xl">🏠</div>
      <h1 className="text-white text-2xl font-bold">Propiedad no encontrada</h1>
      <Link to="/propiedades" className="text-gold text-[13px] underline">Ver todas las propiedades</Link>
    </div>
  )

  const badge = badgeConfig(propiedad.tipo)
  const waMsg = `Hola ${propiedad.agente.nombre}, me interesa la propiedad: ${propiedad.titulo} (${window.location.href})`

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      <div className="pt-24">
        {/* Breadcrumb */}
        <div className="wrap py-4">
          <div className="flex items-center gap-2 text-[12px] text-white/30">
            <Link to="/" className="hover:text-white/60 transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/propiedades" className="hover:text-white/60 transition-colors">Propiedades</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-[200px]">{propiedad.titulo}</span>
          </div>
        </div>

        {/* Galería */}
        <div className="wrap mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
            {/* Foto principal */}
            <div className="relative rounded-[16px] overflow-hidden h-[340px] md:h-[440px] bg-[#0d1a10]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={propiedad.fotos[activeImg]?.url ?? '/placeholder.jpg'}
                  alt={propiedad.titulo}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${badge.className}`}>
                  {badge.label.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Miniaturas verticales */}
            {propiedad.fotos.length > 1 && (
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[440px]">
                {propiedad.fotos.map((foto, i) => (
                  <button
                    key={foto.id}
                    onClick={() => setActiveImg(i)}
                    className="flex-shrink-0 w-24 lg:w-full h-20 rounded-xl overflow-hidden transition-all"
                    style={{ opacity: activeImg === i ? 1 : 0.5, outline: activeImg === i ? '2px solid #C9A84C' : 'none' }}
                  >
                    <img src={foto.urlThumb} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="wrap pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
            {/* Izquierda */}
            <div>
              <h1 className="text-[28px] md:text-[34px] font-bold text-white mb-3 leading-tight">
                {propiedad.titulo}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span className="text-white/50 text-[13px]">
                  {propiedad.zona ? `${propiedad.zona}, ` : ''}{propiedad.ciudad}
                </span>
                {propiedad.direccion && (
                  <span className="text-white/30 text-[12px]">· {propiedad.direccion}</span>
                )}
              </div>

              {/* Precio */}
              <div className="bg-white/04 border border-white/06 rounded-[16px] p-6 mb-8">
                <div className="text-white/40 text-[11px] font-bold tracking-[2px] uppercase mb-1">Precio</div>
                <div className="text-[36px] font-extrabold text-gold leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  {formatPrice(propiedad.precio, propiedad.moneda)}
                </div>
                <div className="text-white/30 text-[12px] mt-1">precio negociable · {propiedad.tipo}</div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                  { v: propiedad.dormitorios, l: 'Dormitorios', icon: '🛏' },
                  { v: propiedad.banos, l: 'Baños', icon: '🚿' },
                  { v: propiedad.superficieM2 ? `${propiedad.superficieM2} m²` : null, l: 'Superficie', icon: '📐' },
                  { v: propiedad.garage ? 'Incluido' : 'No', l: 'Garage', icon: '🚗' },
                ].map(f => f.v != null && (
                  <div key={f.l} className="bg-white/04 border border-white/06 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="text-white font-bold text-[15px]">{f.v}</div>
                    <div className="text-white/35 text-[11px] mt-0.5">{f.l}</div>
                  </div>
                ))}
                {propiedad.amueblado && (
                  <div className="bg-gold/08 border border-gold/20 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">🛋</div>
                    <div className="text-gold font-bold text-[15px]">Sí</div>
                    <div className="text-white/35 text-[11px] mt-0.5">Amueblado</div>
                  </div>
                )}
                {propiedad.piscina && (
                  <div className="bg-gold/08 border border-gold/20 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-1">🏊</div>
                    <div className="text-gold font-bold text-[15px]">Sí</div>
                    <div className="text-white/35 text-[11px] mt-0.5">Piscina</div>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-4">Descripción</div>
                <p className="text-white/65 text-[14px] leading-[1.8]">{propiedad.descripcion}</p>
              </div>
            </div>

            {/* Sidebar agente */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="bg-[#0d1a10] border border-white/08 rounded-[18px] p-6">
                <div className="text-white/30 text-[10px] font-bold tracking-[2px] uppercase mb-5">Tu asesor</div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-14 h-14 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center text-gold text-lg font-bold flex-shrink-0">
                    {propiedad.agente.nombre[0]}{propiedad.agente.apellido[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-[15px]">
                      {propiedad.agente.nombre} {propiedad.agente.apellido}
                    </div>
                    <div className="text-white/40 text-[12px]">Asesor/a Inmobiliaria</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={whatsappUrl(propiedad.agente.whatsapp, waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[13px] transition-colors"
                    style={{ background: '#25D366', color: '#fff' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Consultar por WhatsApp
                  </a>
                  <a
                    href={`tel:${propiedad.agente.telefono}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-[13px] border border-white/12 text-white/70 hover:bg-white/05 transition-colors"
                  >
                    📞 {propiedad.agente.telefono}
                  </a>
                  <Link
                    to={`/agentes/${propiedad.agente.slug}`}
                    className="block text-center text-gold text-[12px] font-semibold mt-2 hover:text-gold-light transition-colors"
                  >
                    Ver perfil del agente →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
