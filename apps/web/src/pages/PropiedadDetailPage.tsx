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
    setActiveImg(0)
    api.propiedades
      .bySlug(slug)
      .then(setPropiedad)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080e09' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <span className="text-white/30 text-[13px]">Cargando propiedad...</span>
        </div>
      </div>
    )
  }

  if (notFound || !propiedad) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: '#080e09' }}
      >
        <div
          className="w-20 h-20 rounded-2xl border border-white/[0.08] flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h1 className="text-white text-2xl font-bold">Propiedad no encontrada</h1>
        <p className="text-white/35 text-[14px]">Es posible que haya sido removida o el enlace sea incorrecto.</p>
        <Link
          to="/propiedades"
          className="inline-flex items-center gap-2 border border-gold/30 text-gold px-6 py-3 rounded-xl text-[13px] font-semibold hover:bg-gold/[0.08] transition-colors mt-2"
        >
          Ver todas las propiedades →
        </Link>
      </div>
    )
  }

  const badge = badgeConfig(propiedad.tipo)
  const waMsg = `Hola ${propiedad.agente.nombre}, me interesa la propiedad: ${propiedad.titulo} (${window.location.href})`

  const features = [
    { v: propiedad.dormitorios, l: 'Dormitorios', icon: '🛏' },
    { v: propiedad.banos, l: 'Baños', icon: '🚿' },
    {
      v: propiedad.superficieM2 ? `${propiedad.superficieM2} m²` : null,
      l: 'Superficie',
      icon: '📐',
    },
    { v: propiedad.garage ? 'Incluido' : null, l: 'Garage', icon: '🚗' },
  ].filter(f => f.v != null)

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Page header area */}
      <div
        className="relative pt-24 pb-0"
        style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}
      >
        {/* Línea dorada superior */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)',
          }}
        />

        {/* Breadcrumb */}
        <div className="wrap pt-6 pb-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 text-[12px] text-white/30"
          >
            <Link to="/" className="hover:text-white/60 transition-colors">
              Inicio
            </Link>
            <span className="text-white/15">/</span>
            <Link to="/propiedades" className="hover:text-white/60 transition-colors">
              Propiedades
            </Link>
            <span className="text-white/15">/</span>
            <span className="text-white/55 truncate max-w-[200px]">{propiedad.titulo}</span>
          </motion.div>
        </div>

        {/* Título + badge */}
        <div className="wrap pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${badge.className}`}>
                {badge.label.toUpperCase()}
              </span>
              {propiedad.tipoInmueble && (
                <span className="text-white/30 text-[11px] font-medium uppercase tracking-wider">
                  {propiedad.tipoInmueble}
                </span>
              )}
            </div>
            <h1
              className="text-[28px] md:text-[38px] font-bold text-white leading-[1.1] mb-3"
              style={{ letterSpacing: '-0.025em' }}
            >
              {propiedad.titulo}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              <span className="text-white/50 text-[13px]">
                {propiedad.zona ? `${propiedad.zona}, ` : ''}
                {propiedad.ciudad}
              </span>
              {propiedad.direccion && (
                <span className="text-white/25 text-[12px]">· {propiedad.direccion}</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Galería */}
      <div className="wrap mt-2 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3"
        >
          {/* Foto principal */}
          <div className="relative rounded-[18px] overflow-hidden h-[340px] md:h-[480px] bg-[#0d1a10]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={propiedad.fotos[activeImg]?.url ?? '/placeholder.jpg'}
                alt={propiedad.titulo}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            </AnimatePresence>

            {/* Contador fotos */}
            {propiedad.fotos.length > 1 && (
              <div
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/80"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
              >
                {activeImg + 1} / {propiedad.fotos.length}
              </div>
            )}
          </div>

          {/* Miniaturas verticales */}
          {propiedad.fotos.length > 1 && (
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[480px] pb-1">
              {propiedad.fotos.map((foto, i) => (
                <button
                  key={foto.id}
                  onClick={() => setActiveImg(i)}
                  className="flex-shrink-0 w-24 lg:w-full h-[72px] rounded-xl overflow-hidden transition-all"
                  style={{
                    opacity: activeImg === i ? 1 : 0.45,
                    outline: activeImg === i ? '2px solid #C9A84C' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  <img src={foto.urlThumb} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="wrap pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          {/* Columna izquierda */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Precio */}
            <div
              className="border rounded-[18px] p-6 mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                borderColor: 'rgba(201,168,76,0.15)',
              }}
            >
              <div className="text-gold/60 text-[10px] font-bold tracking-[2.5px] uppercase mb-1">
                Precio
              </div>
              <div
                className="text-[38px] md:text-[44px] font-extrabold text-gold leading-tight"
                style={{ letterSpacing: '-0.025em' }}
              >
                {formatPrice(propiedad.precio, propiedad.moneda)}
              </div>
              <div className="text-white/25 text-[12px] mt-1.5 capitalize">
                {propiedad.tipo.toLowerCase().replace('_', ' ')} · precio negociable
              </div>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {features.map(f => (
                  <div
                    key={f.l}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <div className="text-white font-bold text-[15px]">{f.v}</div>
                    <div className="text-white/35 text-[11px] mt-0.5">{f.l}</div>
                  </div>
                ))}
                {propiedad.amueblado && (
                  <div className="bg-gold/[0.06] border border-gold/20 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">🛋</div>
                    <div className="text-gold font-bold text-[15px]">Sí</div>
                    <div className="text-white/35 text-[11px] mt-0.5">Amueblado</div>
                  </div>
                )}
                {propiedad.piscina && (
                  <div className="bg-gold/[0.06] border border-gold/20 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">🏊</div>
                    <div className="text-gold font-bold text-[15px]">Sí</div>
                    <div className="text-white/35 text-[11px] mt-0.5">Piscina</div>
                  </div>
                )}
              </div>
            )}

            {/* Descripción */}
            {propiedad.descripcion && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-5 h-px bg-gold" />
                  <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">
                    Descripción
                  </span>
                </div>
                <p className="text-white/60 text-[14px] leading-[1.85] whitespace-pre-line">
                  {propiedad.descripcion}
                </p>
              </div>
            )}
          </motion.div>

          {/* Sidebar agente */}
          <motion.div
            className="lg:sticky lg:top-24 self-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="border rounded-[20px] p-6 overflow-hidden relative"
              style={{ background: '#0d1a10', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {/* Glow decorativo */}
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
                  transform: 'translate(30%, -30%)',
                }}
              />

              <div className="text-white/25 text-[10px] font-bold tracking-[2.5px] uppercase mb-5">
                Tu asesor
              </div>

              <div className="flex items-center gap-3.5 mb-6">
                <div
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-gold text-lg font-bold flex-shrink-0"
                  style={{
                    background: 'rgba(201,168,76,0.12)',
                    borderColor: 'rgba(201,168,76,0.3)',
                  }}
                >
                  {propiedad.agente.nombre[0]}
                  {propiedad.agente.apellido[0]}
                </div>
                <div>
                  <div className="text-white font-semibold text-[15px] leading-tight">
                    {propiedad.agente.nombre} {propiedad.agente.apellido}
                  </div>
                  <div className="text-white/35 text-[12px] mt-0.5">Asesor/a Inmobiliaria</div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappUrl(propiedad.agente.whatsapp, waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-bold text-[13px] transition-opacity hover:opacity-90"
                  style={{ background: '#25D366', color: '#fff' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Consultar por WhatsApp
                </a>

                <a
                  href={`tel:${propiedad.agente.telefono}`}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-[13px] border transition-colors hover:bg-white/[0.05]"
                  style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.7 2 2 0 012-2.18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 6.5a16 16 0 006 6l.61-1.24a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 13.92z" />
                  </svg>
                  {propiedad.agente.telefono}
                </a>

                <div
                  className="border-t pt-4"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <Link
                    to={`/agentes/${propiedad.agente.slug}`}
                    className="block text-center text-gold/70 text-[12px] font-semibold hover:text-gold transition-colors"
                  >
                    Ver perfil del agente →
                  </Link>
                </div>
              </div>
            </div>

            {/* Share / back */}
            <div className="mt-4 flex gap-2">
              <Link
                to="/propiedades"
                className="flex-1 text-center py-2.5 rounded-xl border border-white/08 text-white/35 text-[12px] hover:text-white/55 hover:bg-white/[0.03] transition-colors"
              >
                ← Volver
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
