import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { formatPrice, badgeConfig, whatsappUrl } from '../lib/utils'
import { Seo, SITE_URL } from '../components/Seo'
import type { AgentePublico, PropiedadPublica } from '@elite/types'

const OPERACION_LABEL: Record<string, string> = {
  VENTA: 'en venta',
  ALQUILER: 'en alquiler',
  ANTICRETICO: 'en anticrético',
}

type IconProps = { className?: string }

function BedIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10V5.5A1.5 1.5 0 015.5 4h2A2.5 2.5 0 0110 6.5V10" />
      <path d="M10 10h10a2 2 0 012 2v6" />
      <path d="M2 18h20" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M2 12v6" />
    </svg>
  )
}

function BathIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h16v2.5a4.5 4.5 0 01-4.5 4.5h-7A4.5 4.5 0 014 14.5V12z" />
      <path d="M6 12V6.5A2.5 2.5 0 018.5 4H10" />
      <path d="M9 6h4" />
      <path d="M7 19l-1 2" />
      <path d="M17 19l1 2" />
    </svg>
  )
}

function AreaIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19V5h14" />
      <path d="M5 19h14V9" />
      <path d="M9 15h6V9" />
      <path d="M9 15V9" />
    </svg>
  )
}

function GarageIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l8-5 8 5v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9z" />
      <path d="M8 20v-7h8v7" />
      <path d="M9.5 15h5" />
    </svg>
  )
}

function SofaIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 11V8a3 3 0 013-3h4a3 3 0 013 3v3" />
      <path d="M5 13h14a3 3 0 013 3v3H2v-3a3 3 0 013-3z" />
      <path d="M5 19v2" />
      <path d="M19 19v2" />
    </svg>
  )
}

function PoolIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1" />
      <path d="M4 21c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1" />
      <path d="M8 13V6a3 3 0 013-3h1" />
      <path d="M8 9h8" />
      <path d="M16 13V6a3 3 0 013-3h1" />
    </svg>
  )
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v2.35a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.45 19.45 0 01-6-6A19.86 19.86 0 012.13 3.6 2 2 0 014.11 1.4h2.35a2 2 0 012 1.72c.12.91.33 1.8.62 2.65a2 2 0 01-.45 2.1L7.64 8.86a16 16 0 006.5 6.5l.99-.99a2 2 0 012.1-.45c.85.29 1.74.5 2.65.62A2 2 0 0122 16.92z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface SpecItem {
  key: string
  label: string
  value: string
  enabled: boolean
  icon: (props: IconProps) => JSX.Element
}

