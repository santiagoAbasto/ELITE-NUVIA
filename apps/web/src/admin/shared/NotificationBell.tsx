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
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
        aria-label="Notificaciones"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {data.noLeidas > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-medium text-white">Notificaciones</span>
            {data.noLeidas > 0 && (
              <button onClick={marcarTodas} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800">
            {data.data.slice(0, 5).length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-zinc-500">Sin notificaciones</p>
            ) : (
              data.data.slice(0, 5).map(n => (
                <button
                  key={n.id}
                  onClick={() => marcarUna(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors ${!n.leida ? 'bg-amber-500/5' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.leida && <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />}
                    <div className={!n.leida ? '' : 'ml-3.5'}>
                      <p className="text-sm text-white font-medium leading-snug">{n.titulo}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{n.cuerpo}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">
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
