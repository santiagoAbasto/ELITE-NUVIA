import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'

interface Actividad { id: string; tipo: string; descripcion: string; createdAt: string; agente: { nombre: string; apellido: string } }
interface CaptacionFull {
  id: string; propietarioNombre: string; propietarioTelefono: string; propietarioEmail?: string; propietarioDoc?: string
  tipoInmueble: string; tipo: string; ciudad: string; zona?: string; direccion?: string; descripcion?: string
  dormitorios?: number; banos?: number; superficieM2?: number; garage: boolean; amueblado: boolean; piscina: boolean
  fotos: string[]; precioSolicitado: number; precioSugerido?: number; moneda: string; comisionPct?: number
  fechaCaptacion: string; contratoUrl?: string; exclusividadFin?: string
  estado: string; propiedadId?: string
  agente: { id: string; nombre: string; apellido: string; foto?: string | null; email: string; telefono: string }
  actividades: Actividad[]
}

const ESTADOS_ORDEN = ['EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA']
const ESTADO_LABEL: Record<string, string> = {
  EN_NEGOCIACION: 'En negociación', CAPTADA: 'Captada', PUBLICADA: 'Publicada',
  EN_CIERRE: 'En cierre', CERRADA: 'Cerrada', EXPIRADA: 'Expirada',
}
const TIPOS_ACTIVIDAD = ['nota', 'llamada', 'visita_inmueble', 'foto_actualizada', 'precio_ajustado', 'documento', 'publicada', 'visita_cliente', 'oferta', 'cierre']
const ACT_DOT: Record<string, string> = {
  nota: 'bg-zinc-500', llamada: 'bg-sky-400', visita_inmueble: 'bg-gold',
  precio_ajustado: 'bg-amber-400', publicada: 'bg-emerald-400', visita_cliente: 'bg-purple-400',
  oferta: 'bg-orange-400', cierre: 'bg-green-400', documento: 'bg-blue-400', foto_actualizada: 'bg-pink-400',
}

