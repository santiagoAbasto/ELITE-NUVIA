import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PropertyCard } from './PropertyCard'
import { SectionEyebrow } from '../ui/SectionEyebrow'
import { usePropiedadesDestacadas } from '../../hooks/useProperties'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
    rotateX: 15,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1] as number[],
      rotateX: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 14,
        delay: i * 0.12,
      },
    },
  }),
}

const TITLE_WORDS = ['Inmuebles', 'Seleccionados']

export function PropertiesSection() {
  const { data: propiedades, loading } = usePropiedadesDestacadas()

  return (
    <section className="py-24" style={{ background: '#080e09' }}>
      <div className="wrap">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            {/* Eyebrow with clip-path reveal */}
            <motion.div
              initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <SectionEyebrow label="Propiedades destacadas" />
            </motion.div>

            {/* Title word-by-word blur reveal */}
            <h2
              className="text-[38px] font-bold text-white mt-1"
              style={{ letterSpacing: '-0.02em' }}
            >
              {TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  className={`inline-block ${i < TITLE_WORDS.length - 1 ? 'mr-3' : ''}`}
                  initial={{ opacity: 0, y: 30, filter: 'blur(12px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + i * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {i === TITLE_WORDS.length - 1 ? (
                    <em
                      className="not-italic text-gold"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {word}
                    </em>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/propiedades"
              className="hidden md:flex items-center gap-2 text-gold text-[13px] font-semibold hover:text-gold-light transition-colors"
            >
              Ver todas
              <span className="text-lg leading-none">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-[16px] bg-white/04 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]"
            style={{ perspective: '1200px' }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {propiedades.map((p, index) => (
              <motion.div
                key={p.id}
                variants={cardVariants}
                custom={index}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <PropertyCard propiedad={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/propiedades"
            className="inline-flex items-center gap-2 border border-gold/30 text-gold px-8 py-3.5 rounded-lg text-[13px] font-semibold hover:bg-gold/08 transition-colors"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>
    </section>
  )
}
