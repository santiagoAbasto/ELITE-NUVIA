import { Link } from 'react-router-dom'
import { LogoSVG } from '../ui/LogoSVG'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

export function Footer() {
  return (
    <footer style={{ background: '#060e08' }} className="pt-16 pb-6">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <LogoSVG />
            <p className="text-white/38 text-[13px] leading-relaxed mt-4 max-w-[240px]">
              Tu hogar, tu futuro, nuestra prioridad. Inmobiliaria de excelencia en Bolivia con mas de 8 anos conectando familias con su hogar ideal.
            </p>
            <div className="flex gap-3 mt-5">
              {['f', 'in', 'ig', 'tt'].map(icon => (
                <div key={icon} className="w-8 h-8 rounded-lg border border-white/08 flex items-center justify-center text-white/40 text-xs font-bold">
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-gold text-[10.5px] font-bold tracking-[2.5px] uppercase mb-4">Propiedades</div>
            {([
              ['En venta', '/propiedades?tipo=VENTA'],
              ['En alquiler', '/propiedades?tipo=ALQUILER'],
              ['Anticretico', '/propiedades?tipo=ANTICRETICO'],
              ['Terrenos', '/propiedades?tipoInmueble=TERRENO'],
              ['Locales', '/propiedades?tipoInmueble=LOCAL'],
            ] as [string, string][]).map(([label, to]) => (
              <Link key={to} to={to} className="block text-white/45 text-[12.5px] mb-2.5 hover:text-white/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>

          <div>
            <div className="text-gold text-[10.5px] font-bold tracking-[2.5px] uppercase mb-4">Contacto</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">+591 4 000 0000</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">Cochabamba, Bolivia</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">info@elitenuvia.bo</div>
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-[12.5px] font-semibold hover:text-gold-light transition-colors"
            >
              WhatsApp directo →
            </a>
          </div>
        </div>

        <div className="border-t border-white/05 pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-white/25 text-[11.5px]">© 2025 ELITE Nuvia. Todos los derechos reservados.</div>
          <div className="text-gold text-[11px] font-bold tracking-[3px]">TU HOGAR, NUESTRA PASION</div>
        </div>
      </div>
    </footer>
  )
}
