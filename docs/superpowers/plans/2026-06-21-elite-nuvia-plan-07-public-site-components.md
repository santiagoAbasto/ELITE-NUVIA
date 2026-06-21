# ELITE Nuvia — Plan 07: Sitio Publico — Componentes, Hero, Animaciones

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Implementar todos los componentes del sitio publico: Layout/Navbar/Footer/FAB, Logo SVG, Hero con video Higgsfield y animaciones char-by-char, Buscador con Leaflet, PropertyCard con stagger, Three.js particles, Stats con useCountUp, carrusel de agentes, testimonios con AnimatePresence, scroll animations, parallax y cursor personalizado.

**Architecture:** Componentes React en `apps/web/src/components/`. Cada seccion es un componente independiente montado en `HomePage.tsx`. Framer Motion para todas las animaciones de scroll. Three.js via @react-three/fiber solo en desktop (>768px).

**Tech Stack:** React 18 + Framer Motion 11 + Three.js + @react-three/fiber + @react-three/drei + Leaflet.js + React-Leaflet + TailwindCSS

---

### Task 1: Logo SVG + componentes UI base

**Files:**
- Create: `apps/web/src/components/ui/LogoSVG.tsx`
- Create: `apps/web/src/components/ui/FadeIn.tsx`
- Create: `apps/web/src/components/ui/AnimatedHeading.tsx`
- Create: `apps/web/src/components/ui/SectionEyebrow.tsx`
- Create: `apps/web/src/components/ui/CustomCursor.tsx`

- [ ] **Step 1: Crear LogoSVG.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/ui/LogoSVG.tsx
interface LogoSVGProps {
  variant?: 'dark' | 'light'
  size?: number
  showText?: boolean
}

