import { Link } from 'react-router-dom'
import { LogoSVG } from '../ui/LogoSVG'
import { useCmsSection } from '../../hooks/useCmsSection'
import { DEFAULT_CMS_DATA } from '../../lib/cmsDefaults'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

function FacebookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function WhatsappIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.29-1.39a9.87 9.87 0 0 0 4.7 1.2h.01c5.46 0 9.91-4.45 9.91-9.9C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.16-4.9-4.36-.14-.2-1.17-1.56-1.17-2.98s.75-2.11 1.02-2.4c.27-.29.58-.36.78-.36l.55.01c.18.01.42-.07.65.5.24.58.83 2 .9 2.15.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2.01 1.11 1 2.05 1.31 2.34 1.46.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.68.79 1.97.94.29.15.48.22.55.34.07.13.07.72-.17 1.4Z" />
    </svg>
  )
}

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
    <footer style={{ background: '#060e08' }} className="pt-20 pb-10">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          <div className="md:col-span-2">
            <LogoSVG />
            <p className="text-white/38 text-[13px] leading-relaxed mt-4 max-w-[240px]">
              {cms.descripcion ?? 'Tu hogar, tu futuro, nuestra prioridad. Inmobiliaria de excelencia en Bolivia con mas de 8 anos conectando familias con su hogar ideal.'}
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: 'facebook', href: cms.socialFacebook, svg: <FacebookIcon /> },
                { icon: 'instagram', href: cms.socialInstagram, svg: <InstagramIcon /> },
                { icon: 'whatsapp', href: `https://wa.me/${whatsapp}`, svg: <WhatsappIcon /> },
              ].map(({ icon, href, svg }) => (
                <a
                  key={icon}
                  href={href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={icon}
                  className="w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/20 transition-colors"
                >
                  {svg}
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

        <div className="mt-16">
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.28), rgba(255,255,255,0.09) 42%, rgba(201,168,76,0.20))' }}
          />
          <div className="flex flex-col items-start justify-between gap-4 pt-8 md:flex-row md:items-center md:pr-24">
            <div className="text-white/25 text-[11.5px] leading-relaxed">
              {cms.textoLegal ?? '© 2025 ELITE Nuvia. Todos los derechos reservados.'}
            </div>
            <div className="text-gold text-[11px] font-bold tracking-[3px]">
              TU HOGAR, NUESTRA PASION
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
