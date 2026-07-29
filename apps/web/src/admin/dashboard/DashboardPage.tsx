import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAdminAuth } from '../context/AdminAuthContext'
import { adminApi } from '../shared/adminApi'

interface PropiedadesCount { venta: number; alquiler: number; anticretico: number; total: number }
interface ReportResumen { propiedades: { activas: number; venta: number; alquiler: number; anticretico: number } }
interface Lead { id: string; nombre: string; estado: string; temperatura: string; updatedAt: string; agente?: { nombre: string; apellido: string } }
interface Captacion { id: string; propietarioNombre: string; estado: string; ciudad: string; tipo: string; updatedAt: string }
interface Evento { id: string; titulo: string; tipo: string; inicio: string }

const LEAD_ESTADOS = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO']
const CAP_ESTADOS = ['EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA']
const ESTADO_COLOR: Record<string, string> = {
  NUEVO: '#8a9080',
  EN_CONTACTO: '#74a3ff',
  INTERESADO: '#C9A84C',
  NEGOCIACION: '#E8C96A',
  CERRADO: '#4ade80',
  PERDIDO: '#fb7185',
  EN_NEGOCIACION: '#8a9080',
  CAPTADA: '#74a3ff',
  PUBLICADA: '#C9A84C',
  EN_CIERRE: '#E8C96A',
  EXPIRADA: '#fb7185',
  CALIENTE: '#fb7185',
  TIBIO: '#C9A84C',
  FRIO: '#8a9080',
}