export function LogoSVG({ variant = 'dark', size = 40, showText = true }: LogoSVGProps) {
  const gold = '#C9A84C'
  const green = variant === 'dark' ? '#0D3B27' : '#fff'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Circulo exterior */}
        <circle cx="32" cy="32" r="30" stroke={gold} strokeWidth="1.5" />
        {/* Circulo interior */}
        <circle cx="32" cy="32" r="24" stroke={gold} strokeWidth="0.8" opacity="0.5" />
        {/* Ornamentos laterales — media luna izquierda */}
        <path d="M10 32 Q16 22 22 32 Q16 42 10 32Z" stroke={gold} strokeWidth="1.2" fill="none" />
        {/* Ornamentos laterales — media luna derecha */}
        <path d="M54 32 Q48 22 42 32 Q48 42 54 32Z" stroke={gold} strokeWidth="1.2" fill="none" />
        {/* Cabeza de llave — circulo */}
        <circle cx="32" cy="18" r="6.5" stroke={green} strokeWidth="1.8" fill="none" />
        {/* Ojo de la llave */}
        <circle cx="32" cy="18" r="2.5" fill={gold} />
        {/* Cana de la llave */}
        <rect x="30.5" y="23" width="3" height="16" rx="1.5" fill={green} />
        {/* Diente superior */}
        <rect x="33.5" y="29" width="4.5" height="2.5" rx="1" fill={green} />
        {/* Diente inferior */}
        <rect x="33.5" y="33.5" width="3.5" height="2.5" rx="1" fill={green} />
      </svg>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', lineHeight: 1 }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: variant === 'dark' ? '#fff' : '#0A2416', letterSpacing: '4px' }}>
            ELITE
          </span>
          <span style={{ fontSize: '12px', fontStyle: 'italic', color: gold, fontFamily: "'Playfair Display', serif" }}>
            Nuvia
          </span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Crear FadeIn.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/ui/FadeIn.tsx
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  y?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 0.6, y = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeInView({ children, delay = 0, duration = 0.6, y = 24, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 3: Crear AnimatedHeading.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/ui/AnimatedHeading.tsx
import { useEffect, useState } from 'react'

interface AnimatedHeadingProps {
  lines: string[]
  className?: string
  initialDelay?: number
  charDelay?: number
}

export function AnimatedHeading({ lines, className, initialDelay = 200, charDelay = 30 }: AnimatedHeadingProps) {
  const [visible, setVisible] = useState<boolean[][]>(
    lines.map(line => new Array(line.length).fill(false))
  )

  useEffect(() => {
    let totalDelay = initialDelay
    const timeouts: ReturnType<typeof setTimeout>[] = []

    lines.forEach((line, li) => {
      line.split('').forEach((_, ci) => {
        const delay = totalDelay + ci * charDelay
        const t = setTimeout(() => {
          setVisible(prev => {
            const next = prev.map(row => [...row])
            next[li][ci] = true
            return next
          })
        }, delay)
        timeouts.push(t)
      })
      totalDelay += line.length * charDelay
    })

    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <h1 className={className}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {line.split('').map((char, ci) => (
            <span
              key={ci}
              style={{
                display: 'inline-block',
                opacity: visible[li]?.[ci] ? 1 : 0,
                transform: visible[li]?.[ci] ? 'translateX(0)' : 'translateX(-18px)',
                transition: 'opacity 500ms ease, transform 500ms ease',
              }}
            >
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
      ))}
    </h1>
  )
}
```

- [ ] **Step 4: Crear SectionEyebrow.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/ui/SectionEyebrow.tsx
interface SectionEyebrowProps { label: string; center?: boolean }

export function SectionEyebrow({ label, center }: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-3 mb-3 ${center ? 'justify-center' : ''}`}>
      {!center && <div className="w-6 h-px bg-gold" />}
      <span className="text-gold font-semibold text-[11px] tracking-[3px] uppercase">{label}</span>
    </div>
  )
}
```

- [ ] **Step 5: Crear CustomCursor.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/ui/CustomCursor.tsx
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [label, setLabel] = useState('')
  const [hidden, setHidden] = useState(false)
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const springX = useSpring(mouseX, { stiffness: 400, damping: 28 })
  const springY = useSpring(mouseY, { stiffness: 400, damping: 28 })
  const isMobile = useRef(typeof window !== 'undefined' && window.matchMedia('(pointer:coarse)').matches)

  useEffect(() => {
    if (isMobile.current) return
    const move = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    const enter = () => setHidden(false)
    const leave = () => setHidden(true)
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseenter', enter)
    document.addEventListener('mouseleave', leave)

    const onHover = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('[data-cursor="ver"]')) setLabel('VER')
      else if (el.closest('[data-cursor="perfil"]')) setLabel('PERFIL')
      else setLabel('')
    }
    window.addEventListener('mouseover', onHover)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseenter', enter)
      document.removeEventListener('mouseleave', leave)
      window.removeEventListener('mouseover', onHover)
    }
  }, [])

  if (isMobile.current) return null

  return (
    <motion.div
      style={{ x: springX, y: springY, translateX: '-50%', translateY: '-50%' }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      animate={{ opacity: hidden ? 0 : 1, scale: label ? 1.4 : 1 }}
    >
      <div className="w-8 h-8 rounded-full border-2 border-gold flex items-center justify-center bg-gold/10">
        {label && <span className="text-gold text-[8px] font-bold">{label}</span>}
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/web/src/components/ui/
git commit -m "feat: add LogoSVG, FadeIn, AnimatedHeading, SectionEyebrow, CustomCursor components"
```

---

### Task 2: Layout, Navbar, Footer, WhatsApp FAB

**Files:**
- Create: `apps/web/src/components/layout/Layout.tsx`
- Create: `apps/web/src/components/layout/Navbar.tsx`
- Create: `apps/web/src/components/layout/Footer.tsx`
- Create: `apps/web/src/components/layout/WhatsAppFAB.tsx`

