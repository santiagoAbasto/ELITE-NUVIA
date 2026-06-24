import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, PieChart, Pie, Legend,
  RadialBarChart, RadialBar,
} from 'recharts'
import { adminApi } from '../../shared/adminApi'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Resumen {
  propiedades: { activas: number; venta: number; alquiler: number; anticretico: number }
  captaciones: { activas: number; mes: number; ultimoMes: number }
  leads: { total: number; mes: number; ultimoMes: number; cerradosMes: number; cerradosUltimoMes: number; tasaConversionMes: number; tasaConversionUltimoMes: number }
  eventos: { proximos: number }
  agentes: { activos: number }
}
interface EstadoItem { estado: string; count: number }
interface MesItem { mes: string; total: number; cerrados: number }
interface AgenteRow { id: string; nombre: string; foto?: string | null; propiedades: number; captaciones: number; leadsActivos: number; cierresMes: number; tasaConversion: number }
interface CiudadItem { ciudad: string; count: number }
interface TempItem { temperatura: string; count: number }

// ─── Color maps ──────────────────────────────────────────────────────────────

const LEAD_COLORS: Record<string, string> = {
  NUEVO: '#8a9080', EN_CONTACTO: '#74a3ff', INTERESADO: '#C9A84C',
  NEGOCIACION: '#E8C96A', CERRADO: '#4ade80', PERDIDO: '#fb7185',
}
const CAP_COLORS: Record<string, string> = {
  EN_NEGOCIACION: '#8a9080', CAPTADA: '#74a3ff', PUBLICADA: '#C9A84C',
  EN_CIERRE: '#E8C96A', CERRADA: '#4ade80', EXPIRADA: '#fb7185',
}
const TEMP_COLORS: Record<string, string> = {
  CALIENTE: '#fb7185', TIBIO: '#C9A84C', FRIO: '#74a3ff',
}

