import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

function useCountUp(target: number, duration: number, inView: boolean) {
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
      <div
        className="text-[52px] font-extrabold leading-none"
        style={{ color: 'var(--gold)', letterSpacing: '-0.03em' }}
      >
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
    <section
      ref={ref}
      className="py-[72px]"
      style={{
        background: 'linear-gradient(105deg, #0D3B27 0%, #0A2416 100%)',
        borderTop: '1px solid rgba(201,168,76,0.12)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
      }}
    >
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