- [ ] **Step 1: Crear Navbar.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/layout/Navbar.tsx
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
        style={{ background: solid ? 'rgba(8,14,9,0.88)' : 'transparent', backdropFilter: solid ? 'blur(18px)' : 'none', borderBottom: solid ? '1px solid rgba(201,168,76,0.08)' : 'none' }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="wrap">
          <div className="flex items-center justify-between h-[68px]">
            <Link to="/"><LogoSVG /></Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-8">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to}
                  className={`text-[13.5px] font-normal transition-colors duration-200 relative group ${location.pathname === link.to ? 'text-gold' : 'text-white/65 hover:text-white'}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-white/55 text-[13px]">+591 4 000 0000</span>
              <div className="w-px h-[18px] bg-white/12" />
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="border border-gold/40 text-gold px-4 py-2 rounded-lg text-[12.5px] font-semibold hover:bg-gold/10 transition-colors">
                WhatsApp
              </a>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-6 h-0.5 bg-white transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-green-deep flex flex-col pt-20 px-8"
          >
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className="text-white text-2xl font-light py-4 border-b border-white/10">
                {link.label}
              </Link>
            ))}
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="mt-8 bg-gold text-green-deep px-6 py-3 rounded-lg text-center font-bold">
              WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Crear Footer.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/layout/Footer.tsx
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
            {[['En venta', '/propiedades?tipo=VENTA'], ['En alquiler', '/propiedades?tipo=ALQUILER'], ['Anticretico', '/propiedades?tipo=ANTICRETICO'], ['Terrenos', '/propiedades?tipoInmueble=TERRENO'], ['Locales', '/propiedades?tipoInmueble=LOCAL']].map(([label, to]) => (
              <Link key={to} to={to} className="block text-white/45 text-[12.5px] mb-2.5 hover:text-white/70 transition-colors">{label}</Link>
            ))}
          </div>

          <div>
            <div className="text-gold text-[10.5px] font-bold tracking-[2.5px] uppercase mb-4">Contacto</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">+591 4 000 0000</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">Cochabamba, Bolivia</div>
            <div className="text-white/45 text-[12.5px] mb-2.5">info@elitenuvia.bo</div>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-gold text-[12.5px] font-semibold hover:text-gold-light transition-colors">
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
```

- [ ] **Step 3: Crear WhatsAppFAB.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/layout/WhatsAppFAB.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'
const WA_MESSAGE = encodeURIComponent('Hola! Vi una propiedad en ELITE Nuvia y me gustaria mas informacion.')

export function WhatsAppFAB() {
  const [hovering, setHovering] = useState(false)

  return (
    <motion.div
      className="fixed bottom-7 right-7 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 300, damping: 20 }}
    >
      <AnimatePresence>
        {hovering && (
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="absolute right-16 top-1/2 -translate-y-1/2 bg-white text-green-deep text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg"
          >
            Hablar con un agente
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
        target="_blank" rel="noopener noreferrer"
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: '#25D366', boxShadow: '0 4px 24px rgba(37,211,102,0.45)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setHovering(true)}
        onHoverEnd={() => setHovering(false)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </motion.a>
    </motion.div>
  )
}
```

- [ ] **Step 4: Crear Layout.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { WhatsAppFAB } from './WhatsAppFAB'
import { CustomCursor } from '../ui/CustomCursor'

export default function Layout() {
  return (
    <>
      <CustomCursor />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFAB />
    </>
  )
}
```

- [ ] **Step 5: Verificar que el layout carga**

```bash
cd /Users/user/Desktop/ELITE/apps/web && pnpm dev
```

Abrir http://localhost:3000 — verificar navbar visible, logo SVG, links, FAB WhatsApp en esquina.

- [ ] **Step 6: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/web/src/components/layout/
git commit -m "feat: add Layout, Navbar (liquid glass sticky), Footer, WhatsApp FAB with Framer Motion"
```

---

### Task 3: HeroSection con video y animaciones

**Files:**
- Create: `apps/web/src/components/home/HeroSection.tsx`
- Create: `apps/web/src/components/home/HeroTagCard.tsx`
- Create: `apps/web/src/hooks/useProperties.ts`

- [ ] **Step 1: Crear useProperties.ts hook**

```typescript
// /Users/user/Desktop/ELITE/apps/web/src/hooks/useProperties.ts
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { PropiedadPublica, PropiedadesCount } from '@elite/types'

export function usePropiedadesDestacadas() {
  const [data, setData] = useState<PropiedadPublica[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.propiedades.destacadas().then(setData).finally(() => setLoading(false))
  }, [])
  return { data, loading }
}

export function usePropiedadesCount() {
  const [data, setData] = useState<PropiedadesCount>({ venta: 0, alquiler: 0, anticretico: 0, total: 0 })
  useEffect(() => {
    api.propiedades.count().then(setData).catch(() => {})
  }, [])
  return data
}
```

- [ ] **Step 2: Crear HeroTagCard.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/home/HeroTagCard.tsx
import { FadeIn } from '../ui/FadeIn'
import { usePropiedadesCount } from '../../hooks/useProperties'

export function HeroTagCard() {
  const counts = usePropiedadesCount()
  const ciudades = ['Cochabamba', 'Santa Cruz', 'La Paz', 'Oruro']

  return (
    <FadeIn delay={1400} y={0}>
      <div className="liquid-glass border border-white/18 rounded-xl p-5 min-w-[240px]">
        <div className="text-white/35 text-[10px] font-semibold tracking-[2.5px] uppercase mb-4">Disponible ahora</div>
        {[
          { label: 'Venta', count: counts.venta, active: true },
          { label: 'Alquiler', count: counts.alquiler, active: true },
          { label: 'Anticretico', count: counts.anticretico, active: false },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-white/06 last:border-0">
            <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-gold' : 'bg-white/30'}`} />
            <span className="text-white/85 text-[14px] font-medium flex-1">{item.label}</span>
            <span className="text-gold text-[11px] font-semibold">{item.count} inmuebles</span>
          </div>
        ))}
        <div className="mt-4 pt-3.5 border-t border-white/06">
          <div className="text-white/30 text-[10px] tracking-[1.5px] uppercase mb-2">Ciudades</div>
          <div className="flex flex-wrap gap-1.5">
            {ciudades.map(c => (
              <span key={c} className="bg-white/06 text-white/55 px-2.5 py-0.5 rounded-full text-[11px]">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
```

- [ ] **Step 3: Crear HeroSection.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/home/HeroSection.tsx
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AnimatedHeading } from '../ui/AnimatedHeading'
import { FadeIn } from '../ui/FadeIn'
import { HeroTagCard } from './HeroTagCard'

const VIDEO_URL = import.meta.env.VITE_HERO_VIDEO_URL ?? ''
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  const videoScale = useTransform(scrollY, [0, 500], [1, 1.08])
  const videoOpacity = useTransform(scrollY, [0, 400], [1, 0.3])
  const contentY = useTransform(scrollY, [0, 300], [0, -60])
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 100], [1, 0])

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* Video / fallback background */}
      <motion.div className="absolute inset-0" style={{ scale: videoScale, opacity: videoOpacity }}>
        {VIDEO_URL ? (
          <video
            autoPlay loop muted playsInline preload="none"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={VIDEO_URL} type="video/mp4" />
          </video>
        ) : null}
        {/* Fallback gradient (siempre visible debajo del video) */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(26,92,58,0.55) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 75% 70%, rgba(13,59,39,0.6) 0%, transparent 60%), linear-gradient(160deg, #091a0f 0%, #0D3B27 45%, #0a1e10 100%)'
        }} />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{ background: 'linear-gradient(0deg, rgba(8,14,9,0.85) 0%, transparent 100%)' }} />

      {/* Content */}
      <motion.div className="relative z-10 pb-14" style={{ y: contentY }}>
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-end">
            <div>
              <FadeIn delay={100} y={0}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-gold" />
                  <span className="text-gold text-[11px] font-semibold tracking-[3px] uppercase">Inmobiliaria Premium Bolivia</span>
                </div>
              </FadeIn>

              <AnimatedHeading
                lines={['Tu hogar ideal,', 'nuestra pasion.']}
                className="text-[42px] md:text-[56px] lg:text-[68px] font-bold leading-[1.03] mb-5"
                style={{ letterSpacing: '-0.035em', color: '#fff' }}
              />

              <FadeIn delay={900} y={0}>
                <p className="text-white/55 text-base md:text-lg font-light mb-8 leading-relaxed">
                  Venta · Alquiler · Anticretico<br />
                  <span className="text-white/40">Cochabamba · Santa Cruz · La Paz · Oruro</span>
                </p>
              </FadeIn>

              <FadeIn delay={1200} y={20}>
                <div className="flex flex-wrap gap-3">
                  <Link to="/propiedades"
                    className="bg-gold text-green-deep px-7 py-3.5 rounded-lg text-[13px] font-bold inline-flex items-center gap-2 hover:bg-gold-light transition-colors">
                    Explorar propiedades
                  </Link>
                  <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                    className="liquid-glass border border-white/18 text-white px-7 py-3.5 rounded-lg text-[13px] font-medium inline-flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Hablar con agente
                  </a>
                </div>
              </FadeIn>
            </div>

            {/* Tag card — desktop only */}
            <div className="hidden lg:block">
              <HeroTagCard />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ opacity: scrollIndicatorOpacity }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-gold"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent" />
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 4: Actualizar apps/web/.env con la URL del video Higgsfield**

```bash
# Despues de generar el video con Higgsfield, agregar al .env:
echo "VITE_HERO_VIDEO_URL=https://d8j0ntlcm91z4.cloudfront.net/tu-video-elite-nuvia.mp4" >> /Users/user/Desktop/ELITE/apps/web/.env
```

Por ahora dejar en blanco — el hero muestra el gradiente verde como fallback.

- [ ] **Step 5: Montar HeroSection en HomePage**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/pages/HomePage.tsx
import { HeroSection } from '../components/home/HeroSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
    </div>
  )
}
```

- [ ] **Step 6: Verificar en browser**

```bash
cd /Users/user/Desktop/ELITE/apps/web && pnpm dev
```

Abrir http://localhost:3000 y verificar:
- Navbar transparente que se vuelve solido al scrollear
- Hero con gradiente verde + texto animado char-by-char
- Tag card con contadores (ceros si la API no esta corriendo)
- Scroll indicator rebotando
- FAB WhatsApp aparece con delay

- [ ] **Step 7: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/web/src/
git commit -m "feat: add HeroSection with parallax video, char-by-char heading, FadeIn animations and HeroTagCard"
```

---

### Task 4: Three.js ParticlesCanvas + ServicesSection

**Files:**
- Create: `apps/web/src/components/home/ParticlesCanvas.tsx`
- Create: `apps/web/src/components/home/ServicesSection.tsx`

- [ ] **Step 1: Crear ParticlesCanvas.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/home/ParticlesCanvas.tsx
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

function GoldParticles() {
  const groupRef = useRef<THREE.Group>(null)
  const particles = useMemo(() =>
    Array.from({ length: 200 }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ] as [number, number, number],
      speed: Math.random() * 0.3 + 0.1,
      size: Math.random() * 0.04 + 0.01,
    })), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.04
    groupRef.current.rotation.x += delta * 0.01
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 4, 4]} />
          <meshBasicMaterial color="#C9A84C" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function ParticlesCanvas() {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  if (!isDesktop) return null

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.5} />
        <GoldParticles />
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 2: Crear ServicesSection.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/home/ServicesSection.tsx
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
  },
  {
    icon: '🗝️',
    name: 'ALQUILER',
    title: 'Alquiler',
    desc: 'Encuentra el inmueble perfecto o alquila el tuyo con respaldo total. Gestion de contratos, garantias y seguimiento mensual incluidos.',
    cta: 'Ver inmuebles en alquiler',
    href: '/propiedades?tipo=ALQUILER',
    featured: true,
  },
  {
    icon: '🤝',
    name: 'ANTICRETICO',
    title: 'Anticretico',
    desc: 'Modalidad exclusiva de Bolivia. Entrega un monto y vive en la propiedad por el tiempo acordado sin pagar renta mensual. Al finalizar, recuperas tu inversion.',
    cta: 'Ver opciones disponibles',
    href: '/propiedades?tipo=ANTICRETICO',
    hint: 'Como funciona el anticretico?',
  },
]

export function ServicesSection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ background: 'var(--green-deep)' }}>
      <ParticlesCanvas />
      {/* Glow effects */}
      <div className="absolute w-[600px] h-[600px] rounded-full -top-52 -left-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)' }} />
      <div className="absolute w-[600px] h-[600px] rounded-full -bottom-52 -right-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />

      <div className="wrap relative z-10">
        <FadeInView className="text-center mb-14">
          <SectionEyebrow label="Lo que hacemos" center />
          <h2 className="text-[38px] font-bold text-white mt-2" style={{ letterSpacing: '-0.02em' }}>
            Nuestros <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>Servicios</em>
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
              {/* Top line */}
              <div className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

              <div className="w-14 h-14 rounded-[14px] border border-gold/20 bg-gold/10 flex items-center justify-center text-2xl mb-6">
                {svc.icon}
              </div>
              <div className="text-[11px] text-gold font-bold tracking-[3px] uppercase mb-2.5">{svc.name}</div>
              <h3 className="text-[26px] font-bold text-white mb-3.5 leading-tight">{svc.title}</h3>
              <p className="text-white/50 text-[13.5px] leading-[1.7] mb-7">{svc.desc}</p>
              <a href={svc.href} className="flex items-center gap-2 text-gold text-[12.5px] font-semibold">
                <div className="w-7 h-7 rounded-full border border-gold/30 flex items-center justify-center text-xs">→</div>
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
```

- [ ] **Step 3: Crear StatsSection.tsx**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/components/home/StatsSection.tsx
import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

function useCountUp(target: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])
  return count
}

const STATS = [
  { value: 500, prefix: '+', label: 'Propiedades gestionadas' },
  { value: 8, prefix: '+', label: 'Anos de experiencia' },
  { value: 200, prefix: '+', label: 'Familias satisfechas' },
  { value: 4, prefix: '', label: 'Ciudades en Bolivia' },
]

function StatItem({ value, prefix, label, inView }: { value: number; prefix: string; label: string; inView: boolean }) {
  const count = useCountUp(value, 2000, inView)
  return (
    <div className="text-center px-5">
      <div className="text-[52px] font-extrabold leading-none" style={{ color: 'var(--gold)', letterSpacing: '-0.03em' }}>
        {prefix}{count.toLocaleString()}
      </div>
      <div className="text-white/45 text-[12px] mt-2.5 tracking-[1.5px] uppercase font-medium">{label}</div>
    </div>
  )
}

export function StatsSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-[72px]" style={{ background: 'linear-gradient(105deg, #0D3B27 0%, #0A2416 100%)', borderTop: '1px solid rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}>
      <div className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {STATS.map((stat, i) => (
            <div key={i} className={i > 0 ? 'border-l border-gold/15' : ''}>
              <StatItem {...stat} inView={inView} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Montar secciones en HomePage**

```tsx
// /Users/user/Desktop/ELITE/apps/web/src/pages/HomePage.tsx
import { HeroSection } from '../components/home/HeroSection'
import { ServicesSection } from '../components/home/ServicesSection'
import { StatsSection } from '../components/home/StatsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
    </div>
  )
}
```

- [ ] **Step 5: Verificar Three.js y stats en browser**

```bash
pnpm dev
```

Abrir http://localhost:3000, scrollear hasta Services — verificar particulas doradas flotando. Scrollear hasta Stats — verificar que los contadores arrancan al entrar en viewport.

- [ ] **Step 6: Commit**

```bash
cd /Users/user/Desktop/ELITE
git add apps/web/src/
git commit -m "feat: add Three.js ParticlesCanvas, ServicesSection with 3D hover, StatsSection with useCountUp"
```
