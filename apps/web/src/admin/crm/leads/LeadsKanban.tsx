import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
} from '@dnd-kit/core'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'

interface Agente { nombre: string; apellido: string }
interface Lead {
  id: string; nombre: string; telefono: string; email?: string
  estado: string; temperatura: string; updatedAt: string
  agente?: Agente
  propiedad?: { titulo: string } | null
}

const COLUMNS: { key: string; label: string; accent: string; bg: string; border: string }[] = [
  { key: 'NUEVO',       label: 'Nuevo',       accent: '#8a9080', bg: 'bg-white/[0.025]',          border: 'border-white/[0.07]' },
  { key: 'EN_CONTACTO', label: 'En contacto', accent: '#74a3ff', bg: 'bg-sky-400/[0.04]',         border: 'border-sky-400/[0.12]' },
  { key: 'INTERESADO',  label: 'Interesado',  accent: '#C9A84C', bg: 'bg-gold/[0.04]',            border: 'border-gold/[0.14]' },
  { key: 'NEGOCIACION', label: 'Negociación', accent: '#E8C96A', bg: 'bg-amber-300/[0.04]',       border: 'border-amber-300/[0.14]' },
  { key: 'CERRADO',     label: 'Cerrado',     accent: '#4ade80', bg: 'bg-emerald-400/[0.04]',     border: 'border-emerald-400/[0.12]' },
  { key: 'PERDIDO',     label: 'Perdido',     accent: '#fb7185', bg: 'bg-red-400/[0.04]',         border: 'border-red-400/[0.10]' },
]

const TEMP_COLOR: Record<string, string> = {
  CALIENTE: 'border-red-400/[0.30] bg-red-400/[0.10] text-red-300',
  TIBIO:    'border-amber-400/[0.30] bg-amber-400/[0.10] text-amber-300',
  FRIO:     'border-white/[0.10] bg-white/[0.04] text-white/[0.42]',
}

function LeadCard({ lead, isDragging = false }: { lead: Lead; isDragging?: boolean }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id })
  const style = transform ? { transform: `translate(${transform.x}px,${transform.y}px)` } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group cursor-grab rounded-2xl border bg-[#0b130d]/[0.90] p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.28)] transition-all active:cursor-grabbing ${isDragging ? 'opacity-40' : 'border-gold/[0.10] hover:border-gold/[0.22]'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold text-white leading-snug">{lead.nombre}</p>
        <span className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] ${TEMP_COLOR[lead.temperatura] ?? TEMP_COLOR.FRIO}`}>
          {lead.temperatura.toLowerCase()}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-white/[0.42]">{lead.telefono}</p>

      {lead.propiedad && (
        <p className="mt-2 truncate rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-white/[0.50]">
          {lead.propiedad.titulo}
        </p>
      )}

      {lead.agente && (
        <p className="mt-2 text-[10px] text-white/[0.32]">
          {lead.agente.nombre} {lead.agente.apellido}
        </p>
      )}

      <button
        onClick={e => { e.stopPropagation(); navigate(`/admin/leads/${lead.id}`) }}
        className="mt-3 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-1.5 text-[11px] font-semibold text-white/[0.52] opacity-0 transition-all group-hover:opacity-100 hover:border-gold/[0.20] hover:text-gold"
      >
        Ver detalle
      </button>
    </div>
  )
}

function KanbanColumn({ col, leads }: { col: typeof COLUMNS[number]; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key })

  return (
    <div className="flex w-72 flex-shrink-0 flex-col">
      {/* Header */}
      <div className={`mb-3 flex items-center justify-between rounded-2xl border px-3 py-2 ${col.bg} ${col.border}`}>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: col.accent }} />
          <span className="text-[12px] font-bold text-white">{col.label}</span>
        </div>
        <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-black text-white/[0.50]">
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-2xl border-2 border-dashed p-2 transition-colors min-h-[120px] ${isOver ? 'border-gold/[0.40] bg-gold/[0.04]' : 'border-transparent'}`}
      >
        {leads.map(l => <LeadCard key={l.id} lead={l} />)}
      </div>
    </div>
  )
}

export default function LeadsKanban() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newLeadModal, setNewLeadModal] = useState(false)
  const pendingRef = useRef<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  useEffect(() => {
    adminApi.get<{ data: Lead[] }>('/admin/leads?pageSize=100')
      .then(r => setLeads(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const activeLead = leads.find(l => l.id === activeId)

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const leadId = active.id as string
    const newEstado = over.id as string
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.estado === newEstado) return

    // Optimistic
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: newEstado } : l))
    pendingRef.current = leadId
    try {
      await adminApi.patch(`/admin/leads/${leadId}/estado`, { estado: newEstado })
    } catch {
      // Rollback
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: lead.estado } : l))
      toast.error('No se pudo mover el lead')
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1800px] space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            Pipeline
          </span>
          <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">Leads</h1>
          <p className="mt-1 text-[13px] text-white/[0.42]">{leads.length} leads en el pipeline</p>
        </div>
        <button
          onClick={() => setNewLeadModal(true)}
          className="flex items-center gap-2 rounded-2xl border border-gold/[0.26] bg-gold/[0.10] px-4 py-2.5 text-[13px] font-bold text-gold transition-colors hover:bg-gold/[0.18]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo lead
        </button>
      </div>

      {/* Kanban board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.key}
              col={col}
              leads={leads.filter(l => l.estado === col.key)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Quick new lead modal */}
      {newLeadModal && (
        <NewLeadModal
          onClose={() => setNewLeadModal(false)}
          onCreated={lead => { setLeads(prev => [lead, ...prev]); setNewLeadModal(false) }}
        />
      )}
    </div>
  )
}

function NewLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: (l: Lead) => void }) {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', temperatura: 'FRIO' })
  const [saving, setSaving] = useState(false)

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))
  const inputClass = 'w-full rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-[13px] text-white placeholder:text-white/[0.28] outline-none focus:border-gold/[0.50]'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const lead = await adminApi.post<Lead>('/admin/leads', form)
      onCreated(lead)
      toast.success('Lead creado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-[28px] border border-gold/[0.14] bg-[#0b130d] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.60)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.34] to-transparent" />
        <h2 className="text-[20px] font-black tracking-[-0.03em] text-white">Nuevo lead</h2>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input value={form.nombre} onChange={e => set('nombre')(e.target.value)} placeholder="Nombre del cliente *" required className={inputClass} />
          <input value={form.telefono} onChange={e => set('telefono')(e.target.value)} placeholder="Teléfono *" required className={inputClass} />
          <input type="email" value={form.email} onChange={e => set('email')(e.target.value)} placeholder="Correo electrónico" className={inputClass} />
          <select value={form.temperatura} onChange={e => set('temperatura')(e.target.value)} className={inputClass}>
            <option value="FRIO">Frío</option>
            <option value="TIBIO">Tibio</option>
            <option value="CALIENTE">Caliente</option>
          </select>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-white/[0.08] py-2.5 text-[13px] font-semibold text-white/[0.54] hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-2xl border border-gold/[0.26] bg-gold/[0.12] py-2.5 text-[13px] font-bold text-gold hover:bg-gold/[0.20] disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
