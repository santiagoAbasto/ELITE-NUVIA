import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TestimonioCard } from './TestimonioCard'
import { SectionEyebrow } from '../ui/SectionEyebrow'
import { FadeInView } from '../ui/FadeIn'
import { useTestimonios } from '../../hooks/useTestimonios'

export function TestimonialsSection() {
  const { data: testimonios, loading } = useTestimonios()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (testimonios.length === 0) return
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % testimonios.length)
    }, 5500)
    return () => clearInterval(interval)
  }, [testimonios.length])

  return (
    <section
      className="py-24"
      style={{ background: 'linear-gradient(180deg, #080e09 0%, #0A2416 50%, #080e09 100%)' }}
    >
      <div className="wrap">
        <FadeInView className="text-center mb-14">
          <SectionEyebrow label="Testimonios" center />
          <h2
            className="text-[38px] font-bold text-white mt-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            Lo que dicen{' '}
            <em
              className="not-italic text-gold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              nuestros clientes
            </em>
          </h2>
        </FadeInView>

        {!loading && testimonios.length > 0 && (
          <div className="relative min-h-[280px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <TestimonioCard testimonio={testimonios[active]} />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Dots */}
        {!loading && testimonios.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {testimonios.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                className="h-1.5 rounded-full transition-all duration-300 bg-gold/40"
                animate={{ width: i === active ? 28 : 6, opacity: i === active ? 1 : 0.4 }}
                style={{ background: '#C9A84C' }}
                aria-label={`Testimonio ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
