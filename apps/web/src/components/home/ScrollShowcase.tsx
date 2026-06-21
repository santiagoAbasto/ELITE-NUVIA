import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'

const SLIDES = [
  {
    tipo: 'VENTA',
    eyebrow: 'Propiedades en Venta',
    headline: 'Tu hogar propio,\na tu alcance.',
    body: 'Mas de 200 casas, departamentos y terrenos disponibles en las mejores zonas de Bolivia. Valuacion gratuita, fotografia profesional y acompanamiento legal completo.',
    stat1: { value: '+200', label: 'Inmuebles en venta' },
    stat2: { value: '8', label: 'Años gestionando' },
    color: '#C9A84C',
    bgAccent: 'rgba(201,168,76,0.06)',
    gradient: 'linear-gradient(135deg, #0D3B27 0%, #1a5c3a 30%, #C9A84C 60%, #0A2416 100%)',
    pattern: 'casa',
    available: '42',
    cardTitle: 'Casa residencial · Cochabamba',
    cardPrice: 'Bs. 380,000',
  },
  {
    tipo: 'ALQUILER',
    eyebrow: 'Inmuebles en Alquiler',
    headline: 'El espacio ideal\npara vivir o trabajar.',
    body: 'Garzoniers amueblados, departamentos modernos y locales comerciales. Contratos claros, garantias gestionadas y seguimiento mensual incluido.',
    stat1: { value: 'Bs. 900', label: 'Desde por mes' },
    stat2: { value: '4', label: 'Ciudades' },
    color: '#7dd3b0',
    bgAccent: 'rgba(125,211,176,0.05)',
    gradient: 'linear-gradient(135deg, #0a1e10 0%, #0D3B27 40%, #1a7a55 70%, #C9A84C 100%)',
    pattern: 'departamento',
    available: '28',
    cardTitle: 'Garzonier amueblado · Zona Norte',
    cardPrice: 'Bs. 4,200 / mes',
  },
  {
    tipo: 'ANTICRETICO',
    eyebrow: 'Anticretico — Solo en Bolivia',
    headline: 'Invierte sin pagar\nrenta mensual.',
    body: 'Deposita un monto, vive en la propiedad por el tiempo acordado y recuperas el 100% de tu inversion al finalizar. La modalidad mas inteligente del mercado boliviano.',
    stat1: { value: '100%', label: 'Inversion recuperable' },
    stat2: { value: '0', label: 'Renta mensual' },
    color: '#a78bfa',
    bgAccent: 'rgba(167,139,250,0.05)',
    gradient: 'linear-gradient(135deg, #0d0a1e 0%, #1a1035 40%, #2d1b69 70%, #C9A84C 100%)',
    pattern: 'anticretico',
    available: '15',
    cardTitle: 'Departamento · Anticretico 2 años',
    cardPrice: 'Bs. 85,000 anticretico',
  },
] as const

type Slide = (typeof SLIDES)[number]

