import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PropertyCard } from './PropertyCard'
import { SectionEyebrow } from '../ui/SectionEyebrow'
import { FadeInView } from '../ui/FadeIn'
import { usePropiedadesDestacadas } from '../../hooks/useProperties'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as number[] },
  },
}

export function PropertiesSection() {
  const { data: propiedades, loading } = usePropiedadesDestacadas()

  return (
    <section className="py-24" style={{ background: '#080e09' }}>
      <div className="wrap">
        <FadeInView className="flex items-end justify-between mb-12">
          <div>
            <SectionEyebrow label="Propiedades destacadas" />
            <h2
              className="text-[38px] font-bold text-white mt-1"
              style={{ letterSpacing: '-0.02em' }}
            >
              Inmuebles{' '}
              <em
                className="not-italic text-gold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Seleccionados
              </em>
            </h2>
          </div>
          <Link
            to="/propiedades"
            className="hidden md:flex items-center gap-2 text-gold text-[13px] font-semibold hover:text-gold-light transition-colors"
          >
            Ver todas
            <span className="text-lg leading-none">→</span>
          </Link>
        </FadeInView>

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
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {propiedades.map(p => (
              <motion.div key={p.id} variants={cardVariants}>
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
