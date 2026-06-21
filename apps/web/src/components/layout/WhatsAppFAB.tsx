import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'
const WA_MESSAGE = encodeURIComponent('Hola! Vi una propiedad en ELITE Nuvia y me gustaria mas informacion.')

const WA_ICON = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function WhatsAppFAB() {
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible] = useState(false)
  const btnRef = useRef<HTMLAnchorElement>(null)

  // Magnetic effect
  const magnetX = useMotionValue(0)
  const magnetY = useMotionValue(0)
  const springX = useSpring(magnetX, { stiffness: 350, damping: 28 })
  const springY = useSpring(magnetY, { stiffness: 350, damping: 28 })

  // Appear after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(t)
  }, [])

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) * 0.35
    const dy = (e.clientY - cy) * 0.35
    magnetX.set(dx)
    magnetY.set(dy)
  }

  function handleMouseLeave() {
    magnetX.set(0)
    magnetY.set(0)
    setHovering(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-7 right-7 z-50"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        >
          {/* Pulse rings — 3 anillos que se expanden */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(37,211,102,0.35)' }}
              animate={{
                scale: [1, 2.2, 2.8],
                opacity: [0.5, 0.15, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Tooltip */}
          <AnimatePresence>
            {hovering && (
              <motion.div
                initial={{ opacity: 0, x: 12, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 12, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-[68px] top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div
                  className="relative bg-white text-[#0A2416] text-[12px] font-bold px-3.5 py-2 rounded-xl whitespace-nowrap"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
                >
                  Hablar con un agente
                  {/* Arrow */}
                  <div
                    className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0"
                    style={{
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: '6px solid white',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón principal */}
          <motion.a
            ref={btnRef}
            href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-14 h-14 rounded-full flex items-center justify-center block"
            style={{
              background: 'linear-gradient(135deg, #2ecc71, #25D366, #1da851)',
              boxShadow: hovering
                ? '0 8px 40px rgba(37,211,102,0.65), 0 2px 8px rgba(0,0,0,0.3)'
                : '0 4px 24px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.2)',
              x: springX,
              y: springY,
            }}
            whileTap={{ scale: 0.88 }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={handleMouseLeave}
            aria-label="Contactar por WhatsApp"
          >
            {/* Inner glow on hover */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              animate={{ opacity: hovering ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              animate={{ rotate: hovering ? [0, -8, 8, 0] : 0 }}
              transition={{ duration: 0.4 }}
            >
              {WA_ICON}
            </motion.div>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
