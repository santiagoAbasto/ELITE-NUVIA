import { useRef } from 'react'
import { motion } from 'framer-motion'
import { AgentCard } from './AgentCard'
import { SectionEyebrow } from '../ui/SectionEyebrow'
import { FadeInView } from '../ui/FadeIn'
import { useAgentes } from '../../hooks/useAgentes'

export function AgentsSection() {
  const { data: agentes, loading } = useAgentes()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-24 overflow-hidden" style={{ background: 'var(--cream)' }}>
      <div className="wrap">
        <FadeInView className="mb-10">
          <SectionEyebrow label="Nuestro equipo" />
          <h2
            className="text-[38px] font-bold mt-1"
            style={{ color: 'var(--text-dark)', letterSpacing: '-0.02em' }}
          >
            Un equipo{' '}
            <em
              className="not-italic"
              style={{
                color: 'var(--green-main)',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              comprometido
            </em>{' '}
            contigo
          </h2>
          <p className="text-[var(--text-muted)] text-[14px] mt-2 max-w-[480px]">
            Profesionales con anos de experiencia en el mercado inmobiliario boliviano. Arrastra para ver mas.
          </p>
        </FadeInView>
      </div>

      {/* Carrusel — full width con overflow visible */}
      <div className="pl-[71px] md:pl-[calc((100vw-1366px)/2+71px)]">
        {loading ? (
          <div className="flex gap-5 pb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[220px] h-[280px] rounded-[18px] bg-black/05 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            ref={containerRef}
            className="flex gap-5 pb-4"
            drag="x"
            dragConstraints={containerRef}
            style={{ cursor: 'grab', width: 'max-content' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            {agentes.map((agente, i) => (
              <motion.div
                key={agente.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <AgentCard agente={agente} />
              </motion.div>
            ))}
            {/* Padding final */}
            <div className="flex-shrink-0 w-[40px]" />
          </motion.div>
        )}
      </div>
    </section>
  )
}
