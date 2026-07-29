import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const inputClass =
  'w-full rounded-2xl border border-gold/[0.16] bg-[#07100b]/85 px-4 pb-3.5 pt-7 text-[15px] font-semibold text-white outline-none transition-all placeholder:text-transparent focus:border-gold/70 focus:bg-[#08140d] focus:shadow-[0_0_0_4px_rgba(201,168,76,0.12)]'

const labelClass =
  'pointer-events-none absolute left-4 top-3 text-[10px] font-black uppercase tracking-[0.18em] text-gold/70'

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/[0.24] bg-gold/[0.10] text-[13px] font-black tracking-[0.22em] text-gold shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
        EN
      </div>
      <div>
        <div className="text-[17px] font-black tracking-[0.2em] text-white">ELITE</div>
        <div className="-mt-1 font-serif text-[22px] italic text-gold">Nuvia</div>
      </div>
    </div>
  )
}

function IconLock() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  )
}

function IconArrow() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export default function LoginPage() {
  const { login } = useAdminAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050905] text-white">
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(circle at 18% 12%, rgba(201,168,76,0.16), transparent 28%)',
            'radial-gradient(circle at 82% 16%, rgba(26,92,58,0.40), transparent 34%)',
            'linear-gradient(135deg, rgba(13,59,39,0.92) 0%, rgba(6,12,8,0.98) 48%, #050905 100%)',
          ].join(', '),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.20) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.55] to-transparent" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1320px] grid-cols-1 px-5 py-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.72fr)] lg:gap-10 lg:px-8">
        <section className="hidden min-h-[calc(100vh-48px)] flex-col justify-between rounded-[32px] border border-gold/[0.12] bg-black/[0.16] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.34)] lg:flex">
          <BrandMark />

          <div className="max-w-[620px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
              Panel privado
            </div>
            <h1 className="text-[56px] font-black leading-[0.96] tracking-[-0.045em] text-white">
              Administración ELITE Nuvia.
            </h1>
            <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-white/[0.56]">
              Acceso para gestionar el CMS, CRM, propiedades, leads, agenda y equipo interno de la inmobiliaria.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {['SUPER_ADMIN', 'COORDINADOR', 'AGENTE'].map(role => (
              <div key={role} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/70">{role.replace('_', ' ')}</p>
                <div className="mt-3 h-1.5 rounded-full bg-white/[0.06]">
                  <div className="h-full w-2/3 rounded-full bg-gold" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center py-6 lg:min-h-[calc(100vh-48px)]">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <BrandMark />
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative overflow-hidden rounded-[30px] border border-gold/[0.16] bg-[#0a120c]/[0.94] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.46)] md:p-8"
            >
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.45] to-transparent" />

              <div className="mb-8">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-gold/[0.22] bg-gold/[0.10] text-gold">
                  <IconLock />
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.22em] text-gold/72">
                  Acceso administrativo
                </p>
                <h2 className="mt-3 text-[30px] font-black tracking-[-0.04em] text-white">
                  Iniciar sesión
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-white/[0.48]">
                  Usa tu correo corporativo y contraseña asignada.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-400/[0.26] bg-red-400/[0.08] px-4 py-3">
                  <p className="text-sm font-semibold text-red-200">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="admin-email" className={labelClass}>Correo</label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="correo@elitenuvia.bo"
                    autoComplete="username"
                    required
                    className={`${inputClass} pr-12`}
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold/55">
                    <IconMail />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="admin-password" className={labelClass}>Contraseña</label>
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    autoComplete="current-password"
                    required
                    className={`${inputClass} pr-12`}
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gold/55">
                    <IconLock />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-5 py-4 text-[14px] font-black text-green-deep transition-all hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? 'Ingresando...' : 'Ingresar al panel'}
                {!loading && <IconArrow />}
              </button>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[12px] text-white/[0.42]">
                <span>ELITE Nuvia Admin</span>
                <span className="rounded-full border border-emerald-400/[0.16] bg-emerald-400/[0.08] px-2.5 py-1 font-semibold text-emerald-300">
                  Seguro
                </span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
