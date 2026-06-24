import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ParticlesCanvas } from './ParticlesCanvas'
import { SectionEyebrow } from '../ui/SectionEyebrow'
import { useCmsSection } from '../../hooks/useCmsSection'
import { DEFAULT_CMS_DATA } from '../../lib/cmsDefaults'

const IconHome = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const IconKey = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6M15.5 7.5l3 3"/>
  </svg>
)

const IconHandshake = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
)

const SERVICES: {
  icon: ReactNode
  name: string
  title: string
  desc: string
  cta: string
  href: string
  featured: boolean
  hint: string | undefined
}[] = [
  {
    icon: <IconHome />,
    name: 'VENTA',
    title: 'Venta',
    desc: 'Vendemos tu propiedad al mejor precio del mercado. Valuacion gratuita, fotografia profesional y maxima exposicion digital en todas las plataformas.',
    cta: 'Ver propiedades en venta',
    href: '/propiedades?tipo=VENTA',
    featured: false,
    hint: undefined,
  },
  {
    icon: <IconKey />,
    name: 'ALQUILER',
    title: 'Alquiler',
    desc: 'Encuentra el inmueble perfecto o alquila el tuyo con respaldo total. Gestion de contratos, garantias y seguimiento mensual incluidos.',
    cta: 'Ver inmuebles en alquiler',
    href: '/propiedades?tipo=ALQUILER',
    featured: true,
    hint: undefined,
  },
  {
    icon: <IconHandshake />,
    name: 'ANTICRETICO',
    title: 'Anticretico',
    desc: 'Modalidad exclusiva de Bolivia. Entrega un monto y vive en la propiedad por el tiempo acordado sin pagar renta mensual. Al finalizar, recuperas tu inversion.',
    cta: 'Ver opciones disponibles',
    href: '/propiedades?tipo=ANTICRETICO',
    featured: false,
    hint: '¿Como funciona el anticretico?',
  },
]

interface ServicioCms {
  id: string
  titulo: string
  descripcion: string
  imagenUrl?: string
}

interface ServiciosCms {
  titulo?: string
  subtitulo?: string
  servicios?: ServicioCms[]
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '').trim()
}

function titleWords(title: string) {
  return title.trim().split(/\s+/).filter(Boolean)
}

export function ServicesSection() {
  const cms = useCmsSection<ServiciosCms>('servicios', DEFAULT_CMS_DATA.servicios as ServiciosCms)
  const words = titleWords(cms.titulo ?? 'Nuestros Servicios')
  const servicios = SERVICES.map((svc, i) => {
    const cmsSvc = cms.servicios?.find(s => s.id === svc.name.toLowerCase()) ?? cms.servicios?.[i]
    return {
      ...svc,
      title: cmsSvc?.titulo || svc.title,
      desc: cmsSvc?.descripcion ? stripHtml(cmsSvc.descripcion) : svc.desc,
    }
  })

  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'var(--green-deep)' }}>
      <ParticlesCanvas />
      <div
        className="absolute w-[600px] h-[600px] rounded-full -top-52 -left-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full -bottom-52 -right-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }}
      />

      <div className="wrap relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          {/* Eyebrow with clip-path reveal */}
          <motion.div
            className="flex justify-center"
            initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
            whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionEyebrow label="Lo que hacemos" center />
          </motion.div>

          {/* Title word-by-word blur reveal */}
          <h2
            className="text-[38px] font-bold text-white mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            {words.map((word, i) => (
              <motion.span
                key={word}
                className={`inline-block ${i < words.length - 1 ? 'mr-3' : ''}`}
                initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.2 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                  {i === words.length - 1 ? (
                  <em
                    className="not-italic text-gold"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {word}
                  </em>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h2>

          <motion.p
            className="text-white/40 text-[14px] mt-3 max-w-[480px] mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {cms.subtitulo ?? 'Soluciones inmobiliarias a tu medida. Respaldo y confianza en cada etapa de tu vida.'}
          </motion.p>
        </div>

        {/* Service cards with dramatic 3D entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ perspective: '1000px' }}>
          {servicios.map((svc, i) => (
            <motion.div
              key={svc.name}
              className="relative border rounded-[18px] p-10 overflow-hidden"
              style={{
                borderColor: svc.featured ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.15)',
                background: svc.featured ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.025)',
                transformStyle: 'preserve-3d',
              }}
              initial={{
                opacity: 0,
                y: 80,
                scale: 0.85,
                rotateX: 20,
                filter: 'blur(8px)',
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                filter: 'blur(0px)',
              }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.8,
                delay: i * 0.18,
                ease: [0.22, 1, 0.36, 1],
                filter: { duration: 0.5 },
                rotateX: {
                  type: 'spring',
                  stiffness: 80,
                  damping: 12,
                  delay: i * 0.18,
                },
              }}
              whileHover="hover"
            >
              {/* Glow dorado que aparece al hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[18px]"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 65%)' }}
                initial="rest"
                variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Sombra premium al hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-[18px]"
                initial="rest"
                variants={{
                  rest: { boxShadow: '0 0 0 rgba(0,0,0,0)' },
                  hover: { boxShadow: '0 28px 64px rgba(0,0,0,0.4), 0 10px 26px rgba(201,168,76,0.10)' },
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="relative"
                initial="rest"
                variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.02, y: -4 } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
              />
              <motion.div
                className="w-14 h-14 rounded-[14px] border border-gold/20 bg-gold/10 flex items-center justify-center mb-6 text-gold"
                initial="rest"
                variants={{ rest: { scale: 1, borderColor: 'rgba(201,168,76,0.2)' }, hover: { scale: 1.08, borderColor: 'rgba(201,168,76,0.45)' } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {svc.icon}
              </motion.div>
              <div className="text-[11px] text-gold font-bold tracking-[3px] uppercase mb-2.5">{svc.name}</div>
              <h3 className="text-[26px] font-bold text-white mb-3.5 leading-tight">{svc.title}</h3>
              <p className="text-white/50 text-[13.5px] leading-[1.7] mb-7">{svc.desc}</p>
              <a href={svc.href} className="flex items-center gap-2 text-gold text-[12.5px] font-semibold">
                <motion.div
                  className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-xs"
                  initial="rest"
                  variants={{ rest: { x: 0, backgroundColor: 'rgba(201,168,76,0)', borderColor: 'rgba(201,168,76,0.3)' }, hover: { x: 4, backgroundColor: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.55)' } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  →
                </motion.div>
                {svc.cta}
              </a>
              {svc.hint && (
                <div className="text-white/25 text-[11px] italic mt-2">{svc.hint}</div>
              )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
