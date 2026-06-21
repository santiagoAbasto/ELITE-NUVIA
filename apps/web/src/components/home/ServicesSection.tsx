import { motion } from 'framer-motion'
import { ParticlesCanvas } from './ParticlesCanvas'
import { SectionEyebrow } from '../ui/SectionEyebrow'
import { FadeInView } from '../ui/FadeIn'

const SERVICES = [
  {
    icon: '🏠',
    name: 'VENTA',
    title: 'Venta',
    desc: 'Vendemos tu propiedad al mejor precio del mercado. Valuacion gratuita, fotografia profesional y maxima exposicion digital en todas las plataformas.',
    cta: 'Ver propiedades en venta',
    href: '/propiedades?tipo=VENTA',
    featured: false,
    hint: undefined as string | undefined,
  },
  {
    icon: '🗝️',
    name: 'ALQUILER',
    title: 'Alquiler',
    desc: 'Encuentra el inmueble perfecto o alquila el tuyo con respaldo total. Gestion de contratos, garantias y seguimiento mensual incluidos.',
    cta: 'Ver inmuebles en alquiler',
    href: '/propiedades?tipo=ALQUILER',
    featured: true,
    hint: undefined as string | undefined,
  },
  {
    icon: '🤝',
    name: 'ANTICRETICO',
    title: 'Anticretico',
    desc: 'Modalidad exclusiva de Bolivia. Entrega un monto y vive en la propiedad por el tiempo acordado sin pagar renta mensual. Al finalizar, recuperas tu inversion.',
    cta: 'Ver opciones disponibles',
    href: '/propiedades?tipo=ANTICRETICO',
    featured: false,
    hint: '¿Como funciona el anticretico?',
  },
]

export function ServicesSection() {
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
        <FadeInView className="text-center mb-14">
          <SectionEyebrow label="Lo que hacemos" center />
          <h2 className="text-[38px] font-bold text-white mt-2" style={{ letterSpacing: '-0.02em' }}>
            Nuestros{' '}
            <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Servicios
            </em>
          </h2>
          <p className="text-white/40 text-[14px] mt-3 max-w-[480px] mx-auto">
            Soluciones inmobiliarias a tu medida. Respaldo y confianza en cada etapa de tu vida.
          </p>
        </FadeInView>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.name}
              className="relative border rounded-[18px] p-10 overflow-hidden"
              style={{
                borderColor: svc.featured ? 'rgba(201,168,76,0.35)' : 'rgba(201,168,76,0.15)',
                background: svc.featured ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.025)',
              }}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ rotateY: 3, rotateX: -2, scale: 1.02 }}
            >
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
              />
              <div className="w-14 h-14 rounded-[14px] border border-gold/20 bg-gold/10 flex items-center justify-center text-2xl mb-6">
                {svc.icon}
              </div>
              <div className="text-[11px] text-gold font-bold tracking-[3px] uppercase mb-2.5">{svc.name}</div>
              <h3 className="text-[26px] font-bold text-white mb-3.5 leading-tight">{svc.title}</h3>
              <p className="text-white/50 text-[13.5px] leading-[1.7] mb-7">{svc.desc}</p>
              <a href={svc.href} className="flex items-center gap-2 text-gold text-[12.5px] font-semibold">
                <div className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-xs">
                  →
                </div>
                {svc.cta}
              </a>
              {svc.hint && (
                <div className="text-white/25 text-[11px] italic mt-2">{svc.hint}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
