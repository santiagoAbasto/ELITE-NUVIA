import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

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

const SERVICIOS: {
  num: string
  icon: ReactNode
  tipo: string
  titulo: string
  descripcion: string
  puntos: string[]
  href: string
  cta: string
  featured: boolean
}[] = [
  {
    num: '01',
    icon: <IconHome />,
    tipo: 'VENTA',
    titulo: 'Venta de Propiedades',
    descripcion: 'Vendemos tu propiedad al mejor precio del mercado boliviano con valuacion gratuita, fotografia profesional y publicacion en todas las plataformas. Te acompanamos hasta la firma del minuto de transferencia.',
    puntos: [
      'Valuacion de mercado gratuita',
      'Fotografia y video profesional',
      'Publicacion multicanal digital',
      'Acompanamiento legal y notarial',
      'Negociacion con compradores',
      'Contratos y minutas incluidos',
    ],
    href: '/propiedades?tipo=VENTA',
    cta: 'Ver propiedades en venta',
    featured: false,
  },
  {
    num: '02',
    icon: <IconKey />,
    tipo: 'ALQUILER',
    titulo: 'Alquiler',
    descripcion: 'Conectamos propietarios con inquilinos verificados y responsables. Gestionamos contratos, garantias, inventarios y seguimiento mensual completo para ambas partes.',
    puntos: [
      'Verificacion de inquilinos',
      'Redaccion de contratos legales',
      'Cobro y custodia de garantias',
      'Seguimiento y mantenimiento',
      'Resolucion de conflictos',
      'Renovacion automatica de contrato',
    ],
    href: '/propiedades?tipo=ALQUILER',
    cta: 'Ver inmuebles en alquiler',
    featured: true,
  },
  {
    num: '03',
    icon: <IconHandshake />,
    tipo: 'ANTICRETICO',
    titulo: 'Anticretico',
    descripcion: 'La modalidad exclusiva de Bolivia. Deposita un monto al propietario y vive en la propiedad por el tiempo pactado sin pagar renta mensual. Al terminar el contrato, recuperas el 100% de tu inversion.',
    puntos: [
      'Explicacion detallada del proceso',
      'Calculo de montos referenciales',
      'Redaccion del contrato anticretico',
      'Registro notarial incluido',
      'Monto 100% recuperable',
      'Asesoria legal especializada',
    ],
    href: '/propiedades?tipo=ANTICRETICO',
    cta: 'Ver opciones de anticretico',
    featured: false,
  },
]

export default function ServiciosPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Header */}
      <div className="relative pt-28 pb-14" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        <div className="wrap">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Lo que hacemos</span>
          </div>
          <h1 className="text-[40px] md:text-[48px] font-bold text-white leading-[1.05]" style={{ letterSpacing: '-0.03em' }}>
            Nuestros <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>Servicios</em>
          </h1>
          <p className="text-white/45 text-[14px] mt-3 max-w-[520px] leading-relaxed">
            Venta, alquiler y anticretico con respaldo profesional en Cochabamba, Santa Cruz, La Paz y Oruro.
          </p>
        </div>
      </div>

      {/* Servicios */}
      <div className="wrap space-y-8" style={{ paddingTop: '96px', paddingBottom: '128px' }}>
        {SERVICIOS.map((svc, i) => (
          <motion.div
            key={svc.tipo}
            className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start rounded-[20px] border p-8 md:p-12"
            style={{
              borderColor: svc.featured ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)',
              background: svc.featured ? 'rgba(201,168,76,0.025)' : 'rgba(255,255,255,0.015)',
            }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-[14px] border border-gold/20 bg-gold/08 flex items-center justify-center flex-shrink-0 text-gold">
                  {svc.icon}
                </div>
                <div>
                  <div className="text-gold/50 text-[11px] font-bold tracking-[3px] uppercase mb-0.5">{svc.num}</div>
                  <h2 className="text-[26px] md:text-[30px] font-bold text-white leading-tight">{svc.titulo}</h2>
                </div>
              </div>
              <p className="text-white/50 text-[14px] leading-[1.8] mb-7 max-w-[520px]">{svc.descripcion}</p>
              <Link
                to={svc.href}
                className="inline-flex items-center gap-2 bg-gold text-green-deep px-6 py-3 rounded-xl font-bold text-[13px] hover:bg-gold-light transition-colors"
              >
                {svc.cta} →
              </Link>
            </div>

            <div className="bg-white/03 border border-white/06 rounded-[16px] p-6">
              <div className="text-white/25 text-[10px] font-bold tracking-[2.5px] uppercase mb-5">Que incluye</div>
              <ul className="space-y-3.5">
                {svc.puntos.map(p => (
                  <li key={p} className="flex items-start gap-3 text-[13px] text-white/60">
                    <div className="w-5 h-5 rounded-full bg-gold/12 border border-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Separador */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)' }} />

      {/* CTA bottom */}
      <div style={{ background: '#060e08' }}>
        <div className="wrap py-24 text-center">
          <h2 className="text-[26px] font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
            ¿No sabes que opcion es mejor para ti?
          </h2>
          <p className="text-white/40 text-[14px] mb-7">Un agente te asesora sin costo ni compromiso.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/contacto" className="bg-gold text-green-deep px-8 py-3.5 rounded-xl font-bold text-[13px] hover:bg-gold-light transition-colors">
              Consultar gratis
            </Link>
            <Link to="/propiedades" className="border border-white/12 text-white/70 px-8 py-3.5 rounded-xl font-semibold text-[13px] hover:bg-white/05 transition-colors">
              Ver propiedades
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
