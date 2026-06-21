import { Link } from 'react-router-dom'
import { AgentsSection } from '../components/home/AgentsSection'

export default function NosotrosPage() {
  const VALORES = [
    { icon: '🎯', titulo: 'Excelencia', desc: 'Cada propiedad que gestionamos recibe atencion profesional de primer nivel.' },
    { icon: '🤝', titulo: 'Confianza', desc: 'Transparencia en cada paso del proceso. Sin sorpresas ni letras pequeñas.' },
    { icon: '💎', titulo: 'Calidad', desc: 'Solo representamos propiedades que cumplen nuestros estandares de calidad.' },
    { icon: '📍', titulo: 'Conocimiento local', desc: 'Anos de experiencia en el mercado boliviano en 4 ciudades principales.' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Hero nosotros */}
      <div className="pt-28 pb-20" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="wrap">
          <div className="max-w-[640px]">
            <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-3">Quienes somos</div>
            <h1 className="text-[42px] font-bold text-white mb-5" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Un equipo comprometido contigo, cumpliendo sueños.
            </h1>
            <p className="text-white/55 text-[15px] leading-[1.75]">
              ELITE Nuvia es una inmobiliaria boliviana fundada con la mision de conectar familias con su hogar ideal. Con mas de 8 anos de experiencia en el mercado y presencia en Cochabamba, Santa Cruz, La Paz y Oruro, hemos ayudado a mas de 200 familias a encontrar su lugar.
            </p>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="wrap py-20">
        <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-3">Nuestros valores</div>
        <h2 className="text-[32px] font-bold text-white mb-12" style={{ letterSpacing: '-0.02em' }}>Lo que nos define</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALORES.map(v => (
            <div key={v.titulo} className="bg-white/03 border border-white/06 rounded-[16px] p-6">
              <div className="text-3xl mb-4">{v.icon}</div>
              <h3 className="text-white font-bold text-[17px] mb-2">{v.titulo}</h3>
              <p className="text-white/45 text-[13px] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agentes section reutilizada */}
      <div id="agentes">
        <AgentsSection />
      </div>

      {/* CTA */}
      <div className="wrap py-20 text-center">
        <h2 className="text-[28px] font-bold text-white mb-3">Listos para ayudarte</h2>
        <p className="text-white/45 text-[14px] mb-7">Contacta a nuestro equipo hoy mismo.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/contacto" className="bg-gold text-green-deep px-8 py-3.5 rounded-xl font-bold text-[13px] hover:bg-gold-light transition-colors">
            Contactar ahora
          </Link>
          <Link to="/propiedades" className="border border-white/15 text-white px-8 py-3.5 rounded-xl font-semibold text-[13px] hover:bg-white/05 transition-colors">
            Ver propiedades
          </Link>
        </div>
      </div>
    </div>
  )
}
