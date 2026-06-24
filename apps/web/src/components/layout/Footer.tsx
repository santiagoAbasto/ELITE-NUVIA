import { Link } from 'react-router-dom'
import { LogoSVG } from '../ui/LogoSVG'
import { useCmsSection } from '../../hooks/useCmsSection'
import { DEFAULT_CMS_DATA } from '../../lib/cmsDefaults'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

interface FooterLink {
  id: string
  label: string
  url: string
}

interface FooterCms {
  descripcion?: string
  links?: FooterLink[]
  socialInstagram?: string
  socialFacebook?: string
  socialWhatsapp?: string
  textoLegal?: string
}

export function Footer() {
  const cms = useCmsSection<FooterCms>('footer', DEFAULT_CMS_DATA.footer as FooterCms)
  const links = cms.links?.length ? cms.links : [
    { id: 'venta', label: 'En venta', url: '/propiedades?tipo=VENTA' },
    { id: 'alquiler', label: 'En alquiler', url: '/propiedades?tipo=ALQUILER' },
    { id: 'anticretico', label: 'Anticretico', url: '/propiedades?tipo=ANTICRETICO' },
    { id: 'terrenos', label: 'Terrenos', url: '/propiedades?tipoInmueble=TERRENO' },
    { id: 'locales', label: 'Locales', url: '/propiedades?tipoInmueble=LOCAL' },
  ]
  const whatsapp = cms.socialWhatsapp || WA_NUMBER

  return (
    <footer style={{ background: '#060e08' }} className="pt-16 pb-6">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <LogoSVG />
            <p className="text-white/38 text-[13px] leading-relaxed mt-4 max-w-[240px]">
              {cms.descripcion ?? 'Tu hogar, tu futuro, nuestra prioridad. Inmobiliaria de excelencia en Bolivia con mas de 8 anos conectando familias con su hogar ideal.'}
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: 'f', href: cms.socialFacebook },
                { icon: 'ig', href: cms.socialInstagram },
                { icon: 'wa', href: `https://wa.me/${whatsapp}` },
              ].map(({ icon, href }) => (
                <a key={icon} href={href || '#'} className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 text-xs font-bold hover:text-gold hover:border-gold/20 transition-colors">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-gold text-[10.5px] font-bold tracking-[2.5px] uppercase mb-4">Propiedades</div>
            {links.map(link => (
              <Link key={link.id} to={link.url} className="block text-white/45 text-[12.5px] mb-2.5 hover:text-white/70 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <div className="text-gold text-[10.5px] font-bold tracking-[2.5px] uppercase mb-4">Contacto</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">+591 4 000 0000</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">Cochabamba, Bolivia</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">info@elitenuvia.bo</div>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-[12.5px] font-semibold hover:text-gold-light transition-colors"
            >
              WhatsApp directo →
            </a>
          </div>
        </div>

        <div className="border-t border-white/05 pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-white/25 text-[11.5px]">{cms.textoLegal ?? '© 2025 ELITE Nuvia. Todos los derechos reservados.'}</div>
          <div className="text-gold text-[11px] font-bold tracking-[3px]">TU HOGAR, NUESTRA PASION</div>
        </div>
      </div>
    </footer>
  )
}