function SpecCell({ item }: { item: SpecItem }) {
  const Icon = item.icon
  return (
    <div className={`group min-h-[138px] rounded-[18px] border border-white/[0.075] bg-[#0b130d] p-5 transition-colors ${item.enabled ? 'hover:border-gold/[0.30] hover:bg-[#0f1b12]' : 'opacity-68'}`}>
      <div className="flex h-full flex-col justify-between gap-8">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl border ${item.enabled ? 'border-gold/[0.18] bg-gold/[0.075] text-gold' : 'border-white/[0.06] bg-white/[0.025] text-white/30'}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className={`text-[18px] font-bold leading-none ${item.enabled ? 'text-white' : 'text-white/45'}`}>
            {item.value}
          </div>
          <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-white/[0.36]">
            {item.label}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropiedadDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [propiedad, setPropiedad] = useState<PropiedadPublica | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [agentes, setAgentes] = useState<AgentePublico[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setNotFound(false)
    setActiveImg(0)
    api.propiedades
      .bySlug(slug)
      .then(data => {
        setPropiedad(data)
        setSelectedAgentId(data.agente.id)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    let active = true
    api.agentes
      .list()
      .then(data => {
        if (active) setAgentes(data)
      })
      .catch(() => {
        if (active) setAgentes([])
      })
    return () => {
      active = false
    }
  }, [])

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
  const contactAgents = agentes.some(a => a.id === propiedad.agente.id)
    ? agentes
    : [propiedad.agente, ...agentes]
  const selectedAgent = contactAgents.find(a => a.id === selectedAgentId) ?? propiedad.agente
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `${SITE_URL}/propiedades/${propiedad.slug}`
  const waMsg = `Hola ELITE Nuvia, me interesa esta propiedad: ${propiedad.titulo}. Quisiera coordinar con ${selectedAgent.nombre} ${selectedAgent.apellido}. ${pageUrl}`
  const hasMultiplePhotos = propiedad.fotos.length > 1

  const specs: SpecItem[] = [
    {
      key: 'dormitorios',
      value: propiedad.dormitorios != null ? String(propiedad.dormitorios) : 'A consultar',
      label: 'Dormitorios',
      enabled: propiedad.dormitorios != null,
      icon: BedIcon,
    },
    {
      key: 'banos',
      value: propiedad.banos != null ? String(propiedad.banos) : 'A consultar',
      label: 'Baños',
      enabled: propiedad.banos != null,
      icon: BathIcon,
    },
    {
      key: 'superficie',
      value: propiedad.superficieM2 ? `${propiedad.superficieM2} m²` : 'A consultar',
      label: 'Superficie',
      enabled: propiedad.superficieM2 != null,
      icon: AreaIcon,
    },
    {
      key: 'garage',
      value: propiedad.garage ? 'Incluido' : 'No incluido',
      label: 'Garage',
      enabled: propiedad.garage,
      icon: GarageIcon,
    },
    {
      key: 'amueblado',
      value: propiedad.amueblado ? 'Sí' : 'No',
      label: 'Amueblado',
      enabled: propiedad.amueblado,
      icon: SofaIcon,
    },
    {
      key: 'piscina',
      value: propiedad.piscina ? 'Sí' : 'No',
      label: 'Piscina',
      enabled: propiedad.piscina,
      icon: PoolIcon,
    },
  ]

  const opLabel = OPERACION_LABEL[propiedad.tipo] ?? ''
  const seoDescription = `${propiedad.titulo} ${opLabel} en ${propiedad.zona ? `${propiedad.zona}, ` : ''}${propiedad.ciudad}. ${propiedad.dormitorios ?? '—'} dormitorios, ${propiedad.banos ?? '—'} baños${propiedad.superficieM2 ? `, ${propiedad.superficieM2} m²` : ''}. Precio: ${propiedad.moneda} ${propiedad.precio.toLocaleString('es-BO')}.`
  const propiedadJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: propiedad.titulo,
    description: propiedad.descripcion,
    url: `${SITE_URL}/propiedades/${propiedad.slug}`,
    image: propiedad.fotos.map(f => f.url),
    datePosted: propiedad.createdAt,
    offers: {
      '@type': 'Offer',
      price: propiedad.precio,
      priceCurrency: propiedad.moneda,
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: propiedad.ciudad,
      addressRegion: propiedad.zona ?? undefined,
      addressCountry: 'BO',
    },
    numberOfRooms: propiedad.dormitorios ?? undefined,
    floorSize: propiedad.superficieM2 ? { '@type': 'QuantitativeValue', value: propiedad.superficieM2, unitCode: 'MTK' } : undefined,
  }

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      <Seo
        title={`${propiedad.titulo} — ${propiedad.ciudad}`}
        description={seoDescription}
        path={`/propiedades/${propiedad.slug}`}
        image={propiedad.fotos[0]?.url}
        jsonLd={propiedadJsonLd}
      />
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
      <div className="wrap mt-2 mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={hasMultiplePhotos ? 'grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]' : 'grid grid-cols-1'}
        >
          {/* Foto principal */}
          <div className={`relative overflow-hidden rounded-[22px] bg-[#0d1a10] shadow-[0_24px_90px_rgba(0,0,0,0.24)] ${hasMultiplePhotos ? 'h-[360px] md:h-[520px]' : 'h-[380px] md:h-[560px] lg:h-[620px]'}`}>
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
          {hasMultiplePhotos && (
            <div className="flex gap-3 overflow-x-auto pb-1 lg:max-h-[520px] lg:flex-col lg:overflow-y-auto">
              {propiedad.fotos.map((foto, i) => (
                <button
                  key={foto.id}
                  onClick={() => setActiveImg(i)}
                  className="h-[82px] w-28 flex-shrink-0 overflow-hidden rounded-2xl transition-all lg:h-[94px] lg:w-full"
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
      <div className="wrap pb-32">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-14">
          {/* Columna izquierda */}
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Precio */}
            <section
              className="rounded-[24px] border p-7 md:p-8"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.055) 0%, rgba(9,18,11,0.94) 48%, rgba(8,14,9,0.98) 100%)',
                borderColor: 'rgba(201,168,76,0.16)',
              }}
            >
              <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
                <div>
                  <div className="text-gold/65 text-[10px] font-bold tracking-[2.5px] uppercase mb-2">
                    Valor publicado
                  </div>
                  <div
                    className="text-[38px] md:text-[48px] font-extrabold text-gold leading-tight"
                    style={{ letterSpacing: '-0.025em' }}
                  >
                    {formatPrice(propiedad.precio, propiedad.moneda)}
                  </div>
                  <div className="text-white/[0.38] text-[12px] mt-2 capitalize">
                    {propiedad.tipo.toLowerCase().replace('_', ' ')} · precio negociable
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.065] bg-white/[0.025] p-5 md:text-right">
                  <div className="text-white/35 text-[11px] font-semibold">Inventario ELITE</div>
                  <div className="mt-1 text-[13px] font-semibold text-white/75">
                    Publicación institucional
                  </div>
                </div>
              </div>
            </section>

            {/* Características */}
            <section>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-px w-5 bg-gold" />
                  <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">
                    Características
                  </span>
                </div>
                <span className="hidden text-[11px] font-medium text-white/[0.32] sm:inline">
                  Datos principales del inmueble
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-3">
                {specs.map(item => (
                  <SpecCell key={item.key} item={item} />
                ))}
              </div>
            </section>

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

          {/* Sidebar contacto */}
          <motion.div
            className="lg:sticky lg:top-24 self-start"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="border rounded-[22px] p-6 overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(13,26,16,0.98), rgba(8,20,12,0.98))',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <div className="text-white/30 text-[10px] font-bold tracking-[2.5px] uppercase mb-5">
                Atención ELITE
              </div>

              <div className="mb-5">
                <div className="text-[15px] font-bold text-white">ELITE Nuvia</div>
                <p className="mt-1 text-[12px] leading-relaxed text-white/48">
                  La propiedad pertenece al inventario de ELITE. Elige el asesor con quien quieres coordinar.
                </p>
              </div>

              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/[0.32]">
                Asesor de contacto
              </label>
              <select
                value={selectedAgent.id}
                onChange={e => setSelectedAgentId(e.target.value)}
                className="mb-5 w-full rounded-2xl border border-white/[0.10] bg-[#08120b] px-4 py-3 text-[13px] font-semibold text-white/78 outline-none transition-colors focus:border-gold/[0.45]"
              >
                {contactAgents.map(agente => (
                  <option key={agente.id} value={agente.id}>
                    {agente.nombre} {agente.apellido}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3.5 mb-6 border-y border-white/[0.07] py-4">
                <div
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-gold text-lg font-bold flex-shrink-0"
                  style={{
                    background: 'rgba(201,168,76,0.12)',
                    borderColor: 'rgba(201,168,76,0.3)',
                  }}
                >
                  {selectedAgent.nombre[0]}
                  {selectedAgent.apellido[0]}
                </div>
                <div>
                  <div className="text-white font-semibold text-[15px] leading-tight">
                    {selectedAgent.nombre} {selectedAgent.apellido}
                  </div>
                  <div className="text-white/[0.38] text-[12px] mt-0.5">Asesor/a de contacto</div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappUrl(selectedAgent.whatsapp, waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-bold text-[13px] transition-opacity hover:opacity-90"
                  style={{ background: '#25D366', color: '#fff' }}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Consultar con ELITE
                </a>

                <a
                  href={`tel:${selectedAgent.telefono}`}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-[13px] border transition-colors hover:bg-white/[0.05]"
                  style={{ borderColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)' }}
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  {selectedAgent.telefono}
                </a>

                <div
                  className="border-t pt-4"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <Link
                    to={`/agentes/${selectedAgent.slug}`}
                    className="block text-center text-gold/70 text-[12px] font-semibold hover:text-gold transition-colors"
                  >
                    Ver trayectoria del asesor →
                  </Link>
                </div>
              </div>
            </div>

            {/* Share / back */}
            <div className="mt-4 flex gap-2">
              <Link
                to="/propiedades"
                className="flex-1 text-center py-2.5 rounded-xl border border-white/[0.08] text-white/35 text-[12px] hover:text-white/55 hover:bg-white/[0.03] transition-colors"
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
