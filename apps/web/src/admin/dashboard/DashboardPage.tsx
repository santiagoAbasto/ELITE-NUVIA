import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { adminApi } from '../shared/adminApi'
import { useAdminAuth } from '../context/AdminAuthContext'

interface PropiedadesCount { venta: number; alquiler: number; anticretico: number; total: number }
interface Lead { id: string; nombre: string; estado: string; temperatura: string; updatedAt: string; agente?: { nombre: string; apellido: string } }
interface Captacion { id: string; propietarioNombre: string; estado: string; ciudad: string; tipo: string; updatedAt: string }
interface Evento { id: string; titulo: string; tipo: string; inicio: string }

const LEAD_ESTADOS = ['NUEVO', 'EN_CONTACTO', 'INTERESADO', 'NEGOCIACION', 'CERRADO', 'PERDIDO']
const CAP_ESTADOS = ['EN_NEGOCIACION', 'CAPTADA', 'PUBLICADA', 'EN_CIERRE', 'CERRADA', 'EXPIRADA']
const ESTADO_COLOR: Record<string, string> = {
  NUEVO: '#52525b', EN_CONTACTO: '#2563eb', INTERESADO: '#d97706',
  NEGOCIACION: '#ea580c', CERRADO: '#16a34a', PERDIDO: '#dc2626',
  EN_NEGOCIACION: '#52525b', CAPTADA: '#2563eb', PUBLICADA: '#d97706',
  EN_CIERRE: '#ea580c', EXPIRADA: '#dc2626',
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
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

    Promise.all([
      adminApi.get<PropiedadesCount>('/propiedades/count'),
      adminApi.get<{ data: Lead[] }>('/admin/leads?pageSize=10'),
      adminApi.get<{ data: Captacion[] }>('/admin/captaciones?pageSize=10'),
      adminApi.get<Evento[]>(`/admin/eventos?desde=${now.toISOString()}&hasta=${hasta.toISOString()}`),
    ])
      .then(([count, leadsRes, capRes, eventosRes]) => {
        setPropCount(count)
        setLeads(leadsRes.data)
        setCaptaciones(capRes.data)
        setEventos(eventosRes.slice(0, 5))
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false))
  }, [])

  const leadChartData = LEAD_ESTADOS.map(estado => ({
    name: estado.replace('_', ' '),
    valor: leads.filter(l => l.estado === estado).length,
    estado,
  }))

  const capChartData = CAP_ESTADOS.map(estado => ({
    name: estado.replace('_', ' '),
    valor: captaciones.filter(c => c.estado === estado).length,
    estado,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Bienvenido, {user?.nombre}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Propiedades totales" value={propCount?.total ?? 0} />
        <StatCard label="En venta" value={propCount?.venta ?? 0} />
        <StatCard label="En alquiler" value={propCount?.alquiler ?? 0} />
        <StatCard label="Leads activos" value={leads.filter(l => !['CERRADO', 'PERDIDO'].includes(l.estado)).length} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Leads por estado</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={leadChartData} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {leadChartData.map(d => <Cell key={d.estado} fill={ESTADO_COLOR[d.estado] ?? '#52525b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Captaciones por estado</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={capChartData} barSize={20}>
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {capChartData.map(d => <Cell key={d.estado} fill={ESTADO_COLOR[d.estado] ?? '#52525b'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming events */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Próximos eventos</p>
          {eventos.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin eventos próximos</p>
          ) : (
            <div className="space-y-3">
              {eventos.map(e => (
                <div key={e.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white leading-snug">{e.titulo}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(e.inicio).toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent leads */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-sm font-medium text-white mb-4">Últimos leads</p>
          {leads.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin leads registrados</p>
          ) : (
            <div className="space-y-2">
              {leads.slice(0, 5).map(l => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{l.nombre}</p>
                    {l.agente && (
                      <p className="text-xs text-zinc-500">{l.agente.nombre} {l.agente.apellido}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      l.temperatura === 'CALIENTE' ? 'bg-red-500/10 text-red-400' :
                      l.temperatura === 'TIBIO' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-zinc-700/50 text-zinc-400'
                    }`}>
                      {l.temperatura}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {l.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
