import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [nombre, setNombre] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre: nombre || undefined }),
      })
      const data = await res.json() as { message: string }
      setMessage(data.message)
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) { setEmail(''); setNombre('') }
    } catch {
      setMessage('Error de conexion. Intenta de nuevo.')
      setStatus('error')
    }
  }

  return (
    <section
      ref={ref}
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #060e08 0%, #0D3B27 50%, #060e08 100%)' }}
    >
      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[600px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(26,92,58,0.8) 0%, transparent 70%)' }}
        />
      </div>

      {/* Línea decorativa top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }}
      />

      <div className="wrap relative z-10">
        <div className="max-w-[640px] mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-gold/25 bg-gold/[0.08]">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">
                Novedades inmobiliarias
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="text-[36px] md:text-[44px] font-bold text-white mb-4 leading-[1.08]"
            style={{ letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Las mejores propiedades,
            <br />
            <em
              className="not-italic text-gold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              directo a tu correo.
            </em>
          </motion.h2>

          <motion.p
            className="text-white/45 text-[14px] leading-relaxed mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            Recibe cada semana las nuevas propiedades en venta, alquiler y anticretico antes que nadie.
            Sin spam, solo las mejores oportunidades del mercado boliviano.
          </motion.p>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-900/20 border border-green-500/25 rounded-2xl p-8"
              >
                <div className="w-14 h-14 rounded-full bg-green-900/30 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="text-white font-bold text-lg mb-1">¡Listo!</div>
                <div className="text-white/55 text-[13px]">{message}</div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Nombre + Email en fila */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tu nombre (opcional)"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="flex-1 min-w-0 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[13.5px] placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                  />
                  <div className="flex-[1.5] flex gap-2">
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="flex-1 min-w-0 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3.5 text-white text-[13.5px] placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                    />
                    <motion.button
                      type="submit"
                      disabled={status === 'loading' || !email}
                      className="px-6 py-3.5 rounded-xl font-bold text-[13px] whitespace-nowrap disabled:opacity-60 transition-all"
                      style={{ background: '#C9A84C', color: '#0A2416' }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {status === 'loading' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin mx-auto" />
                      ) : (
                        'Suscribirme'
                      )}
                    </motion.button>
                  </div>
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-[12px] text-left">{message}</p>
                )}

                <p className="text-white/20 text-[11px]">
                  Sin spam. Cancela cuando quieras. Ver{' '}
                  <span className="underline cursor-pointer hover:text-white/40 transition-colors">
                    politica de privacidad
                  </span>
                  .
                </p>
              </form>
            )}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                text: '+500 propiedades',
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                text: '4 ciudades',
              },
              {
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                text: 'Sin spam',
              },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2 text-white/30 text-[12px]">
                <span className="text-white/20">{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Línea decorativa bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' }}
      />
    </section>
  )
}
