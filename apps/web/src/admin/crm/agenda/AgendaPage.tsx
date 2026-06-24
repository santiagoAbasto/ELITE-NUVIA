import { useCallback, useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale/es'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales: { es } })

interface Agente { id: string; nombre: string; apellido: string }
interface CalEvent {
  id: string; titulo: string; tipo: string
  inicio: string; fin: string
  agenteId: string
  agente?: { nombre: string; apellido: string }
  lead?: { nombre: string; telefono: string } | null
  propiedad?: { titulo: string } | null
  notas?: string | null
}
interface RbcEvent { id: string; title: string; start: Date; end: Date; resource: CalEvent }

const TIPO_COLOR: Record<string, string> = {
  VISITA:  '#C9A84C',
  LLAMADA: '#74a3ff',
  CIERRE:  '#4ade80',
  REUNION: '#a78bfa',
}

const TIPOS = ['VISITA', 'LLAMADA', 'CIERRE', 'REUNION']

function eventStyleGetter(event: RbcEvent) {
  const color = TIPO_COLOR[event.resource.tipo] ?? '#8a9080'
  return {
    style: {
      backgroundColor: `${color}22`,
      borderLeft: `3px solid ${color}`,
      color,
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: 700,
      padding: '2px 6px',
    },
  }
}

function EventModal({ event, onClose, onDelete, onSave }: {
  event: RbcEvent | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
  onSave: (data: Partial<CalEvent>) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<CalEvent>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (event?.resource) setForm(event.resource)
    setEditing(false)
  }, [event])

  if (!event) return null
  const e = event.resource
  const color = TIPO_COLOR[e.tipo] ?? '#8a9080'
  const set = (k: keyof CalEvent) => (v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputClass = 'w-full rounded-2xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/[0.28] outline-none focus:border-gold/[0.50]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-[28px] border border-gold/[0.14] bg-[#0b130d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.60)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.34] to-transparent" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.10em]"
              style={{ color, borderColor: `${color}44`, background: `${color}18` }}>
              {e.tipo}
            </span>
            <h2 className="mt-2 text-[18px] font-black tracking-[-0.03em] text-white">{e.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-white/[0.40] hover:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {!editing ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/[0.56]">
              <span>{format(new Date(e.inicio), 'PPP', { locale: es })}</span>
              <span>{format(new Date(e.inicio), 'HH:mm')} → {format(new Date(e.fin), 'HH:mm')}</span>
            </div>
            {e.agente && <p className="text-[13px] text-white/[0.50]">Agente: {e.agente.nombre} {e.agente.apellido}</p>}
            {e.lead && <p className="text-[13px] text-white/[0.50]">Cliente: {e.lead.nombre} · {e.lead.telefono}</p>}
            {e.propiedad && <p className="text-[13px] text-white/[0.50]">Propiedad: {e.propiedad.titulo}</p>}
            {e.notas && <p className="mt-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-[13px] text-white/[0.56]">{e.notas}</p>}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(true)} className="flex-1 rounded-2xl border border-gold/[0.22] bg-gold/[0.08] py-2 text-[12px] font-bold text-gold hover:bg-gold/[0.16]">Editar</button>
              <button onClick={async () => { await onDelete(e.id); onClose() }} className="rounded-2xl border border-red-400/[0.20] bg-red-400/[0.07] px-4 py-2 text-[12px] font-bold text-red-400 hover:bg-red-400/[0.14]">Eliminar</button>
            </div>
          </div>
        ) : (
          <form onSubmit={async (ev) => { ev.preventDefault(); setSaving(true); await onSave(form); setSaving(false); setEditing(false) }} className="mt-4 space-y-3">
            <input value={form.titulo ?? ''} onChange={e => set('titulo')(e.target.value)} placeholder="Título" className={inputClass} />
            <select value={form.tipo ?? 'VISITA'} onChange={e => set('tipo')(e.target.value)} className={inputClass}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea value={form.notas ?? ''} onChange={e => set('notas')(e.target.value)} placeholder="Notas..." rows={3} className={`${inputClass} resize-none`} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-2xl border border-white/[0.08] py-2 text-[12px] font-semibold text-white/[0.54]">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 rounded-2xl border border-gold/[0.26] bg-gold/[0.10] py-2 text-[12px] font-bold text-gold disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function NewEventModal({ slot, onClose, onCreated, agentes, userRol }: {
  slot: { start: Date; end: Date } | null
  onClose: () => void
  onCreated: (e: CalEvent) => void
  agentes: Agente[]
  userRol: string
}) {
  const [form, setForm] = useState({ titulo: '', tipo: 'VISITA', inicio: '', fin: '', notas: '', agenteId: '' })
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputClass = 'w-full rounded-2xl border border-white/[0.10] bg-white/[0.04] px-3 py-2 text-[13px] text-white placeholder:text-white/[0.28] outline-none focus:border-gold/[0.50]'

  useEffect(() => {
    if (slot) {
      setForm(f => ({
        ...f,
        inicio: format(slot.start, "yyyy-MM-dd'T'HH:mm"),
        fin: format(slot.end, "yyyy-MM-dd'T'HH:mm"),
      }))
    }
  }, [slot])

  if (!slot) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const ev = await adminApi.post<CalEvent>('/admin/eventos', {
        titulo: form.titulo, tipo: form.tipo,
        inicio: new Date(form.inicio).toISOString(),
        fin: new Date(form.fin).toISOString(),
        notas: form.notas || null,
        agenteId: form.agenteId || undefined,
      })
      onCreated(ev)
      toast.success('Evento creado')
      onClose()
    } catch { toast.error('Error al crear evento') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-[28px] border border-gold/[0.14] bg-[#0b130d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.60)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.34] to-transparent" />
        <h2 className="text-[18px] font-black tracking-[-0.03em] text-white">Nuevo evento</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input value={form.titulo} onChange={e => set('titulo')(e.target.value)} placeholder="Título del evento *" required className={inputClass} />
          <select value={form.tipo} onChange={e => set('tipo')(e.target.value)} className={inputClass}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(userRol === 'SUPER_ADMIN' || userRol === 'COORDINADOR') && agentes.length > 0 && (
            <select value={form.agenteId} onChange={e => set('agenteId')(e.target.value)} className={inputClass}>
              <option value="">Seleccionar agente...</option>
              {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input type="datetime-local" value={form.inicio} onChange={e => set('inicio')(e.target.value)} required className={inputClass} />
            <input type="datetime-local" value={form.fin} onChange={e => set('fin')(e.target.value)} required className={inputClass} />
          </div>
          <textarea value={form.notas} onChange={e => set('notas')(e.target.value)} placeholder="Notas opcionales..." rows={2} className={`${inputClass} resize-none`} />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/[0.08] py-2.5 text-[13px] font-semibold text-white/[0.54]">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl border border-gold/[0.26] bg-gold/[0.10] py-2.5 text-[13px] font-bold text-gold hover:bg-gold/[0.20] disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const { user } = useAdminAuth()
  const [events, setEvents] = useState<RbcEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('week')
  const [date, setDate] = useState(new Date())
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [filtroAgente, setFiltroAgente] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<RbcEvent | null>(null)
  const [newSlot, setNewSlot] = useState<{ start: Date; end: Date } | null>(null)

  const toRbc = (e: CalEvent): RbcEvent => ({
    id: e.id, title: e.titulo,
    start: new Date(e.inicio), end: new Date(e.fin),
    resource: e,
  })

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (filtroAgente) params.set('agenteId', filtroAgente)
    const [evs, ags] = await Promise.all([
      adminApi.get<CalEvent[]>(`/admin/eventos?${params}`),
      user?.rol !== 'AGENTE' ? adminApi.get<Agente[]>('/admin/agentes') : Promise.resolve([]),
    ])
    setEvents(evs.map(toRbc))
    setAgentes(ags)
    setLoading(false)
  }, [filtroAgente, user?.rol])

  useEffect(() => { load() }, [load])

  const handleDeleteEvent = async (id: string) => {
    await adminApi.del(`/admin/eventos/${id}`)
    setEvents(prev => prev.filter(e => e.id !== id))
    toast.success('Evento eliminado')
  }

  const handleSaveEvent = async (data: Partial<CalEvent>) => {
    if (!selectedEvent) return
    const updated = await adminApi.put<CalEvent>(`/admin/eventos/${selectedEvent.id}`, data)
    setEvents(prev => prev.map(e => e.id === selectedEvent.id ? toRbc(updated) : e))
    setSelectedEvent(null)
    toast.success('Evento actualizado')
  }

  const handleCreated = (ev: CalEvent) => {
    setEvents(prev => [...prev, toRbc(ev)])
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">CRM</span>
          <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">Agenda</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(user?.rol === 'SUPER_ADMIN' || user?.rol === 'COORDINADOR') && agentes.length > 0 && (
            <select value={filtroAgente} onChange={e => setFiltroAgente(e.target.value)}
              className="rounded-2xl border border-white/[0.09] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none focus:border-gold/[0.40]">
              <option value="">Todos los agentes</option>
              {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
            </select>
          )}
          <div className="flex rounded-2xl border border-white/[0.08] overflow-hidden">
            {(['month', 'week', 'day'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-[12px] font-bold capitalize transition-colors ${view === v ? 'bg-gold/[0.14] text-gold' : 'text-white/[0.46] hover:text-white'}`}>
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
              </button>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3">
            {TIPOS.map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: TIPO_COLOR[t] }} />
                <span className="text-[11px] text-white/[0.40]">{t.charAt(0) + t.slice(1).toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="rbc-dark overflow-hidden rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)]">
        {loading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 620 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={e => setSelectedEvent(e as RbcEvent)}
            onSelectSlot={slot => setNewSlot({ start: slot.start as Date, end: slot.end as Date })}
            selectable
            culture="es"
            messages={{
              next: 'Siguiente', previous: 'Anterior', today: 'Hoy',
              month: 'Mes', week: 'Semana', day: 'Día',
              noEventsInRange: 'Sin eventos en este período',
            }}
          />
        )}
      </div>

      {/* Modals */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onSave={handleSaveEvent}
      />
      <NewEventModal
        slot={newSlot}
        onClose={() => setNewSlot(null)}
        onCreated={handleCreated}
        agentes={agentes}
        userRol={user?.rol ?? ''}
      />
    </div>
  )
}
