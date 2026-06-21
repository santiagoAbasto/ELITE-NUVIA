import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

interface Reveal3DProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'scale'
}

/**
 * Animación de entrada 3D premium al hacer scroll.
 * Combina translateZ, rotateX y opacity para efecto depth cinematográfico.
 */
export function Reveal3D({ children, className, delay = 0, direction = 'up' }: Reveal3DProps) {
  const initial = {
    up:    { opacity: 0, y: 48, rotateX: 12, scale: 0.97 },
    left:  { opacity: 0, x: -48, rotateY: -10, scale: 0.97 },
    right: { opacity: 0, x: 48, rotateY: 10, scale: 0.97 },
    scale: { opacity: 0, scale: 0.88, rotateX: 8 },
  }[direction]

  const animate = {
    up:    { opacity: 1, y: 0, rotateX: 0, scale: 1 },
    left:  { opacity: 1, x: 0, rotateY: 0, scale: 1 },
    right: { opacity: 1, x: 0, rotateY: 0, scale: 1 },
    scale: { opacity: 1, scale: 1, rotateX: 0 },
  }[direction]

  return (
    <motion.div
      className={className}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Parallax scroll 3D — el elemento se mueve a diferente velocidad al scrollear.
 * Ideal para imágenes, badges flotantes, elementos decorativos.
 */
export function Parallax3D({
  children,
  className,
  speed = 0.15,
  rotateOnScroll = false,
}: {
  children: ReactNode
  className?: string
  speed?: number
  rotateOnScroll?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [`${-speed * 100}px`, `${speed * 100}px`]),
    { stiffness: 80, damping: 20 }
  )

  const rotateX = rotateOnScroll
    ? useTransform(scrollYProgress, [0, 1], [6, -6])
    : undefined

  return (
    <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
      <motion.div style={{ y, rotateX, transformStyle: 'preserve-3d' }}>
        {children}
      </motion.div>
    </div>
  )
}

/**
 * CounterReveal — número grande que aparece contando desde 0
 * con efecto 3D de entrada desde abajo.
 */
export function NumberReveal3D({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30, rotateX: 20, scale: 0.85 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
    >
      {children}
    </motion.div>
  )
}
