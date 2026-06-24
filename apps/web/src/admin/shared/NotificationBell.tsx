import { useEffect, useRef, useState } from 'react'
import { adminApi } from './adminApi'

interface Notificacion {
  id: string
  titulo: string
  cuerpo: string
  leida: boolean
  tipo: string
  createdAt: string
}

interface NotifResponse {
  data: Notificacion[]
  noLeidas: number
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<NotifResponse>({ data: [], noLeidas: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const fetch = async () => {
    try {
      const res = await adminApi.get<NotifResponse>('/admin/notificaciones')
      setData(res)
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const marcarTodas = async () => {
    await adminApi.patch('/admin/notificaciones/leer-todas', {})
    setData(d => ({ ...d, noLeidas: 0, data: d.data.map(n => ({ ...n, leida: true })) }))
  }

  const marcarUna = async (id: string) => {
    await adminApi.patch(`/admin/notificaciones/${id}/leer`, {})
    setData(d => ({
      noLeidas: Math.max(0, d.noLeidas - 1),
      data: d.data.map(n => n.id === id ? { ...n, leida: true } : n),
    }))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/[0.48] transition-colors hover:border-gold/[0.24] hover:text-gold"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {data.noLeidas > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-gold px-1 text-[9px] font-black leading-none text-green-deep">
            {data.noLeidas > 9 ? '9+' : data.noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-gold/[0.16] bg-[#0c140e] shadow-[0_28px_90px_rgba(0,0,0,0.48)]">
          <div className="flex items-center justify-between border-b border-gold/[0.10] px-4 py-3">
            <span className="text-sm font-semibold text-white">Notificaciones</span>
            {data.noLeidas > 0 && (
              <button type="button" onClick={marcarTodas} className="text-xs font-semibold text-gold hover:text-gold-light transition-colors">
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gold/[0.08]">
            {data.data.slice(0, 5).length === 0 ? (
              <p className="px-4 py-7 text-center text-sm text-white/[0.42]">Sin notificaciones</p>
            ) : (
              data.data.slice(0, 5).map(n => (
                <button
                  type="button"
                  key={n.id}
                  onClick={() => marcarUna(n.id)}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.045] ${!n.leida ? 'bg-gold/[0.055]' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.leida && <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold" />}
                    <div className={!n.leida ? '' : 'ml-3.5'}>
                      <p className="text-sm text-white font-medium leading-snug">{n.titulo}</p>
                      <p className="mt-0.5 text-xs leading-snug text-white/[0.46]">{n.cuerpo}</p>
                      <p className="mt-1 text-[10px] text-white/[0.28]">
                        {new Date(n.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
