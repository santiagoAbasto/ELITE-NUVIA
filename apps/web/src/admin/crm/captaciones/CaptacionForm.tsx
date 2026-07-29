import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { adminApi } from '../../shared/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

interface Agente { id: string; nombre: string; apellido: string }
interface CaptacionCreated { id: string; propiedad?: { id: string } }

const TIPOS = ['VENTA', 'ALQUILER', 'ANTICRETICO']
const TIPOS_INMUEBLE = ['CASA', 'DEPARTAMENTO', 'GARZONIER', 'TERRENO', 'LOCAL', 'OTRO']

const inputClass = 'w-full rounded-2xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-[13px] text-white placeholder:text-white/[0.30] outline-none transition-colors focus:border-gold/[0.48]'
const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-white/[0.42]'

function SwitchField({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description: string
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4">
      <span>
        <span className="block text-[13px] font-bold text-white">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-white/[0.40]">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <span className={`relative h-7 w-12 rounded-full border transition-colors ${checked ? 'border-gold/[0.45] bg-gold' : 'border-white/[0.12] bg-white/[0.08]'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </label>
  )
}

export default function CaptacionForm() {
  const { user } = useAdminAuth()
  const navigate = useNavigate()
  const [agentes, setAgentes] = useState<Agente[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    propietarioNombre: '',
    propietarioTelefono: '',
    propietarioEmail: '',
    propietarioDoc: '',
    tipoInmueble: 'CASA',
    tipo: 'VENTA',
    ciudad: 'Cochabamba',
    zona: '',
    direccion: '',
    descripcion: '',
    dormitorios: '',
    banos: '',
    superficieM2: '',
    garage: false,
    amueblado: false,
    piscina: false,
    precioSolicitado: '',
    precioSugerido: '',
    moneda: 'BOB',
    comisionPct: '',
    contratoUrl: '',
    exclusividadInicio: '',
    exclusividadFin: '',
    mostrarEnWeb: false,
    agenteId: '',
    fotos: '',
  })

  const isAgent = user?.rol === 'AGENTE'

  useEffect(() => {
    if (!isAgent) {
      adminApi.get<Agente[]>('/admin/agentes')
        .then(setAgentes)
        .catch(() => setAgentes([]))
    }
  }, [isAgent])

  useEffect(() => {
    if (!isAgent && !form.agenteId && agentes[0]) {
      setForm(f => ({ ...f, agenteId: agentes[0].id }))
    }
  }, [agentes, form.agenteId, isAgent])

  const publishCopy = useMemo(() => (
    form.mostrarEnWeb
      ? 'Se creara una propiedad vinculada y visible en la web.'
      : 'La captacion queda privada dentro del CRM hasta publicarla.'
  ), [form.mostrarEnWeb])

  const set = (key: keyof typeof form) => (value: string | boolean) => setForm(f => ({ ...f, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      const fotos = form.fotos
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean)

      const created = await adminApi.post<CaptacionCreated>('/admin/captaciones', {
        ...form,
        fotos,
        agenteId: isAgent ? undefined : form.agenteId,
      })

      toast.success(form.mostrarEnWeb ? 'Captacion creada y publicada' : 'Captacion creada')
      navigate(created.propiedad?.id ? `/admin/propiedades/${created.propiedad.id}` : `/admin/captaciones/${created.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo crear la captacion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-6 pb-1">
      <button onClick={() => navigate('/admin/captaciones')} className="text-[13px] font-semibold text-white/[0.44] transition-colors hover:text-white">
        Volver a captaciones
      </button>

      <section className="rounded-[30px] border border-gold/[0.14] bg-[#0b130d]/[0.90] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.24)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="rounded-full border border-gold/[0.18] bg-gold/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
              Captacion CRM
            </span>
            <h1 className="mt-3 text-[30px] font-black tracking-[-0.04em] text-white">Nueva captacion</h1>
            <p className="mt-1 max-w-2xl text-[13px] leading-6 text-white/[0.46]">
              Registra propietario, condiciones comerciales y decide si el inmueble entra directo al portal publico.
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black ${form.mostrarEnWeb ? 'border-emerald-400/[0.26] bg-emerald-400/[0.08] text-emerald-300' : 'border-white/[0.10] bg-white/[0.04] text-white/[0.42]'}`}>
            {form.mostrarEnWeb ? 'Publicar al guardar' : 'Solo CRM'}
          </span>
        </div>
      </section>

      <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <h2 className="text-[15px] font-bold text-white">Propietario</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Nombre</label>
                <input value={form.propietarioNombre} onChange={e => set('propietarioNombre')(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Telefono</label>
                <input value={form.propietarioTelefono} onChange={e => set('propietarioTelefono')(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.propietarioEmail} onChange={e => set('propietarioEmail')(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Documento</label>
                <input value={form.propietarioDoc} onChange={e => set('propietarioDoc')(e.target.value)} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <h2 className="text-[15px] font-bold text-white">Inmueble y precio</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Operacion</label>
                <select value={form.tipo} onChange={e => set('tipo')(e.target.value)} className={inputClass}>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tipo de inmueble</label>
                <select value={form.tipoInmueble} onChange={e => set('tipoInmueble')(e.target.value)} className={inputClass}>
                  {TIPOS_INMUEBLE.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Ciudad</label>
                <input value={form.ciudad} onChange={e => set('ciudad')(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Zona</label>
                <input value={form.zona} onChange={e => set('zona')(e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Direccion</label>
                <input value={form.direccion} onChange={e => set('direccion')(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Precio solicitado</label>
                <input value={form.precioSolicitado} onChange={e => set('precioSolicitado')(e.target.value)} required inputMode="decimal" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Precio sugerido</label>
                <input value={form.precioSugerido} onChange={e => set('precioSugerido')(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Moneda</label>
                <select value={form.moneda} onChange={e => set('moneda')(e.target.value)} className={inputClass}>
                  <option value="BOB">BOB</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Comision %</label>
                <input value={form.comisionPct} onChange={e => set('comisionPct')(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descripcion</label>
                <textarea value={form.descripcion} onChange={e => set('descripcion')(e.target.value)} rows={4} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <h2 className="text-[15px] font-bold text-white">Caracteristicas</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className={labelClass}>Dormitorios</label>
                <input value={form.dormitorios} onChange={e => set('dormitorios')(e.target.value)} inputMode="numeric" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Banos</label>
                <input value={form.banos} onChange={e => set('banos')(e.target.value)} inputMode="numeric" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Superficie m2</label>
                <input value={form.superficieM2} onChange={e => set('superficieM2')(e.target.value)} inputMode="decimal" className={inputClass} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <SwitchField checked={form.garage} onChange={set('garage')} label="Garage" description="Tiene parqueo." />
              <SwitchField checked={form.amueblado} onChange={set('amueblado')} label="Amueblado" description="Incluye muebles." />
              <SwitchField checked={form.piscina} onChange={set('piscina')} label="Piscina" description="Amenidad disponible." />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <h2 className="text-[15px] font-bold text-white">Publicacion</h2>
            <div className="mt-4">
              <SwitchField checked={form.mostrarEnWeb} onChange={set('mostrarEnWeb')} label="Mostrar en web" description={publishCopy} />
            </div>
          </section>

          {!isAgent && (
            <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
              <label className={labelClass}>Asesor responsable</label>
              <select value={form.agenteId} onChange={e => set('agenteId')(e.target.value)} required className={inputClass}>
                {agentes.map(a => <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>)}
              </select>
            </section>
          )}

          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <label className={labelClass}>Contrato URL</label>
            <input value={form.contratoUrl} onChange={e => set('contratoUrl')(e.target.value)} className={inputClass} />
            <div className="mt-4 grid gap-3">
              <div>
                <label className={labelClass}>Inicio exclusividad</label>
                <input type="date" value={form.exclusividadInicio} onChange={e => set('exclusividadInicio')(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fin exclusividad</label>
                <input type="date" value={form.exclusividadFin} onChange={e => set('exclusividadFin')(e.target.value)} className={inputClass} />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-gold/[0.11] bg-[#0b130d]/[0.86] p-5">
            <label className={labelClass}>Fotos por URL</label>
            <textarea value={form.fotos} onChange={e => set('fotos')(e.target.value)} rows={5} placeholder="https://..." className={`${inputClass} resize-none`} />
            <p className="mt-2 text-[12px] leading-relaxed text-white/[0.36]">Una URL por linea. Si publicas, estas fotos pasan a la propiedad.</p>
          </section>

          <button type="submit" disabled={saving} className="w-full rounded-2xl bg-gold px-5 py-4 text-[14px] font-black text-green-deep transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-55">
            {saving ? 'Guardando...' : 'Crear captacion'}
          </button>
        </aside>
      </form>
    </div>
  )
}