function formatState(value: string) {
  return value.replace(/_/g, ' ')
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-BO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1520px] space-y-5">
      <div className="h-36 rounded-[28px] border border-gold/[0.12] bg-white/[0.035]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 rounded-3xl border border-gold/[0.10] bg-white/[0.035]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-3xl border border-gold/[0.10] bg-white/[0.035]" />
        <div className="h-72 rounded-3xl border border-gold/[0.10] bg-white/[0.035]" />
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, tone }: { label: string; value: number | string; sub: string; tone: 'gold' | 'green' | 'blue' | 'white' }) {
  const toneClass = {
    gold: 'text-gold bg-gold/[0.12] border-gold/[0.22]',
    green: 'text-emerald-300 bg-emerald-400/[0.10] border-emerald-400/[0.18]',
    blue: 'text-sky-300 bg-sky-400/[0.10] border-sky-400/[0.18]',
    white: 'text-white bg-white/[0.06] border-white/[0.12]',
  }[tone]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.20)]">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.32] to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold text-white/[0.46]">{label}</p>
          <p className="mt-3 text-[36px] font-black leading-none tracking-[-0.05em] text-white">{value}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${toneClass}`}>
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-white/[0.40]">{sub}</p>
    </div>
  )
}

function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.20)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-white">{title}</h2>
        <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/[0.34]">
          En vivo
        </span>
      </div>
      {children}
    </section>
  )
}

function StatusPill({ value }: { value: string }) {
  const color = ESTADO_COLOR[value] ?? '#8a9080'
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em]"
      style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
    >
      {formatState(value)}
    </span>
  )
}

export default function DashboardPage() {
  const { user } = useAdminAuth()
  const [propCount, setPropCount] = useState<PropiedadesCount | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [captaciones, setCaptaciones] = useState<Captacion[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    const hasta = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // A Coordinador may only have some modulos assigned — each fetch is
    // independent so a missing permiso on one card doesn't blank the rest.
    const canSee = (modulo: 'reportes' | 'leads' | 'captaciones' | 'agenda') =>
      user?.rol !== 'COORDINADOR' || user.permisos.includes(modulo)

    Promise.allSettled([
      canSee('reportes') ? adminApi.get<ReportResumen>('/admin/reportes/resumen') : Promise.reject(new Error('sin permiso')),
      canSee('leads') ? adminApi.get<{ data: Lead[] }>('/admin/leads?pageSize=10') : Promise.reject(new Error('sin permiso')),
      canSee('captaciones') ? adminApi.get<{ data: Captacion[] }>('/admin/captaciones?pageSize=10') : Promise.reject(new Error('sin permiso')),
      canSee('agenda') ? adminApi.get<Evento[]>(`/admin/eventos?desde=${now.toISOString()}&hasta=${hasta.toISOString()}`) : Promise.reject(new Error('sin permiso')),
    ])
      .then(([reportRes, leadsRes, capRes, eventosRes]) => {
        if (reportRes.status === 'fulfilled') {
          setPropCount({
            venta: reportRes.value.propiedades.venta,
            alquiler: reportRes.value.propiedades.alquiler,
            anticretico: reportRes.value.propiedades.anticretico,
            total: reportRes.value.propiedades.activas,
          })
        }
        if (leadsRes.status === 'fulfilled') setLeads(leadsRes.value.data)
        if (capRes.status === 'fulfilled') setCaptaciones(capRes.value.data)
        if (eventosRes.status === 'fulfilled') setEventos(eventosRes.value.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [user])

  const activeLeads = useMemo(() => leads.filter(l => !['CERRADO', 'PERDIDO'].includes(l.estado)).length, [leads])
  const hotLeads = useMemo(() => leads.filter(l => l.temperatura === 'CALIENTE').length, [leads])
  const publishedCaptaciones = useMemo(() => captaciones.filter(c => c.estado === 'PUBLICADA').length, [captaciones])

  const leadChartData = LEAD_ESTADOS.map(estado => ({
    name: formatState(estado),
    valor: leads.filter(l => l.estado === estado).length,
    estado,
  }))

  const capChartData = CAP_ESTADOS.map(estado => ({
    name: formatState(estado),
    valor: captaciones.filter(c => c.estado === estado).length,
    estado,
  }))

  if (loading) return <DashboardSkeleton />

  return (
    <div className="mx-auto max-w-[1520px] space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-gold/[0.14] bg-[#0b130d]/[0.90] shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
        <div className="grid gap-6 p-6 xl:grid-cols-[1fr_420px] xl:items-end">
          <div>
            <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              Panel operativo
            </span>
            <h1 className="mt-4 max-w-3xl text-[34px] font-black leading-[1.04] tracking-[-0.045em] text-white md:text-[46px]">
              Bienvenido, {user?.nombre}. El pulso comercial está listo para revisar.
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/[0.48]">
              Propiedades públicas, captaciones, leads y agenda se leen desde la API para que el equipo vea el estado real del negocio.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/[0.08] bg-white/[0.035] p-3">
            <div>
              <p className="text-[24px] font-black tracking-[-0.04em] text-gold">{propCount?.venta ?? 0}</p>
              <p className="text-[11px] text-white/[0.42]">Venta</p>
            </div>
            <div>
              <p className="text-[24px] font-black tracking-[-0.04em] text-gold">{propCount?.alquiler ?? 0}</p>
              <p className="text-[11px] text-white/[0.42]">Alquiler</p>
            </div>
            <div>
              <p className="text-[24px] font-black tracking-[-0.04em] text-gold">{propCount?.anticretico ?? 0}</p>
              <p className="text-[11px] text-white/[0.42]">Anticretico</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Propiedades totales" value={propCount?.total ?? 0} sub="Inventario disponible para consulta pública y CRM." tone="gold" />
        <MetricCard label="Leads activos" value={activeLeads} sub={`${hotLeads} lead${hotLeads === 1 ? '' : 's'} con temperatura caliente.`} tone="green" />
        <MetricCard label="Captaciones" value={captaciones.length} sub={`${publishedCaptaciones} publicadas dentro del flujo comercial.`} tone="blue" />
        <MetricCard label="Agenda semanal" value={eventos.length} sub="Eventos próximos entre visitas, llamadas y cierres." tone="white" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Leads por estado">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leadChartData} barSize={24}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(245,240,230,0.38)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(245,240,230,0.34)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: '#0c140e', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 14, fontSize: 12, color: '#fff' }}
                cursor={{ fill: 'rgba(201,168,76,0.055)' }}
              />
              <Bar dataKey="valor" radius={[8, 8, 2, 2]}>
                {leadChartData.map(d => <Cell key={d.estado} fill={ESTADO_COLOR[d.estado] ?? '#8a9080'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Captaciones por estado">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={capChartData} barSize={24}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(245,240,230,0.38)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(245,240,230,0.34)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: '#0c140e', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 14, fontSize: 12, color: '#fff' }}
                cursor={{ fill: 'rgba(201,168,76,0.055)' }}
              />
              <Bar dataKey="valor" radius={[8, 8, 2, 2]}>
                {capChartData.map(d => <Cell key={d.estado} fill={ESTADO_COLOR[d.estado] ?? '#8a9080'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.20)]">
          <h2 className="text-[15px] font-bold text-white">Próximos eventos</h2>
          <div className="mt-4 space-y-3">
            {eventos.length === 0 ? (
              <p className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-6 text-center text-sm text-white/[0.42]">
                Sin eventos próximos
              </p>
            ) : (
              eventos.map(e => (
                <div key={e.id} className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <div className="mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl border border-gold/[0.16] bg-gold/[0.08] text-gold">
                    <div className="h-2 w-2 rounded-full bg-current" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{e.titulo}</p>
                    <p className="mt-0.5 text-[11px] text-white/[0.38]">{formatDate(e.inicio)} · {formatState(e.tipo)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.20)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-white">Últimos leads</h2>
            <span className="text-[12px] font-semibold text-white/[0.38]">{leads.length} registros</span>
          </div>
          {leads.length === 0 ? (
            <p className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-6 text-center text-sm text-white/[0.42]">
              Sin leads registrados
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
              {leads.slice(0, 6).map(l => (
                <div key={l.id} className="flex flex-col gap-3 border-b border-white/[0.07] bg-white/[0.025] px-4 py-3 last:border-0 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{l.nombre}</p>
                    <p className="mt-0.5 text-[11px] text-white/[0.36]">
                      {l.agente ? `${l.agente.nombre} ${l.agente.apellido}` : 'Sin agente asignado'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill value={l.temperatura} />
                    <StatusPill value={l.estado} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
