import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'
const WA_MESSAGE = encodeURIComponent('Hola! Vi una propiedad en ELITE Nuvia y me gustaria mas informacion.')

export function WhatsAppFAB() {
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const btnRef = useRef<HTMLAnchorElement>(null)

  const magnetX = useMotionValue(0)
  const magnetY = useMotionValue(0)
  const springX = useSpring(magnetX, { stiffness: 350, damping: 28 })
  const springY = useSpring(magnetY, { stiffness: 350, damping: 28 })

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2200)
    return () => clearTimeout(t)
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    magnetX.set((e.clientX - cx) * 0.32)
    magnetY.set((e.clientY - cy) * 0.32)
  }

  function handleMouseLeave() {
    magnetX.set(0)
    magnetY.set(0)
    setHovering(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/*
            Anillos de pulso como elementos FIXED independientes
            — no están dentro del botón, por eso no se cortan por el borde del viewport.
            El botón está en bottom: 88px right: 88px (64px + 24px margen)
            Los rings escalan 2x máx = extienden 32px → safe con 88px de margen
          */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="fixed rounded-full pointer-events-none"
              style={{
                width: '56px',
                height: '56px',
                bottom: '28px',
                right: '28px',
                zIndex: 49,
                background: hovering
                  ? 'rgba(37,211,102,0.4)'
                  : 'rgba(37,211,102,0.28)',
                transformOrigin: 'center center',
              }}
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1.9, 2.6],
                opacity: [0.55, 0.18, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                delay: 2.2 + i * 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}

          {/* Tooltip — aparece a la izquierda del botón */}
          <AnimatePresence>
            {hovering && (
              <motion.div
                className="fixed z-[51] pointer-events-none"
                style={{ bottom: '38px', right: '88px' }}
                initial={{ opacity: 0, x: 10, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.92 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative bg-white text-[#0A2416] text-[12px] font-bold px-4 py-2.5 rounded-xl whitespace-nowrap"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  Hablar con un agente
                  <div
                    className="absolute right-[-7px] top-1/2 -translate-y-1/2"
                    style={{
                      width: 0, height: 0,
                      borderTop: '7px solid transparent',
                      borderBottom: '7px solid transparent',
                      borderLeft: '7px solid white',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón principal */}
          <motion.div
            className="fixed z-50"
            style={{ bottom: '28px', right: '28px' }}
            initial={{ scale: 0, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 2.2, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <motion.a
              ref={btnRef}
              href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #2ecc71 0%, #25D366 50%, #1da851 100%)',
                boxShadow: hovering
                  ? '0 12px 48px rgba(37,211,102,0.7), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3)'
                  : '0 6px 28px rgba(37,211,102,0.5), 0 2px 8px rgba(0,0,0,0.2)',
                x: springX,
                y: springY,
                transition: 'box-shadow 0.3s ease',
              }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={handleMouseLeave}
              aria-label="Contactar por WhatsApp"
            >
              {/* Brillo interior en hover */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), transparent 65%)' }}
                animate={{ opacity: hovering ? 1 : 0.5 }}
                transition={{ duration: 0.3 }}
              />

              {/* Icono con wiggle en hover */}
              <motion.div
                animate={hovering ? { rotate: [0, -10, 10, -5, 5, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </motion.div>
            </motion.a>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
