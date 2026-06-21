import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { LogoSVG } from '../ui/LogoSVG'

const NAV_LINKS = [
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/nosotros#agentes', label: 'Agentes' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

export function Navbar() {
  const [solid, setSolid] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()
  const location = useLocation()

  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 50))

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: solid ? 'rgba(8,14,9,0.88)' : 'transparent',
          backdropFilter: solid ? 'blur(18px)' : 'none',
          borderBottom: solid ? '1px solid rgba(201,168,76,0.08)' : 'none',
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="wrap">
          <div className="flex items-center justify-between h-[68px]">
            <Link to="/"><LogoSVG /></Link>

            <nav className="hidden md:flex gap-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[13.5px] font-normal transition-colors duration-200 relative group ${location.pathname === link.to ? 'text-gold' : 'text-white/65 hover:text-white'}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <span className="text-white/55 text-[13px]">+591 4 000 0000</span>
              <div className="w-px h-[18px] bg-white/12" />
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gold/40 text-gold px-4 py-2 rounded-lg text-[12.5px] font-semibold hover:bg-gold/10 transition-colors"
              >
                WhatsApp
              </a>
            </div>

            <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-green-deep flex flex-col pt-20 px-8"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-white text-2xl font-light py-4 border-b border-white/10"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 bg-gold text-green-deep px-6 py-3 rounded-lg text-center font-bold"
            >
              WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