function formatEstado(s: string) { return s.replace(/_/g, ' ') }

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, accent = false }: {
  label: string; value: number | string; sub?: string
  trend?: { value: number; label: string } | null; accent?: boolean
}) {
  const trendUp = trend && trend.value > 0
  const trendDown = trend && trend.value < 0
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.28] to-transparent" />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/[0.38]">{label}</p>
      <p className={`mt-3 text-[38px] font-black leading-none tracking-[-0.05em] ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
      {sub && <p className="mt-2 text-[12px] text-white/[0.36]">{sub}</p>}
      {trend && (
        <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black ${trendUp ? 'bg-emerald-400/[0.10] text-emerald-300' : trendDown ? 'bg-red-400/[0.10] text-red-300' : 'bg-white/[0.05] text-white/[0.36]'}`}>
          <span>{trendUp ? '▲' : trendDown ? '▼' : '─'}</span>
          <span>{Math.abs(trend.value)} {trend.label}</span>
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-gold/[0.24] to-transparent" />
      <div className="mb-4">
        <p className="text-[15px] font-bold text-white">{title}</p>
        {subtitle && <p className="mt-0.5 text-[12px] text-white/[0.38]">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

const tooltipStyle = {
  contentStyle: { background: '#0b130d', border: '1px solid rgba(201,168,76,0.20)', borderRadius: 12, fontSize: 12, color: '#fff' },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null)
  const [leadsPorEstado, setLeadsPorEstado] = useState<EstadoItem[]>([])
  const [leadsPorMes, setLeadsPorMes] = useState<MesItem[]>([])
  const [captacionesPorEstado, setCaptacionesPorEstado] = useState<EstadoItem[]>([])
  const [rendimientoAgentes, setRendimientoAgentes] = useState<AgenteRow[]>([])
  const [propsPorCiudad, setPropsPorCiudad] = useState<CiudadItem[]>([])
  const [leadsPorTemp, setLeadsPorTemp] = useState<TempItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.get<Resumen>('/admin/reportes/resumen'),
      adminApi.get<EstadoItem[]>('/admin/reportes/leads-por-estado'),
      adminApi.get<MesItem[]>('/admin/reportes/leads-por-mes'),
      adminApi.get<EstadoItem[]>('/admin/reportes/captaciones-por-estado'),
      adminApi.get<AgenteRow[]>('/admin/reportes/rendimiento-agentes'),
      adminApi.get<CiudadItem[]>('/admin/reportes/propiedades-por-ciudad'),
      adminApi.get<TempItem[]>('/admin/reportes/leads-por-temperatura'),
    ]).then(([r, lpe, lpm, cpe, ra, pc, lpt]) => {
      setResumen(r)
      setLeadsPorEstado(lpe)
      setLeadsPorMes(lpm)
      setCaptacionesPorEstado(cpe)
      setRendimientoAgentes(ra)
      setPropsPorCiudad(pc)
      setLeadsPorTemp(lpt)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-[1520px] space-y-5">
        <div className="h-12 w-48 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-72 animate-pulse rounded-[28px] bg-white/[0.03]" />)}
        </div>
      </div>
    )
  }

  const trendLeads = resumen ? {
    value: resumen.leads.mes - resumen.leads.ultimoMes,
    label: 'vs mes anterior',
  } : null

  const trendCierres = resumen ? {
    value: resumen.leads.cerradosMes - resumen.leads.cerradosUltimoMes,
    label: 'vs mes anterior',
  } : null

  const trendCaptaciones = resumen ? {
    value: resumen.captaciones.mes - resumen.captaciones.ultimoMes,
    label: 'vs mes anterior',
  } : null

  return (
    <div className="mx-auto max-w-[1520px] space-y-8">

      {/* Header */}
      <div>
        <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
          Inteligencia comercial
        </span>
        <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">
          Reportes
        </h1>
        <p className="mt-1 text-[13px] text-white/[0.42]">
          Métricas en tiempo real del negocio
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Propiedades activas"
          value={resumen?.propiedades.activas ?? 0}
          sub={`${resumen?.propiedades.venta ?? 0} venta · ${resumen?.propiedades.alquiler ?? 0} alquiler · ${resumen?.propiedades.anticretico ?? 0} anticretico`}
        />
        <KpiCard
          label="Leads este mes"
          value={resumen?.leads.mes ?? 0}
          trend={trendLeads}
          sub={`${resumen?.leads.total ?? 0} leads en total`}
        />
        <KpiCard
          label="Cierres este mes"
          value={resumen?.leads.cerradosMes ?? 0}
          trend={trendCierres}
          accent
          sub={`${resumen?.leads.tasaConversionMes ?? 0}% tasa de conversión`}
        />
        <KpiCard
          label="Captaciones este mes"
          value={resumen?.captaciones.mes ?? 0}
          trend={trendCaptaciones}
          sub={`${resumen?.captaciones.activas ?? 0} captaciones activas`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">Agentes activos</p>
            <p className="mt-1 text-[28px] font-black text-white">{resumen?.agentes.activos ?? 0}</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/[0.18] bg-gold/[0.08]">
            <svg className="h-5 w-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">Eventos próximos</p>
            <p className="mt-1 text-[28px] font-black text-white">{resumen?.eventos.proximos ?? 0}</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-400/[0.20] bg-sky-400/[0.08]">
            <svg className="h-5 w-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 10h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="rounded-[24px] border border-white/[0.07] bg-white/[0.025] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.36]">Conversión del mes</p>
            <p className="mt-1 text-[28px] font-black text-gold">{resumen?.leads.tasaConversionMes ?? 0}%</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/[0.20] bg-emerald-400/[0.08]">
            <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Leads por mes — line chart */}
        <ChartCard title="Evolución de leads" subtitle="Últimos 6 meses — nuevos vs cerrados">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={leadsPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }} />
              <Line type="monotone" dataKey="total" name="Nuevos" stroke="#C9A84C" strokeWidth={2.5} dot={{ fill: '#C9A84C', r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="cerrados" name="Cerrados" stroke="#4ade80" strokeWidth={2.5} dot={{ fill: '#4ade80', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Leads por estado — bar chart */}
        <ChartCard title="Leads por estado" subtitle="Distribución actual del pipeline">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={leadsPorEstado} barSize={24}>
              <XAxis dataKey="estado" tickFormatter={formatEstado} tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Leads']} />
              <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]}>
                {leadsPorEstado.map(d => <Cell key={d.estado} fill={LEAD_COLORS[d.estado] ?? '#8a9080'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* Captaciones por estado */}
        <ChartCard title="Captaciones por estado" subtitle="Pipeline de captación">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={captacionesPorEstado} barSize={18} layout="vertical">
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="estado" tickFormatter={s => s.replace('_', ' ').slice(0, 8)} tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 10 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Captaciones']} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {captacionesPorEstado.map(d => <Cell key={d.estado} fill={CAP_COLORS[d.estado] ?? '#8a9080'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Propiedades por ciudad */}
        <ChartCard title="Propiedades por ciudad" subtitle="Distribución geográfica activa">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={propsPorCiudad} barSize={18} layout="vertical">
              <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="ciudad" tick={{ fill: 'rgba(255,255,255,0.36)', fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Propiedades']} />
              <Bar dataKey="count" fill="#C9A84C" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Temperatura de leads — pie */}
        <ChartCard title="Temperatura de leads" subtitle="Calidad del pipeline comercial">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={leadsPorTemp}
                dataKey="count"
                nameKey="temperatura"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {leadsPorTemp.map(d => (
                  <Cell key={d.temperatura} fill={TEMP_COLORS[d.temperatura] ?? '#8a9080'} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n]} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)' }}>{value.toLowerCase()}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Rendimiento agentes */}
      <ChartCard title="Rendimiento por agente" subtitle="Métricas individuales del mes en curso">
        {rendimientoAgentes.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-white/[0.36]">Sin datos de agentes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {['Agente', 'Propiedades', 'Captaciones', 'Leads activos', 'Cierres mes', 'Conversión', 'Score'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-white/[0.34]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rendimientoAgentes.map((a, idx) => {
                  const score = a.propiedades * 1 + a.captaciones * 2 + a.cierresMes * 5 + a.tasaConversion * 0.5
                  return (
                    <tr key={a.id} className="transition-colors hover:bg-white/[0.025]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          {idx === 0 && <span className="text-gold text-[10px] font-black">#1</span>}
                          {a.foto ? (
                            <img src={a.foto} alt="" className="h-7 w-7 rounded-xl object-cover" />
                          ) : (
                            <div className="grid h-7 w-7 place-items-center rounded-xl bg-gold/[0.12]">
                              <span className="text-[10px] font-black text-gold">{a.nombre[0]}</span>
                            </div>
                          )}
                          <span className="font-semibold text-white">{a.nombre}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-white/[0.70]">{a.propiedades}</td>
                      <td className="px-3 py-3 text-white/[0.70]">{a.captaciones}</td>
                      <td className="px-3 py-3 text-white/[0.70]">{a.leadsActivos}</td>
                      <td className="px-3 py-3">
                        <span className={`font-bold ${a.cierresMes > 0 ? 'text-emerald-400' : 'text-white/[0.40]'}`}>
                          {a.cierresMes}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.08]">
                            <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(a.tasaConversion, 100)}%` }} />
                          </div>
                          <span className="text-[12px] font-bold text-gold">{a.tasaConversion}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-xl border border-gold/[0.20] bg-gold/[0.08] px-2.5 py-1 text-[11px] font-black text-gold">
                          {Math.round(score)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Radial gauge — conversión visual */}
      {resumen && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Venta', value: resumen.propiedades.venta, total: resumen.propiedades.activas, color: '#C9A84C' },
            { label: 'Alquiler', value: resumen.propiedades.alquiler, total: resumen.propiedades.activas, color: '#74a3ff' },
            { label: 'Anticretico', value: resumen.propiedades.anticretico, total: resumen.propiedades.activas, color: '#a78bfa' },
            { label: 'Conversión mes', value: resumen.leads.tasaConversionMes, total: 100, color: '#4ade80' },
          ].map(g => {
            const pct = g.total > 0 ? Math.round((g.value / g.total) * 100) : 0
            return (
              <div key={g.label} className="relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.025] p-5">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.38]">{g.label}</p>
                <ResponsiveContainer width="100%" height={100}>
                  <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ value: pct, fill: g.color }]} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <p className="text-[22px] font-black tracking-[-0.04em]" style={{ color: g.color }}>{pct}%</p>
                  <p className="text-[11px] text-white/[0.36]">{g.value} de {g.total}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