function PropertyVisual({ pattern }: { pattern: string }) {
  if (pattern === 'departamento') {
    const rows = [0, 1, 2, 3, 4]
    const cols = [0, 1, 2]
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="400" height="300" fill="url(#bg2)" rx="12" />
        <rect x="100" y="50" width="200" height="230" fill="rgba(13,59,39,0.6)" rx="4" />
        {rows.map(row =>
          cols.map(col => (
            <rect
              key={`${row}-${col}`}
              x={120 + col * 56}
              y={70 + row * 38}
              width="40"
              height="24"
              fill={col % 2 === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(201,168,76,0.25)'}
              rx="2"
            />
          ))
        )}
        <rect x="100" y="50" width="200" height="25" fill="rgba(201,168,76,0.15)" rx="4" />
        <rect x="130" y="30" width="140" height="25" fill="rgba(13,59,39,0.8)" rx="3" />
        <rect x="175" y="240" width="50" height="40" fill="rgba(201,168,76,0.3)" rx="2" />
        <circle cx="195" cy="260" r="3" fill="rgba(201,168,76,0.8)" />
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#091a10" />
            <stop offset="100%" stopColor="#0D3B27" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (pattern === 'anticretico') {
    return (
      <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect width="400" height="300" fill="url(#bg3)" rx="12" />
        <circle cx="200" cy="130" r="55" stroke="rgba(201,168,76,0.3)" strokeWidth="1.5" fill="none" />
        <circle cx="200" cy="130" r="40" stroke="rgba(201,168,76,0.5)" strokeWidth="1" fill="rgba(201,168,76,0.06)" />
        <circle cx="200" cy="115" r="18" stroke="#C9A84C" strokeWidth="2" fill="none" />
        <circle cx="200" cy="115" r="7" fill="rgba(201,168,76,0.4)" />
        <rect x="198" y="130" width="4" height="30" rx="2" fill="#C9A84C" />
        <rect x="202" y="148" width="10" height="3.5" rx="1.5" fill="#C9A84C" />
        <rect x="202" y="155" width="8" height="3.5" rx="1.5" fill="#C9A84C" />
        <text x="200" y="220" textAnchor="middle" fill="rgba(201,168,76,0.7)" fontSize="28" fontWeight="800" fontFamily="Inter">100%</text>
        <text x="200" y="245" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="Inter" letterSpacing="3">RECUPERABLE</text>
        <path d="M 80 130 Q 110 100 140 130 Q 110 160 80 130Z" stroke="rgba(201,168,76,0.2)" strokeWidth="1" fill="none" />
        <path d="M 320 130 Q 290 100 260 130 Q 290 160 320 130Z" stroke="rgba(201,168,76,0.2)" strokeWidth="1" fill="none" />
        <defs>
          <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d0a1e" />
            <stop offset="100%" stopColor="#1a1035" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // default: casa
  return (
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="400" height="300" fill="url(#bg1)" rx="12" />
      <polygon points="200,60 110,140 290,140" fill="rgba(201,168,76,0.4)" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" />
      <rect x="120" y="140" width="160" height="100" fill="rgba(13,59,39,0.8)" rx="2" />
      <rect x="170" y="175" width="60" height="65" fill="rgba(201,168,76,0.3)" rx="2" />
      <rect x="130" y="155" width="35" height="30" fill="rgba(255,255,255,0.15)" rx="2" />
      <rect x="235" y="155" width="35" height="30" fill="rgba(255,255,255,0.15)" rx="2" />
      <rect x="310" y="180" width="70" height="50" fill="rgba(125,211,176,0.3)" rx="6" stroke="rgba(125,211,176,0.5)" strokeWidth="1" />
      <ellipse cx="345" cy="205" rx="20" ry="12" fill="rgba(125,211,176,0.2)" />
      <circle cx="95" cy="200" r="20" fill="rgba(26,92,58,0.6)" />
      <circle cx="75" cy="215" r="14" fill="rgba(26,92,58,0.5)" />
      <circle cx="115" cy="218" r="12" fill="rgba(13,59,39,0.7)" />
      <defs>
        <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A2416" />
          <stop offset="50%" stopColor="#0D3B27" />
          <stop offset="100%" stopColor="#091a0f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

interface SlideProps {
  slide: Slide
  index: number
  smooth: MotionValue<number>
}

function SlideItem({ slide, index, smooth }: SlideProps) {
  const total = SLIDES.length
  const start = index / total
  const end = (index + 1) / total

  const opacity = useTransform(
    smooth,
    [Math.max(0, start - 0.05), start + 0.08, end - 0.08, Math.min(1, end + 0.05)],
    [0, 1, 1, 0]
  )

  const rotateY = useTransform(
    smooth,
    [Math.max(0, start - 0.05), start + 0.12, end - 0.12, Math.min(1, end + 0.05)],
    [28, 0, 0, -28]
  )

  const scale = useTransform(
    smooth,
    [Math.max(0, start - 0.05), start + 0.12, end - 0.12, Math.min(1, end + 0.05)],
    [0.82, 1, 1, 0.82]
  )

  const imgX = useTransform(
    smooth,
    [Math.max(0, start - 0.05), start + 0.12, end - 0.12, Math.min(1, end + 0.05)],
    ['8%', '0%', '0%', '-8%']
  )

  const textY = useTransform(
    smooth,
    [Math.max(0, start - 0.05), start + 0.14, end - 0.1, Math.min(1, end + 0.05)],
    [60, 0, 0, -40]
  )

  return (
    <motion.div
      style={{ opacity, position: 'absolute', inset: 0, background: '#080e09' }}
      className="flex items-center"
    >
      {/* Glow accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 70% 50%, ${slide.bgAccent}, transparent)`,
        }}
      />

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-center">
          {/* Texto */}
          <motion.div style={{ y: textY }}>
            <div
              className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full border text-[11px] font-bold tracking-[2.5px] uppercase"
              style={{
                borderColor: `${slide.color}40`,
                color: slide.color,
                background: `${slide.color}10`,
              }}
            >
              {slide.eyebrow}
            </div>

            <h2
              className="text-[36px] md:text-[48px] lg:text-[54px] font-bold text-white mb-5 leading-[1.06]"
              style={{ letterSpacing: '-0.035em', whiteSpace: 'pre-line' }}
            >
              {slide.headline}
            </h2>

            <p className="text-white/50 text-[14px] md:text-[15px] leading-[1.75] mb-8 max-w-[440px]">
              {slide.body}
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-8">
              {([slide.stat1, slide.stat2] as const).map(stat => (
                <div key={stat.label}>
                  <div
                    className="text-[30px] font-extrabold leading-none"
                    style={{ color: slide.color, letterSpacing: '-0.03em' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/35 text-[11px] mt-1.5 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`/propiedades?tipo=${slide.tipo}`}
              className="inline-flex items-center gap-2 text-[13px] font-semibold transition-colors"
              style={{ color: slide.color }}
            >
              Ver propiedades en {slide.tipo.toLowerCase()}
              <span className="text-base">→</span>
            </a>
          </motion.div>

          {/* Imagen con efecto 3D */}
          <motion.div
            style={{
              rotateY,
              scale,
              x: imgX,
              perspective: 1200,
              transformStyle: 'preserve-3d',
            }}
            className="relative"
          >
            {/* Sombra de perspectiva */}
            <div
              className="absolute -inset-4 rounded-[28px] blur-2xl opacity-30"
              style={{ background: slide.gradient }}
            />

            {/* Card principal */}
            <div
              className="relative rounded-[24px] overflow-hidden border"
              style={{
                borderColor: `${slide.color}25`,
                boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${slide.color}15`,
              }}
            >
              {/* Línea top dorada */}
              <div
                className="absolute top-0 left-6 right-6 h-px z-10"
                style={{
                  background: `linear-gradient(90deg, transparent, ${slide.color}, transparent)`,
                }}
              />

              <div className="aspect-[4/3] w-full">
                <PropertyVisual pattern={slide.pattern} />
              </div>

              {/* Overlay info */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)',
                }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider mb-2"
                  style={{
                    background: `${slide.color}25`,
                    color: slide.color,
                    border: `1px solid ${slide.color}40`,
                  }}
                >
                  {slide.tipo}
                </div>
                <div className="text-white font-semibold text-[14px]">{slide.cardTitle}</div>
                <div className="text-[13px] font-bold mt-0.5" style={{ color: slide.color }}>
                  {slide.cardPrice}
                </div>
              </div>
            </div>

            {/* Badge flotante */}
            <motion.div
              className="absolute -right-4 -top-4 rounded-2xl px-4 py-2.5 border"
              style={{
                background: '#080e09',
                borderColor: `${slide.color}30`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
            >
              <div className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Disponibles</div>
              <div className="text-[20px] font-extrabold" style={{ color: slide.color }}>
                {slide.available}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Indicador de slide */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, j) => (
          <div
            key={j}
            className="rounded-full transition-all duration-300"
            style={{
              width: j === index ? 24 : 6,
              height: 6,
              background: j === index ? slide.color : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export function ScrollShowcase() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 })

  return (
    <section
      ref={containerRef}
      style={{ height: '400vh', position: 'relative' }}
      aria-label="Servicios ELITE Nuvia"
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#080e09',
        }}
      >
        {/* Fondo base */}
        <div className="absolute inset-0" style={{ background: '#080e09' }} />

        {/* Slides — cada uno se renderiza con su propio hook de Framer Motion */}
        {SLIDES.map((slide, i) => (
          <SlideItem key={slide.tipo} slide={slide} index={i} smooth={smooth} />
        ))}

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 right-10 text-white/20 text-[11px] font-medium tracking-widest uppercase flex items-center gap-2 pointer-events-none"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Scroll
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3v10M8 13l-3-3M8 13l3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}
