import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { PropiedadPublica } from '@elite/types'
import { formatPrice, isNew, badgeConfig, whatsappUrl } from '../../lib/utils'

interface PropertyCardProps {
  propiedad: PropiedadPublica
}

export function PropertyCard({ propiedad }: PropertyCardProps) {
  const badge = badgeConfig(propiedad.tipo)
  const nueva = isNew(propiedad.createdAt)
  const imgUrl = propiedad.fotos[0]?.url ?? null
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  // 3D tilt — mouse tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })
  const glowX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%'])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
    setHovering(false)
  }

  return (
    <div
      ref={cardRef}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      data-cursor="ver"
    >
      <motion.div
        className="rounded-[16px] overflow-hidden border bg-[#0d1a10] flex flex-col relative"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          borderColor: hovering ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)',
          boxShadow: hovering
            ? '0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(201,168,76,0.08)'
            : '0 4px 20px rgba(0,0,0,0.2)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Glow especular — sigue el mouse */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-[16px]"
          style={{
            opacity: hovering ? 1 : 0,
            background: useTransform(
              [glowX, glowY],
              ([x, y]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(201,168,76,0.12) 0%, transparent 55%)`,
            ),
            transition: 'opacity 0.3s',
            zIndex: 10,
          }}
        />

        {/* Imagen */}
        <Link to={`/propiedades/${propiedad.slug}`} className="block relative h-[210px] overflow-hidden flex-shrink-0">
          {imgUrl ? (
            <motion.img
              src={imgUrl}
              alt={propiedad.titulo}
              className="w-full h-full object-cover"
              style={{ scale: hovering ? 1.06 : 1, transition: 'scale 0.5s ease' }}
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, #0D3B27 0%, #1a5c3a 50%, #0A2416 100%)' }}
            />
          )}

          {/* Shimmer en imagen al hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
              opacity: hovering ? 1 : 0,
              transition: 'opacity 0.4s',
            }}
          />

          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider ${badge.className}`}>
              {badge.label.toUpperCase()}
            </span>
            {nueva && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider bg-white text-[#0A2416]">
                NUEVO
              </span>
            )}
          </div>
        </Link>

        {/* Contenido */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
            <span className="text-white/45 text-[12px]">
              {propiedad.zona ? `${propiedad.zona}, ` : ''}{propiedad.ciudad}
            </span>
          </div>

          <div className="border-t border-white/05 pt-3 mb-3">
            <div className="text-[22px] font-bold text-white leading-tight">
              {formatPrice(propiedad.precio, propiedad.moneda)}
            </div>
            <div className="text-white/30 text-[11px] mt-0.5">precio negociable</div>
          </div>

          <Link
            to={`/propiedades/${propiedad.slug}`}
            className="text-white/80 text-[13px] leading-snug mb-4 line-clamp-2 hover:text-white transition-colors"
          >
            {propiedad.titulo}
          </Link>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { value: propiedad.dormitorios ?? '—', label: 'Dorm.' },
              { value: propiedad.banos ?? '—', label: 'Baño' },
              { value: propiedad.superficieM2 ? `${propiedad.superficieM2}` : '—', label: 'm²' },
              { value: propiedad.garage ? 'Sí' : 'No', label: 'Gge.' },
            ].map(f => (
              <div key={f.label} className="bg-white/04 rounded-lg py-2 text-center">
                <div className="text-white text-[13px] font-semibold">{f.value}</div>
                <div className="text-white/35 text-[10px]">{f.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-white/05">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-[11px] font-bold flex-shrink-0">
                {propiedad.agente.nombre[0]}{propiedad.agente.apellido[0]}
              </div>
              <span className="text-white/55 text-[12px]">
                {propiedad.agente.nombre} {propiedad.agente.apellido}
              </span>
            </div>
            <a
              href={whatsappUrl(propiedad.agente.whatsapp, `Hola ${propiedad.agente.nombre}, me interesa la propiedad: ${propiedad.titulo}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#25D366' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
