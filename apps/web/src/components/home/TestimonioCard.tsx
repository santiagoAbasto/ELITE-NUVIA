import type { TestimonioPublico } from '@elite/types'

const BADGE: Record<string, { label: string; className: string }> = {
  VENTA: { label: 'Venta', className: 'bg-gold text-[#0A2416]' },
  ALQUILER: { label: 'Alquiler', className: 'border border-gold/60 text-gold' },
  ANTICRETICO: { label: 'Anticretico', className: 'bg-white/10 text-white/80 border border-white/20' },
}

interface TestimonioCardProps {
  testimonio: TestimonioPublico
}

export function TestimonioCard({ testimonio }: TestimonioCardProps) {
  const badge = BADGE[testimonio.tipo] ?? BADGE.VENTA

  return (
    <div className="relative max-w-[680px] mx-auto">
      {/* Comilla decorativa */}
      <div
        className="absolute -top-4 -left-2 select-none pointer-events-none leading-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '96px',
          fontWeight: 900,
          color: 'rgba(201,168,76,0.08)',
          lineHeight: 1,
        }}
      >
        "
      </div>

      {/* Badge tipo */}
      <div className="flex justify-end mb-6">
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider ${badge.className}`}>
          {badge.label.toUpperCase()}
        </span>
      </div>

      {/* Estrellas */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: testimonio.rating }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>

      {/* Texto */}
      <blockquote className="text-white/80 text-[16px] leading-[1.75] font-light mb-7 relative z-10">
        "{testimonio.texto}"
      </blockquote>

      {/* Autor */}
      <div className="flex items-center gap-3">
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
    </div>
  )
}
