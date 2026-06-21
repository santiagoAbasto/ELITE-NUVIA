import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  meta?: string
  className?: string
}

export function PageHeader({ eyebrow, title, subtitle, meta, className = '' }: PageHeaderProps) {
  return (
    <div
      className={`relative pt-28 pb-14 ${className}`}
      style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}
    >
      {/* Línea top dorada */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }}
      />

      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {eyebrow && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-gold" />
              <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">
                {eyebrow}
              </span>
            </div>
          )}
          <h1
            className="text-[36px] md:text-[44px] font-bold text-white leading-[1.08]"
            style={{ letterSpacing: '-0.025em' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/45 text-[14px] md:text-[15px] mt-3 max-w-[540px] leading-relaxed">
              {subtitle}
            </p>
          )}
          {meta && (
            <div className="text-white/25 text-[12.5px] mt-2">{meta}</div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
