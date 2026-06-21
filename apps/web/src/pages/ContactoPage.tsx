import { useState } from 'react'
import { motion } from 'framer-motion'

const WA_NUMBER = import.meta.env.VITE_WA_NUMBER ?? '59170000000'

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const inputCls = 'w-full bg-white/05 border border-white/10 rounded-xl px-4 py-3.5 text-white text-[13.5px] placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre || !form.telefono) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json() as { message?: string }
        throw new Error(data.message ?? 'Error al enviar')
      }
      setSuccess(true)
      setForm({ nombre: '', telefono: '', email: '', mensaje: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar consulta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      <div className="pt-28 pb-24">
        {/* Header */}
        <div className="wrap mb-16">
          <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-3">Hablemos</div>
          <h1 className="text-[40px] font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Contacto
          </h1>
          <p className="text-white/45 text-[15px] max-w-[480px]">
            Un agente de ELITE Nuvia se comunicara contigo en menos de 24 horas.
          </p>
        </div>

        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
            {/* Formulario */}
            <div>
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-900/20 border border-green-500/20 rounded-2xl p-8 text-center"
                >
                  <div className="text-4xl mb-4">✅</div>
                  <h2 className="text-white font-bold text-xl mb-2">Consulta enviada</h2>
                  <p className="text-white/55 text-[14px]">Un agente se contactara contigo pronto.</p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-gold text-[13px] underline"
                  >
                    Enviar otra consulta
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/50 text-[12px] font-medium mb-1.5 uppercase tracking-wider">Nombre *</label>
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        value={form.nombre}
                        onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white/50 text-[12px] font-medium mb-1.5 uppercase tracking-wider">Telefono *</label>
                      <input
                        type="tel"
                        placeholder="+591 7X XXX XXX"
                        value={form.telefono}
                        onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                        className={inputCls}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/50 text-[12px] font-medium mb-1.5 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 text-[12px] font-medium mb-1.5 uppercase tracking-wider">Mensaje</label>
                    <textarea
                      rows={4}
                      placeholder="Cuentanos en que podemos ayudarte..."
                      value={form.mensaje}
                      onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {error && (
                    <div className="text-red-400 text-[13px] bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold text-[14px] transition-all disabled:opacity-60"
                    style={{ background: '#C9A84C', color: '#0A2416' }}
                  >
                    {loading ? 'Enviando...' : 'Enviar consulta'}
                  </button>
                </form>
              )}
            </div>

            {/* Info lateral */}
            <div className="space-y-6">
              <div className="bg-white/04 border border-white/06 rounded-2xl p-6">
                <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-4">Contacto directo</div>
                <div className="space-y-4">
                  <div>
                    <div className="text-white/30 text-[11px] uppercase tracking-wider mb-1">Telefono</div>
                    <a href="tel:+59140000000" className="text-white font-semibold hover:text-gold transition-colors">+591 4 000 0000</a>
                  </div>
                  <div>
                    <div className="text-white/30 text-[11px] uppercase tracking-wider mb-1">Email</div>
                    <a href="mailto:info@elitenuvia.bo" className="text-white font-semibold hover:text-gold transition-colors">info@elitenuvia.bo</a>
                  </div>
                  <div>
                    <div className="text-white/30 text-[11px] uppercase tracking-wider mb-1">Ubicacion</div>
                    <div className="text-white">Cochabamba, Bolivia</div>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola! Me gustaria recibir informacion sobre propiedades con ELITE Nuvia.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-5 rounded-2xl font-bold text-[14px] transition-colors"
                style={{ background: '#25D366', color: '#fff' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
