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
