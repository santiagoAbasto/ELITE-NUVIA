import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AgentsSection } from '../components/home/AgentsSection'
import { StatsSection } from '../components/home/StatsSection'

const IconTarget = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
)

const IconHandshake = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
  </svg>
)

const IconDiamond = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/>
    <line x1="2" y1="8.5" x2="22" y2="8.5"/>
    <polyline points="12 2 7 8.5 12 22 17 8.5 12 2"/>
  </svg>
)

const IconMapPin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const VALORES: { icon: ReactNode; titulo: string; desc: string }[] = [
  { icon: <IconTarget />, titulo: 'Excelencia', desc: 'Cada propiedad que gestionamos recibe atencion profesional de primer nivel. No trabajamos con cantidad, trabajamos con calidad.' },
  { icon: <IconHandshake />, titulo: 'Confianza', desc: 'Transparencia absoluta en cada paso del proceso. Sin sorpresas, sin letras pequeñas, sin costos ocultos.' },
  { icon: <IconDiamond />, titulo: 'Calidad', desc: 'Solo representamos propiedades verificadas que cumplen nuestros estandares. Cada ficha es precisa y actualizada.' },
  { icon: <IconMapPin />, titulo: 'Conocimiento local', desc: 'Mas de 8 anos en el mercado boliviano. Conocemos cada zona, cada precio y cada oportunidad en 4 ciudades.' },
]

const HITOS = [
  { year: '2016', texto: 'Fundacion en Cochabamba con 3 asesores.' },
  { year: '2018', texto: 'Expansion a Santa Cruz y La Paz.' },
  { year: '2020', texto: 'Plataforma digital y CRM propio.' },
  { year: '2023', texto: 'Llegamos a Oruro. 4 ciudades, 1 equipo.' },
  { year: '2025', texto: '+200 familias. Nuevas metas.' },
]

export default function NosotrosPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Header */}
      <div className="relative pt-28 pb-16" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        <div className="wrap">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Quienes somos</span>
          </div>
          <div className="max-w-[620px]">
            <h1 className="text-[40px] md:text-[52px] font-bold text-white leading-[1.05] mb-5" style={{ letterSpacing: '-0.03em' }}>
              Un equipo comprometido contigo,{' '}
              <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>cumpliendo suenos.</em>
            </h1>
            <p className="text-white/50 text-[15px] leading-[1.75]">
              ELITE Nuvia nacio con la mision de hacer que encontrar tu hogar ideal sea una experiencia transparente, profesional y sin complicaciones. Hoy somos el referente inmobiliario en 4 ciudades bolivianas.
            </p>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="wrap py-20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-5 h-px bg-gold" />
          <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Nuestros valores</span>
        </div>
        <h2 className="text-[32px] font-bold text-white mb-12" style={{ letterSpacing: '-0.02em' }}>Lo que nos define</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALORES.map((v, i) => (
            <motion.div
              key={v.titulo}
              className="bg-white/03 border border-white/06 rounded-[18px] p-6 hover:border-gold/20 transition-colors"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-11 h-11 rounded-xl bg-gold/08 border border-gold/15 flex items-center justify-center mb-4 text-gold">
                {v.icon}
              </div>
              <h3 className="text-white font-bold text-[17px] mb-2">{v.titulo}</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="py-16 border-y border-white/05" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="wrap">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-px bg-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Historia</span>
          </div>
          <h2 className="text-[28px] font-bold text-white mb-10" style={{ letterSpacing: '-0.02em' }}>Nuestra trayectoria</h2>
          <div className="flex flex-col md:flex-row gap-0 md:gap-0">
            {HITOS.map((h, i) => (
              <div key={h.year} className="flex-1 relative">
                {i < HITOS.length - 1 && (
                  <div className="hidden md:block absolute top-[18px] left-1/2 right-0 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.1))' }} />
                )}
                <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 mb-6 md:mb-0 md:text-center pb-6 md:pb-0 border-b md:border-b-0 border-white/05">
                  <div className="w-9 h-9 rounded-full border-2 border-gold/40 bg-gold/10 flex items-center justify-center flex-shrink-0 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                  </div>
                  <div>
                    <div className="text-gold font-bold text-[15px]">{h.year}</div>
                    <div className="text-white/45 text-[13px] mt-0.5 max-w-[140px] md:mx-auto">{h.texto}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsSection />

      {/* Equipo */}
      <div id="agentes">
        <AgentsSection />
      </div>

      {/* CTA */}
      <div style={{ background: '#060e08' }} className="border-t border-white/05">
        <div className="wrap py-16 text-center">
          <h2 className="text-[26px] font-bold text-white mb-2">Listos para ayudarte hoy</h2>
          <p className="text-white/40 text-[14px] mb-7">Sin compromiso. Sin costos ocultos. Solo resultados.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/contacto" className="bg-gold text-green-deep px-8 py-3.5 rounded-xl font-bold text-[13px] hover:bg-gold-light transition-colors">
              Contactar ahora
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
