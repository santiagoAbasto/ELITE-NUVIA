import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TestimonioPublico } from '@elite/types'

const BADGE: Record<string, { label: string; className: string }> = {
  VENTA: { label: 'Venta', className: 'bg-gold text-[#0A2416]' },
  ALQUILER: { label: 'Alquiler', className: 'border border-gold/60 text-gold' },
  ANTICRETICO: { label: 'Anticretico', className: 'bg-white/10 text-white/80 border border-white/20' },
}

const EASE = [0.22, 1, 0.36, 1] as const

interface TestimonioCardProps {
  testimonio: TestimonioPublico
}

export function TestimonioCard({ testimonio }: TestimonioCardProps) {
  const badge = BADGE[testimonio.tipo] ?? BADGE.VENTA
  const [hovering, setHovering] = useState(false)

  return (
    <motion.div
      className="liquid-glass relative max-w-[680px] mx-auto rounded-[20px] px-9 py-8 border"
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      animate={{
        y: hovering ? -5 : 0,
        borderColor: hovering ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)',
        boxShadow: hovering
          ? '0 26px 60px rgba(0,0,0,0.4), 0 10px 30px rgba(201,168,76,0.10)'
          : '0 8px 30px rgba(0,0,0,0.25)',
      }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ borderStyle: 'solid' }}
    >
      {/* Comilla decorativa */}
      <motion.div
        className="absolute -top-4 -left-2 select-none pointer-events-none leading-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '96px',
          fontWeight: 900,
          color: 'rgba(201,168,76,0.08)',
          lineHeight: 1,
        }}
        animate={{ color: hovering ? 'rgba(201,168,76,0.16)' : 'rgba(201,168,76,0.08)' }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        "
      </motion.div>

      {/* Badge tipo */}
      <div className="flex justify-end mb-6 relative z-10">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider ${badge.className}`}>
          {badge.label.toUpperCase()}
        </span>
      </div>

      {/* Estrellas — entrada en stagger */}
      <div className="flex gap-1 mb-5 relative z-10">
        {Array.from({ length: testimonio.rating }).map((_, i) => (
          <motion.svg
            key={i}
            width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C"
            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </motion.svg>
        ))}
      </div>

      {/* Texto */}
      <blockquote className="text-white/80 text-[16px] leading-[1.75] font-light mb-7 relative z-10">
        "{testimonio.texto}"
      </blockquote>

      {/* Autor */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
          {testimonio.foto ? (
            <img src={testimonio.foto} alt={testimonio.nombre} className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="text-gold text-[13px] font-bold">
              {testimonio.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          )}
        </div>
        <div>
          <div className="text-white font-semibold text-[14px]">{testimonio.nombre}</div>
          <div className="text-white/40 text-[12px]">{testimonio.ciudad}</div>
        </div>
      </div>
    </motion.div>
  )
}
