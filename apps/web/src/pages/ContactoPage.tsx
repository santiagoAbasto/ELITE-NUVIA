import type { ReactNode } from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
)

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
)

const IconMapPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const CONTACT_INFO: { icon: ReactNode; label: string; value: string; href: string | null }[] = [
  { icon: <IconPhone />, label: 'Telefono', value: '+591 4 000 0000', href: 'tel:+59140000000' },
  { icon: <IconMail />, label: 'Email', value: 'info@elitenuvia.bo', href: 'mailto:info@elitenuvia.bo' },
  { icon: <IconMapPin />, label: 'Oficina principal', value: 'Cochabamba, Bolivia', href: null },
  { icon: <IconClock />, label: 'Horario', value: 'Lun–Sab, 9:00–18:00', href: null },
]

const inputCls = 'w-full bg-white/04 border border-white/08 rounded-xl px-4 py-3.5 text-white text-[13.5px] placeholder-white/20 focus:outline-none focus:border-gold/40 focus:bg-white/06 transition-all'

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.telefono) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json() as { message?: string }; throw new Error(d.message ?? 'Error') }
      setSuccess(true)
      setForm({ nombre: '', telefono: '', email: '', mensaje: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Header */}
      <div className="relative pt-28 pb-14" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        <div className="wrap">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Hablemos</span>
          </div>
          <h1 className="text-[40px] md:text-[48px] font-bold text-white leading-[1.05]" style={{ letterSpacing: '-0.03em' }}>
            Estamos aqui <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>para ti.</em>
          </h1>
          <p className="text-white/45 text-[14px] mt-3 max-w-[440px] leading-relaxed">
            Un asesor ELITE Nuvia se comunicara contigo en menos de 24 horas.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="wrap py-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16">
          {/* Formulario */}
          <div>
            <div className="text-white/30 text-[11px] font-bold tracking-[2.5px] uppercase mb-6">Enviar consulta</div>
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-green-500/15 bg-green-900/10 p-10 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-500/20 flex items-center justify-center mx-auto mb-4 text-green-400">
                  <IconCheck />
                </div>
                <h2 className="text-white font-bold text-xl mb-2">Consulta enviada</h2>
                <p className="text-white/45 text-[14px] mb-6">Un asesor se comunicara contigo pronto.</p>
                <button onClick={() => setSuccess(false)} className="text-gold text-[13px] underline">
                  Enviar otra consulta
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/35 text-[11px] font-bold mb-2 uppercase tracking-wider">Nombre *</label>
                    <input type="text" placeholder="Tu nombre completo" value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-white/35 text-[11px] font-bold mb-2 uppercase tracking-wider">Telefono *</label>
                    <input type="tel" placeholder="+591 7X XXX XXX" value={form.telefono}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className="block text-white/35 text-[11px] font-bold mb-2 uppercase tracking-wider">Email</label>
                  <input type="email" placeholder="tu@email.com" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-white/35 text-[11px] font-bold mb-2 uppercase tracking-wider">Mensaje</label>
                  <textarea rows={5} placeholder="Cuentanos en que podemos ayudarte. Tipo de propiedad, ciudad, presupuesto..."
                    value={form.mensaje}
                    onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                    className={`${inputCls} resize-none`} />
                </div>
                {error && (
                  <div className="text-red-400 text-[12.5px] bg-red-500/08 border border-red-500/15 rounded-xl px-4 py-3">{error}</div>
                )}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-[14px] transition-all disabled:opacity-50"
                  style={{ background: '#C9A84C', color: '#0A2416' }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? 'Enviando...' : 'Enviar consulta'}
                </motion.button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Info de contacto */}
            <div className="bg-white/03 border border-white/06 rounded-2xl p-6">
              <div className="text-white/30 text-[10px] font-bold tracking-[2.5px] uppercase mb-5">Contacto directo</div>
              <div className="space-y-4">
                {CONTACT_INFO.map(c => (
                  <div key={c.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/08 border border-gold/15 flex items-center justify-center flex-shrink-0 text-gold">
                      {c.icon}
                    </div>
                    <div>
                      <div className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">{c.label}</div>
                      {c.href ? (
                        <a href={c.href} className="text-white text-[13.5px] font-medium hover:text-gold transition-colors">{c.value}</a>
                      ) : (
                        <div className="text-white text-[13.5px] font-medium">{c.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Me gustaria recibir informacion sobre propiedades con ELITE Nuvia.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full p-5 rounded-2xl font-bold text-[14px] transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #2ecc71, #25D366)', color: '#fff' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hablar por WhatsApp ahora
            </a>

            {/* Badge confianza */}
            <div className="bg-white/02 border border-white/05 rounded-2xl p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-gold/08 border border-gold/15 flex items-center justify-center mx-auto mb-3 text-gold">
                <IconShield />
              </div>
              <div className="text-white/50 text-[12.5px] leading-relaxed">
                Tu informacion es privada y segura. Nunca compartimos tus datos con terceros.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
