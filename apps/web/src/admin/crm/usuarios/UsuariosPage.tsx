import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'

type AdminModulo = 'cms' | 'propiedades' | 'captaciones' | 'leads' | 'agenda' | 'reportes'

const MODULOS: { key: AdminModulo; label: string }[] = [
  { key: 'cms', label: 'Contenido del sitio (CMS)' },
  { key: 'propiedades', label: 'Propiedades' },
  { key: 'captaciones', label: 'Captaciones' },
  { key: 'leads', label: 'Leads' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'reportes', label: 'Reportes' },
]

interface Usuario {
  id: string
  email: string
  rol: 'SUPER_ADMIN' | 'COORDINADOR'
  permisos: AdminModulo[]
  activo: boolean
  createdAt: string
}

const inputClass = 'w-full rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder:text-white/[0.30] outline-none transition-colors focus:border-gold/[0.48]'
const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.42]'

function PermisosEditor({ value, onChange }: { value: AdminModulo[]; onChange: (next: AdminModulo[]) => void }) {
  const toggle = (m: AdminModulo) => {
    onChange(value.includes(m) ? value.filter(v => v !== m) : [...value, m])
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {MODULOS.map(m => (
        <label key={m.key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-[12px] transition-colors ${value.includes(m.key) ? 'border-gold/[0.32] bg-gold/[0.10] text-gold' : 'border-white/[0.08] bg-white/[0.02] text-white/[0.52]'}`}>
          <input type="checkbox" checked={value.includes(m.key)} onChange={() => toggle(m.key)} className="h-4 w-4 rounded border-white/[0.20] bg-transparent" />
          {m.label}
        </label>
      ))}
    </div>
  )
}

function NuevoUsuarioForm({ onCreated }: { onCreated: (u: Usuario) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [permisos, setPermisos] = useState<AdminModulo[]>([])
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || password.length < 8) {
      toast.error('Correo valido y contrasena de al menos 8 caracteres')
      return
    }
    setSaving(true)
    try {
      const created = await adminApi.post<Usuario>('/admin/usuarios', { email: email.trim(), password, permisos })
      toast.success('Cuenta de administrador creada')
      setEmail('')
      setPassword('')
      setPermisos([])
      onCreated(created)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5 space-y-4">
      <h2 className="text-[15px] font-bold text-white">Nueva cuenta de administrador (Coordinador)</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Correo</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="coordinador@elitenuvia.bo" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Contrasena temporal</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimo 8 caracteres" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Que puede ver y editar</label>
        <PermisosEditor value={permisos} onChange={setPermisos} />
      </div>
      <button type="submit" disabled={saving} className="rounded-2xl bg-gold px-5 py-3 text-[13px] font-black text-green-deep transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-55">
        {saving ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

function UsuarioRow({ usuario, onUpdated }: { usuario: Usuario; onUpdated: (u: Usuario) => void }) {
  const [editingPermisos, setEditingPermisos] = useState(false)
  const [draft, setDraft] = useState<AdminModulo[]>(usuario.permisos)
  const [saving, setSaving] = useState(false)

  const savePermisos = async () => {
    setSaving(true)
    try {
      const updated = await adminApi.put<Usuario>(`/admin/usuarios/${usuario.id}/permisos`, { permisos: draft })
      onUpdated(updated)
      setEditingPermisos(false)
      toast.success('Permisos actualizados')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async () => {
    try {
      const updated = await adminApi.patch<Usuario>(`/admin/usuarios/${usuario.id}/estado`, { activo: !usuario.activo })
      onUpdated(updated)
      toast.success(updated.activo ? 'Cuenta activada' : 'Cuenta desactivada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo actualizar')
    }
  }

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{usuario.email}</p>
          <p className="text-[11px] text-white/[0.38]">
            {usuario.rol === 'SUPER_ADMIN' ? 'Super Admin — acceso total' : 'Coordinador'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black ${usuario.activo ? 'border-emerald-400/[0.24] bg-emerald-400/[0.08] text-emerald-300' : 'border-white/[0.10] bg-white/[0.04] text-white/[0.38]'}`}>
            {usuario.activo ? 'Activo' : 'Inactivo'}
          </span>
          {usuario.rol === 'COORDINADOR' && (
            <>
              <button onClick={() => { setDraft(usuario.permisos); setEditingPermisos(v => !v) }} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/[0.58] hover:border-gold/[0.24] hover:text-gold transition-colors">
                {editingPermisos ? 'Cancelar' : 'Editar permisos'}
              </button>
              <button onClick={toggleActivo} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-white/[0.58] hover:border-gold/[0.24] hover:text-gold transition-colors">
                {usuario.activo ? 'Desactivar' : 'Activar'}
              </button>
            </>
          )}
        </div>
      </div>

      {usuario.rol === 'COORDINADOR' && !editingPermisos && (
        <div className="flex flex-wrap gap-1.5">
          {usuario.permisos.length === 0 ? (
            <span className="text-[11px] text-white/[0.30]">Sin modulos asignados todavia</span>
          ) : usuario.permisos.map(p => (
            <span key={p} className="rounded-full border border-gold/[0.18] bg-gold/[0.06] px-2 py-0.5 text-[10px] font-bold text-gold">
              {MODULOS.find(m => m.key === p)?.label ?? p}
            </span>
          ))}
        </div>
      )}

      {usuario.rol === 'COORDINADOR' && editingPermisos && (
        <div className="space-y-3 border-t border-white/[0.07] pt-3">
          <PermisosEditor value={draft} onChange={setDraft} />
          <button onClick={savePermisos} disabled={saving} className="rounded-xl bg-gold px-4 py-2 text-[12px] font-black text-green-deep transition-colors hover:bg-gold-light disabled:opacity-55">
            {saving ? 'Guardando...' : 'Guardar permisos'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.get<Usuario[]>('/admin/usuarios').then(setUsuarios).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const upsert = (u: Usuario) => setUsuarios(list => {
    const exists = list.some(x => x.id === u.id)
    return exists ? list.map(x => x.id === u.id ? u : x) : [u, ...list]
  })

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <div>
        <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Acceso</span>
        <h1 className="mt-3 text-[32px] font-black leading-[1.04] tracking-[-0.04em] text-white">Usuarios administrativos</h1>
        <p className="mt-1 text-[13px] text-white/[0.42]">
          Crea cuentas Coordinador y decide exactamente que modulos del CRM y CMS puede ver y editar cada una. Los asesores inmobiliarios se gestionan desde Agentes.
        </p>
      </div>

      <NuevoUsuarioForm onCreated={upsert} />

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map(u => (
            <UsuarioRow key={u.id} usuario={u} onUpdated={upsert} />
          ))}
        </div>
      )}
    </div>
  )
}