export default function CaptacionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cap, setCap] = useState<CaptacionFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [actTipo, setActTipo] = useState('nota')
  const [actTexto, setActTexto] = useState('')
  const [addingAct, setAddingAct] = useState(false)
  const [advancingState, setAdvancingState] = useState(false)

  const refetch = () => adminApi.get<CaptacionFull>(`/admin/captaciones/${id}`).then(setCap).catch(() => {})

  useEffect(() => { if (id) { setLoading(true); refetch().finally(() => setLoading(false)) } }, [id])

  const addActividad = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actTexto.trim()) return
    setAddingAct(true)
    try {
      await adminApi.post(`/admin/captaciones/${id}/actividad`, { tipo: actTipo, descripcion: actTexto })
      setActTexto('')
      await refetch()
      toast.success('Actividad registrada')
    } catch { toast.error('Error al registrar') }
    finally { setAddingAct(false) }
  }

  const advanceEstado = async () => {
    if (!cap) return
    const idx = ESTADOS_ORDEN.indexOf(cap.estado)
    if (idx >= ESTADOS_ORDEN.length - 2) return
    const next = ESTADOS_ORDEN[idx + 1]
    if (!confirm(`¿Avanzar a "${ESTADO_LABEL[next]}"?`)) return
    setAdvancingState(true)
    try {
      await adminApi.patch(`/admin/captaciones/${id}/estado`, { estado: next })
      await refetch()
      toast.success(`Estado actualizado a ${ESTADO_LABEL[next]}`)
    } catch { toast.error('Error al actualizar estado') }
    finally { setAdvancingState(false) }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" /></div>
  if (!cap) return <p className="text-white/[0.42]">Captación no encontrada</p>

  const estadoIdx = ESTADOS_ORDEN.indexOf(cap.estado)
  const canAdvance = estadoIdx < ESTADOS_ORDEN.length - 2

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <button onClick={() => navigate('/admin/captaciones')} className="flex items-center gap-2 text-[13px] text-white/[0.42] hover:text-white transition-colors">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Volver a captaciones
      </button>

      {/* Estado progress */}
      <section className="relative overflow-hidden rounded-[28px] border border-gold/[0.14] bg-[#0b130d]/[0.90] p-5">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.32] to-transparent" />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            {ESTADOS_ORDEN.slice(0, -1).map((e, i) => (
              <div key={e} className="flex items-center gap-2">
                <div className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition-colors ${i === estadoIdx ? 'border-gold/[0.30] bg-gold/[0.14] text-gold' : i < estadoIdx ? 'border-emerald-400/[0.20] bg-emerald-400/[0.06] text-emerald-400/[0.70]' : 'border-white/[0.07] bg-white/[0.02] text-white/[0.28]'}`}>
                  {ESTADO_LABEL[e]}
                </div>
                {i < ESTADOS_ORDEN.length - 2 && (
                  <svg className={`h-3 w-3 flex-shrink-0 ${i < estadoIdx ? 'text-emerald-400/[0.50]' : 'text-white/[0.18]'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" /></svg>
                )}
              </div>
            ))}
          </div>
          {canAdvance && (
            <button onClick={advanceEstado} disabled={advancingState}
              className="flex-shrink-0 rounded-2xl border border-gold/[0.26] bg-gold/[0.10] px-4 py-2 text-[12px] font-bold text-gold hover:bg-gold/[0.18] disabled:opacity-50 transition-colors">
              {advancingState ? 'Actualizando...' : `Avanzar a ${ESTADO_LABEL[ESTADOS_ORDEN[estadoIdx + 1]]}`}
            </button>
          )}
          {cap.estado === 'CAPTADA' && !cap.propiedadId && (
            <button
              onClick={async () => {
                await adminApi.patch(`/admin/captaciones/${id}/estado`, { estado: 'PUBLICADA' })
                await refetch()
                toast.success('Propiedad creada y publicada')
              }}
              className="flex-shrink-0 rounded-2xl border border-emerald-400/[0.26] bg-emerald-400/[0.10] px-4 py-2 text-[12px] font-bold text-emerald-300 hover:bg-emerald-400/[0.18] transition-colors"
            >
              Publicar en portal
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left */}
        <div className="space-y-5">
          {/* Datos inmueble */}
          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 space-y-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Inmueble</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              <div><p className="text-white/[0.36] text-[10px] uppercase tracking-wider">Tipo</p><p className="font-bold text-white mt-0.5">{cap.tipoInmueble} — {cap.tipo}</p></div>
              <div><p className="text-white/[0.36] text-[10px] uppercase tracking-wider">Ubicación</p><p className="font-bold text-white mt-0.5">{cap.ciudad}{cap.zona ? `, ${cap.zona}` : ''}</p></div>
              {cap.dormitorios && <div><p className="text-white/[0.36] text-[10px] uppercase tracking-wider">Dormitorios</p><p className="font-bold text-white mt-0.5">{cap.dormitorios}</p></div>}
              {cap.banos && <div><p className="text-white/[0.36] text-[10px] uppercase tracking-wider">Baños</p><p className="font-bold text-white mt-0.5">{cap.banos}</p></div>}
              {cap.superficieM2 && <div><p className="text-white/[0.36] text-[10px] uppercase tracking-wider">Superficie</p><p className="font-bold text-white mt-0.5">{cap.superficieM2} m²</p></div>}
            </div>
            {cap.fotos?.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {cap.fotos.slice(0, 8).map((url, i) => (
                  <img key={i} src={url} alt="" className="h-20 w-full rounded-xl object-cover bg-white/[0.04]" />
                ))}
              </div>
            )}
          </section>

          {/* Timeline actividades */}
          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">
              Actividades — {cap.actividades.length} registros
            </p>
            <div className="max-h-[380px] space-y-4 overflow-y-auto pr-1">
              {cap.actividades.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-white/[0.30]">Sin actividades registradas</p>
              ) : cap.actividades.map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${ACT_DOT[a.tipo] ?? 'bg-white/30'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/[0.50]">{a.tipo.replace('_', ' ')}</span>
                      <span className="text-[10px] text-white/[0.28]">
                        {a.agente.nombre} · {new Date(a.createdAt).toLocaleString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-white/[0.68] leading-relaxed">{a.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={addActividad} className="mt-5 space-y-3 border-t border-white/[0.07] pt-5">
              <div className="flex flex-wrap gap-1.5">
                {TIPOS_ACTIVIDAD.map(t => (
                  <button key={t} type="button" onClick={() => setActTipo(t)}
                    className={`rounded-xl border px-2.5 py-1 text-[11px] font-bold capitalize transition-colors ${actTipo === t ? 'border-gold/[0.30] bg-gold/[0.12] text-gold' : 'border-white/[0.07] bg-white/[0.02] text-white/[0.36] hover:text-white'}`}>
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <textarea value={actTexto} onChange={e => setActTexto(e.target.value)} placeholder="Describe la actividad..." rows={3}
                className="w-full resize-none rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder:text-white/[0.28] outline-none focus:border-gold/[0.40]" />
              <button type="submit" disabled={addingAct || !actTexto.trim()}
                className="w-full rounded-2xl border border-gold/[0.24] bg-gold/[0.10] py-2.5 text-[13px] font-bold text-gold hover:bg-gold/[0.18] disabled:opacity-40 transition-colors">
                {addingAct ? 'Registrando...' : 'Registrar actividad'}
              </button>
            </form>
          </section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Propietario */}
          <div className="rounded-[24px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Propietario</p>
            <p className="text-[15px] font-bold text-white">{cap.propietarioNombre}</p>
            <p className="text-[13px] text-white/[0.50]">{cap.propietarioTelefono}</p>
            {cap.propietarioEmail && <p className="text-[13px] text-white/[0.40]">{cap.propietarioEmail}</p>}
            {cap.propietarioDoc && <p className="text-[11px] text-white/[0.32]">Doc: {cap.propietarioDoc}</p>}
          </div>

          {/* Precios */}
          <div className="rounded-[24px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Precios</p>
            <div>
              <p className="text-[10px] text-white/[0.36]">Solicitado por propietario</p>
              <p className="text-[20px] font-black text-white">{cap.moneda} {Number(cap.precioSolicitado).toLocaleString('es-BO')}</p>
            </div>
            {cap.precioSugerido && (
              <div>
                <p className="text-[10px] text-white/[0.36]">Sugerido por agente</p>
                <p className="text-[16px] font-bold text-gold">{cap.moneda} {Number(cap.precioSugerido).toLocaleString('es-BO')}</p>
              </div>
            )}
            {cap.comisionPct && <p className="text-[12px] text-white/[0.42]">Comisión: {cap.comisionPct}%</p>}
          </div>

          {/* Agente */}
          <div className="rounded-[24px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">Agente responsable</p>
            <div className="flex items-center gap-3">
              {cap.agente.foto ? <img src={cap.agente.foto} alt="" className="h-9 w-9 rounded-xl object-cover" /> : (
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-gold/[0.10]"><span className="text-[12px] font-black text-gold">{cap.agente.nombre[0]}</span></div>
              )}
              <div>
                <p className="text-[13px] font-bold text-white">{cap.agente.nombre} {cap.agente.apellido}</p>
                <p className="text-[11px] text-white/[0.38]">{cap.agente.telefono}</p>
              </div>
            </div>
          </div>

          {/* Contrato */}
          {cap.contratoUrl && (
            <a href={cap.contratoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-[24px] border border-white/[0.07] bg-white/[0.02] p-4 text-[13px] text-gold hover:border-gold/[0.20] transition-colors">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Ver contrato de captación
            </a>
          )}

          {/* Propiedad creada */}
          {cap.propiedadId && (
            <button onClick={() => navigate(`/admin/propiedades/${cap.propiedadId}`)}
              className="w-full rounded-[24px] border border-emerald-400/[0.18] bg-emerald-400/[0.05] p-4 text-left transition-colors hover:bg-emerald-400/[0.09]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400/[0.60]">Propiedad publicada</p>
              <p className="mt-1 text-[13px] font-bold text-emerald-300">Ver en el CRM</p>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
