import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo: accelerates at start, decelerates at end
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return count
}

export interface StatsSectionItem {
  value: number
  prefix: string
  suffix: string
  label: string
  sublabel: string
}

const STATS: StatsSectionItem[] = [
  { value: 500, prefix: '+', suffix: '', label: 'Propiedades gestionadas', sublabel: 'en Bolivia' },
  { value: 8, prefix: '+', suffix: '', label: 'Años de experiencia', sublabel: 'en el mercado' },
  { value: 200, prefix: '+', suffix: '', label: 'Familias satisfechas', sublabel: 'y contando' },
  { value: 4, prefix: '', suffix: '', label: 'Ciudades activas', sublabel: 'en Bolivia' },
]

function StatItem({
  value, prefix, suffix, label, sublabel, inView, index, total,
}: {
  value: number
  prefix: string
  suffix: string
  label: string
  sublabel: string
  inView: boolean
  index: number
  total: number
}) {
  const count = useCountUp(value, 1800, inView)

  return (
    <motion.div
      className="text-center px-6 relative"
      initial={{ opacity: 0, y: 60, rotateX: 45 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
        rotateX: {
          type: 'spring',
          stiffness: 120,
          damping: 14,
          delay: index * 0.15,
        },
      }}
      style={{ perspective: 600, transformStyle: 'preserve-3d' }}
    >
      {/* Number with spring scale-in */}
      <motion.div
        className="relative"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{
          duration: 0.6,
          delay: 0.2 + index * 0.15,
          type: 'spring',
          stiffness: 200,
          damping: 16,
        }}
      >
        <span
          className="block font-black leading-none tracking-tighter"
          style={{
            fontSize: 'clamp(52px, 6vw, 72px)',
            color: '#C9A84C',
            textShadow: inView ? '0 0 60px rgba(201,168,76,0.35)' : 'none',
            transition: 'text-shadow 1s',
          }}
        >
          {prefix}{count.toLocaleString()}{suffix}
        </span>
      </motion.div>

      {/* Label stagger */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
      >
        <div className="text-white/80 text-[14px] font-semibold mt-3 tracking-wide">{label}</div>
        <div className="text-white/30 text-[11px] mt-1 tracking-widest uppercase">{sublabel}</div>
      </motion.div>

      {/* Animated divider (not on last item) */}
      {index < total - 1 && (
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-px origin-center"
          style={{ height: '60px', background: 'rgba(201,168,76,0.2)' }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </motion.div>
  )
}

export function StatsSection({ stats = STATS }: { stats?: StatsSectionItem[] }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(108deg, #0D3B27 0%, #091e10 50%, #0A2416 100%)' }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Top border reveal */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px origin-left"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
        }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} {...stat} inView={inView} index={i} total={stats.length} />
          ))}
        </div>
      </div>

      {/* Bottom border reveal */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px origin-left"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent)',
        }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  )
}
