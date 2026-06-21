import { useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AnimatedHeading } from '../ui/AnimatedHeading'
import { FadeIn } from '../ui/FadeIn'
import { HeroTagCard } from './HeroTagCard'

// Servido localmente desde /public/hero.mp4 — evita CORS del CDN externo
const VIDEO_URL = '/hero.mp4'
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { scrollY } = useScroll()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {
      // Autoplay bloqueado — el gradiente fallback es visible
    })
  }, [])
  const videoScale = useTransform(scrollY, [0, 500], [1, 1.08])
  const videoOpacity = useTransform(scrollY, [0, 400], [1, 0.3])
  const contentY = useTransform(scrollY, [0, 300], [0, -60])
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-end overflow-hidden" style={{ background: '#071510' }}>
      <motion.div className="absolute inset-0" style={{ scale: videoScale, opacity: videoOpacity }}>
        {/* 1. Gradiente de fondo — detrás del video (z-index 0) */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 0,
            background: [
              'radial-gradient(ellipse 90% 70% at 25% 35%, rgba(13,59,39,0.95) 0%, transparent 55%)',
              'radial-gradient(ellipse 70% 80% at 80% 65%, rgba(10,36,22,0.9) 0%, transparent 55%)',
              'linear-gradient(160deg, #071510 0%, #0D3B27 35%, #091e0f 65%, #050d07 100%)',
            ].join(', '),
          }}
        />
        {/* 2. Video — ENCIMA del gradiente (z-index 1), tapa el gradiente cuando carga */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', zIndex: 1 }}
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        {/* 3. Overlay de color muy sutil sobre el video (z-index 2) — mantiene coherencia de marca */}
        <div
          className="absolute inset-0"
          style={{
            zIndex: 2,
            background: 'linear-gradient(160deg, rgba(7,21,16,0.35) 0%, rgba(0,0,0,0.1) 50%, rgba(5,13,7,0.3) 100%)',
          }}
        />
      </motion.div>

      {/* 4. Fade bottom — para legibilidad del texto */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{ zIndex: 3, background: 'linear-gradient(0deg, rgba(8,14,9,0.88) 0%, transparent 100%)' }}
      />

      <motion.div className="relative pb-14" style={{ y: contentY, zIndex: 10 }}>
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-end">
            <div>
              <FadeIn delay={100} y={0}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-gold" />
                  <span className="text-gold text-[11px] font-semibold tracking-[3px] uppercase">
                    Inmobiliaria Premium Bolivia
                  </span>
                </div>
              </FadeIn>

              <AnimatedHeading
                lines={['Tu hogar ideal,', 'nuestra pasion.']}
                className="text-[42px] md:text-[56px] lg:text-[68px] font-bold leading-[1.03] mb-5"
                style={{ letterSpacing: '-0.035em', color: '#fff' }}
              />

              <FadeIn delay={900} y={0}>
                <p className="text-white/55 text-base md:text-lg font-light mb-8 leading-relaxed">
                  Venta · Alquiler · Anticretico
                  <br />
                  <span className="text-white/40">Cochabamba · Santa Cruz · La Paz · Oruro</span>
                </p>
              </FadeIn>

              <FadeIn delay={1200} y={20}>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/propiedades"
                    className="bg-gold text-green-deep px-7 py-3.5 rounded-lg text-[13px] font-bold inline-flex items-center gap-2 hover:bg-gold-light transition-colors"
                  >
                    Explorar propiedades
                  </Link>
                  <a
                    href={`https://wa.me/${WA_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="liquid-glass border border-white/18 text-white px-7 py-3.5 rounded-lg text-[13px] font-medium inline-flex items-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Hablar con agente
                  </a>
                </div>
              </FadeIn>
            </div>

            <div className="hidden lg:block">
              <HeroTagCard />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-gold"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent" />
      </motion.div>
    </section>
  )
}
