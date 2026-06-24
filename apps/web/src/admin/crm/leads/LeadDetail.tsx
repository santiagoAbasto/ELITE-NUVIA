import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Interaccion { id: string; tipo: string; texto: string; createdAt: string; agente: { nombre: string; apellido: string } }
interface LeadDetail {
  id: string; nombre: string; telefono: string; email?: string
  estado: string; temperatura: string; mensaje?: string
  presupuesto?: number; preferencias?: Record<string, unknown>
  valorCierre?: number; comision?: number
  agente?: { id: string; nombre: string; apellido: string; foto?: string | null }
  propiedad?: { id: string; slug: string; titulo: string; fotos: { url: string }[] } | null
  interacciones: Interaccion[]
}

const TIPOS_INTERACCION = ['nota', 'llamada', 'visita', 'email', 'whatsapp']
const TEMP_COLOR: Record<string, string> = {
  CALIENTE: 'border-red-400/[0.30] bg-red-400/[0.10] text-red-300',
  TIBIO: 'border-amber-400/[0.30] bg-amber-400/[0.10] text-amber-300',
  FRIO: 'border-white/[0.10] bg-white/[0.04] text-white/[0.42]',
}

function TimelineDot({ tipo }: { tipo: string }) {
  const colors: Record<string, string> = {
    nota: 'bg-zinc-500', llamada: 'bg-sky-400', visita: 'bg-gold',
    email: 'bg-purple-400', whatsapp: 'bg-emerald-400',
  }
  return <div className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${colors[tipo] ?? 'bg-white/30'}`} />
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  useAdminAuth()
  const navigate = useNavigate()
  const [lead, setLead] = useState<LeadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [interTipo, setInterTipo] = useState('nota')
  const [interTexto, setInterTexto] = useState('')
  const [addingInter, setAddingInter] = useState(false)
  const timelineEndRef = useRef<HTMLDivElement>(null)

  const refetch = () =>
    adminApi.get<LeadDetail>(`/admin/leads/${id}`)
      .then(setLead).catch(() => {})

  useEffect(() => { if (id) { setLoading(true); refetch().finally(() => setLoading(false)) } }, [id])

  const addInteraccion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!interTexto.trim()) return
    setAddingInter(true)
    try {
      await adminApi.post(`/admin/leads/${id}/interaccion`, { tipo: interTipo, texto: interTexto })
      setInterTexto('')
      await refetch()
      setTimeout(() => timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      toast.success('Interacción registrada')
    } catch { toast.error('Error al registrar') }
    finally { setAddingInter(false) }
  }

  const updateTemperatura = async (temp: string) => {
    await adminApi.put(`/admin/leads/${id}`, { temperatura: temp })
    setLead(prev => prev ? { ...prev, temperatura: temp } : prev)
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
  if (!lead) return <p className="text-white/[0.42]">Lead no encontrado</p>

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/admin/leads')} className="flex items-center gap-2 text-[13px] text-white/[0.42] hover:text-white transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Volver al pipeline
      </button>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left — Timeline */}
        <div className="space-y-5">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[28px] border border-gold/[0.14] bg-[#0b130d]/[0.90] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.32] to-transparent" />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-[24px] font-black tracking-[-0.04em] text-white">{lead.nombre}</h1>
                <div className="mt-1 flex flex-wrap gap-3 text-[13px] text-white/[0.46]">
                  <span>{lead.telefono}</span>
                  {lead.email && <span>{lead.email}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.10em] ${TEMP_COLOR[lead.temperatura] ?? TEMP_COLOR.FRIO}`}>
                  {lead.temperatura.toLowerCase()}
                </span>
                <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/[0.54]">
                  {lead.estado.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Temp control */}
            <div className="mt-4 flex items-center gap-2">
              <p className="text-[11px] text-white/[0.36] uppercase tracking-wider mr-1">Temperatura:</p>
              {(['FRIO', 'TIBIO', 'CALIENTE'] as const).map(t => (
                <button key={t} onClick={() => updateTemperatura(t)}
                  className={`rounded-xl border px-3 py-1 text-[11px] font-bold transition-colors ${lead.temperatura === t ? TEMP_COLOR[t] : 'border-white/[0.07] bg-white/[0.02] text-white/[0.36] hover:text-white/[0.60]'}`}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {lead.presupuesto && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-gold/[0.18] bg-gold/[0.06] px-3 py-1.5">
                <p className="text-[11px] text-white/[0.42]">Presupuesto</p>
                <p className="text-[14px] font-black text-gold">Bs. {Number(lead.presupuesto).toLocaleString('es-BO')}</p>
              </div>
            )}
          </section>

          {/* Timeline */}
          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">
              Historial — {lead.interacciones.length} interacciones
            </p>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {lead.interacciones.length === 0 ? (
                <p className="text-[13px] text-white/[0.30] text-center py-6">Sin interacciones registradas todavía</p>
              ) : (
                lead.interacciones.map(inter => (
                  <div key={inter.id} className="flex gap-3">
                    <TimelineDot tipo={inter.tipo} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/[0.50]">{inter.tipo}</span>
                        <span className="text-[10px] text-white/[0.28]">
                          {inter.agente.nombre} {inter.agente.apellido} · {new Date(inter.createdAt).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-white/[0.70] leading-relaxed">{inter.texto}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={timelineEndRef} />
            </div>

            {/* Add interaction */}
            <form onSubmit={addInteraccion} className="mt-5 space-y-3 border-t border-white/[0.07] pt-5">
              <div className="flex gap-2">
                {TIPOS_INTERACCION.map(t => (
                  <button key={t} type="button" onClick={() => setInterTipo(t)}
                    className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold capitalize transition-colors ${interTipo === t ? 'border-gold/[0.30] bg-gold/[0.12] text-gold' : 'border-white/[0.07] bg-white/[0.02] text-white/[0.40] hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                value={interTexto}
                onChange={e => setInterTexto(e.target.value)}
                placeholder="Describe la interacción..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder:text-white/[0.28] outline-none focus:border-gold/[0.40]"
              />
              <button type="submit" disabled={addingInter || !interTexto.trim()}
                className="w-full rounded-2xl border border-gold/[0.24] bg-gold/[0.10] py-2.5 text-[13px] font-bold text-gold transition-colors hover:bg-gold/[0.18] disabled:opacity-40">
                {addingInter ? 'Registrando...' : 'Registrar interacción'}
              </button>
            </form>
          </section>
        </div>

        {/* Right — Info sidebar */}
        <div className="space-y-4">
          {/* Agente */}
          <div className="rounded-[24px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Agente asignado</p>
            {lead.agente ? (
              <div className="flex items-center gap-3">
                {lead.agente.foto ? (
                  <img src={lead.agente.foto} alt="" className="h-9 w-9 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold/[0.10]">
                    <span className="text-[12px] font-black text-gold">{lead.agente.nombre[0]}</span>
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-bold text-white">{lead.agente.nombre} {lead.agente.apellido}</p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-white/[0.36]">Sin agente asignado</p>
            )}
          </div>

          {/* Propiedad de interés */}
          {lead.propiedad && (
            <div className="rounded-[24px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Propiedad de interés</p>
              <div className="flex items-center gap-3">
                {lead.propiedad.fotos?.[0] && (
                  <img src={lead.propiedad.fotos[0].url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-white">{lead.propiedad.titulo}</p>
                  <button onClick={() => navigate(`/admin/propiedades/${lead.propiedad!.id}`)}
                    className="text-[11px] text-gold hover:underline">Ver propiedad</button>
                </div>
              </div>
            </div>
          )}

          {/* Cierre */}
          {lead.estado === 'CERRADO' && (
            <div className="rounded-[24px] border border-emerald-400/[0.18] bg-emerald-400/[0.05] p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400/[0.60]">Datos del cierre</p>
              {lead.valorCierre ? (
                <p className="text-[22px] font-black text-emerald-300">Bs. {Number(lead.valorCierre).toLocaleString('es-BO')}</p>
              ) : (
                <p className="text-[13px] text-white/[0.36]">Sin valor de cierre registrado</p>
              )}
              {lead.comision && (
                <p className="mt-1 text-[12px] text-emerald-400/[0.70]">
                  Comisión estimada: Bs. {Number(lead.comision).toLocaleString('es-BO')}
                </p>
              )}
            </div>
          )}

          {/* Mensaje original */}
          {lead.mensaje && (
            <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Mensaje inicial</p>
              <p className="text-[13px] text-white/[0.56] leading-relaxed">{lead.mensaje}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
