import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const SERVICIOS = [
  {
    icon: '🏠',
    tipo: 'VENTA',
    titulo: 'Venta de Propiedades',
    descripcion: 'Vendemos tu propiedad al mejor precio del mercado boliviano. Realizamos valuacion gratuita, fotografia profesional, publicacion en todas las plataformas digitales y acompanamiento legal hasta la firma del minuto.',
    puntos: ['Valuacion de mercado gratuita', 'Fotografia profesional', 'Publicacion multicanal', 'Acompanamiento legal y notarial', 'Negociacion con compradores'],
    href: '/propiedades?tipo=VENTA',
    cta: 'Ver propiedades en venta',
    featured: false,
    hint: undefined as string | undefined,
  },
  {
    icon: '🗝️',
    tipo: 'ALQUILER',
    titulo: 'Alquiler',
    descripcion: 'Conectamos propietarios con inquilinos responsables. Gestionamos contratos, garantias, inventarios y seguimiento mensual. Ya sea que quieras alquilar tu propiedad o encontrar un inmueble para vivir o trabajar.',
    puntos: ['Verificacion de inquilinos', 'Redaccion de contratos', 'Cobro de garantias', 'Seguimiento mensual', 'Resolucion de conflictos'],
    href: '/propiedades?tipo=ALQUILER',
    cta: 'Ver inmuebles en alquiler',
    featured: true,
    hint: undefined as string | undefined,
  },
  {
    icon: '🤝',
    tipo: 'ANTICRETICO',
    titulo: 'Anticretico',
    descripcion: 'Modalidad exclusiva boliviana en la que entregas una suma de dinero al propietario a cambio del derecho a usar el inmueble por un periodo acordado. Al terminar el contrato, recuperas el 100% de tu inversion.',
    puntos: ['Explicacion detallada del proceso', 'Calculo de montos referenciales', 'Redaccion del contrato', 'Registro notarial', 'Monto 100% recuperable'],
    href: '/propiedades?tipo=ANTICRETICO',
    cta: 'Ver opciones de anticretico',
    featured: false,
    hint: '¿Como funciona el anticretico?' as string | undefined,
  },
]

export default function ServiciosPage() {
  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      <div className="pt-28 pb-24">
        <div className="wrap mb-16">
          <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-3">Lo que hacemos</div>
          <h1 className="text-[40px] font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Nuestros Servicios
          </h1>
          <p className="text-white/45 text-[15px] max-w-[540px]">
            Soluciones inmobiliarias a tu medida. Venta, alquiler y anticretico con respaldo profesional en todo Bolivia.
          </p>
        </div>

        <div className="wrap space-y-8">
          {SERVICIOS.map((svc, i) => (
            <motion.div
              key={svc.tipo}
              className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-center border rounded-[20px] p-8 md:p-12"
              style={{
                borderColor: svc.featured ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)',
                background: svc.featured ? 'rgba(201,168,76,0.03)' : 'rgba(255,255,255,0.02)',
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-[14px] border border-gold/20 bg-gold/10 flex items-center justify-center text-2xl">
                    {svc.icon}
                  </div>
                  <div>
                    <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase">{svc.tipo}</div>
                    <h2 className="text-[26px] font-bold text-white leading-tight">{svc.titulo}</h2>
                  </div>
                </div>
                <p className="text-white/55 text-[14px] leading-[1.75] mb-6">{svc.descripcion}</p>
                {svc.hint && (
                  <div className="text-white/30 text-[12px] italic mb-4">{svc.hint}</div>
                )}
                <Link
                  to={svc.href}
                  className="inline-flex items-center gap-2 text-gold text-[13px] font-semibold hover:text-gold-light transition-colors"
                >
                  {svc.cta} →
                </Link>
              </div>

              <div className="bg-white/03 border border-white/06 rounded-[16px] p-6">
                <div className="text-white/30 text-[10px] font-bold tracking-[2.5px] uppercase mb-4">Incluye</div>
                <ul className="space-y-3">
                  {svc.puntos.map(p => (
                    <li key={p} className="flex items-start gap-3 text-[13.5px] text-white/65">
                      <div className="w-5 h-5 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0 mt-0.5">
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

        {/* CTA final */}
        <div className="wrap mt-16 text-center">
          <h2 className="text-[28px] font-bold text-white mb-3">¿No sabes cual es la mejor opcion para ti?</h2>
          <p className="text-white/45 text-[14px] mb-6">Un agente te asesora sin compromiso.</p>
          <Link to="/contacto" className="inline-flex items-center gap-2 bg-gold text-green-deep px-8 py-3.5 rounded-xl font-bold text-[13px] hover:bg-gold-light transition-colors">
            Consultar gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
