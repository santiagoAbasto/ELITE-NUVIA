interface Operacion {
  id: string
  label: string
  value: string
}

interface Datos {
  eyebrow?: string
  titulo?: string
  subtitulo?: string
  emptyTitulo?: string
  emptyTexto?: string
  ctaTexto?: string
  ctaUrl?: string
  operaciones?: Operacion[]
  tipos?: string[]
  ciudades?: string[]
}

interface Props {
  datos: Datos
  onChange: (d: Datos) => void
}

const inputClass = 'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors'
const labelClass = 'text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.38]'

function csv(values: string[] | undefined) {
  return (values ?? []).join(', ')
}

function fromCsv(value: string) {
  return value.split(',').map(v => v.trim()).filter(Boolean)
}

export default function PropiedadesEditor({ datos, onChange }: Props) {
  const operaciones = datos.operaciones ?? []
  const set = (k: keyof Datos) => (val: string) => onChange({ ...datos, [k]: val })

  const updateOperacion = (idx: number, operacion: Operacion) => {
    const next = [...operaciones]
    next[idx] = operacion
    onChange({ ...datos, operaciones: next })
  }

  const addOperacion = () => onChange({
    ...datos,
    operaciones: [...operaciones, { id: `op-${Date.now()}`, label: '', value: '' }],
  })

  const removeOperacion = (idx: number) => onChange({
    ...datos,
    operaciones: operaciones.filter((_, i) => i !== idx),
  })

  return (
    <div className="space-y-7">
      <div className="rounded-2xl border border-gold/[0.14] bg-gold/[0.055] p-4">
        <p className="text-[13px] font-semibold text-white">Contenido público recuperado</p>
        <p className="mt-1 text-[12px] leading-relaxed text-white/[0.46]">
          Los inmuebles reales se gestionan en CRM &gt; Propiedades. Esta sección controla los textos, filtros visibles y estados vacíos del listado público.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Eyebrow</label>
          <input value={datos.eyebrow ?? ''} onChange={e => set('eyebrow')(e.target.value)} placeholder="Inmuebles" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Título</label>
          <input value={datos.titulo ?? ''} onChange={e => set('titulo')(e.target.value)} placeholder="Todas las Propiedades" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Subtítulo</label>
        <textarea
          value={datos.subtitulo ?? ''}
          onChange={e => set('subtitulo')(e.target.value)}
          rows={3}
          placeholder="Venta, alquiler y anticretico..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Título sin resultados</label>
          <input value={datos.emptyTitulo ?? ''} onChange={e => set('emptyTitulo')(e.target.value)} placeholder="Sin resultados" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CTA sin resultados</label>
          <input value={datos.ctaTexto ?? ''} onChange={e => set('ctaTexto')(e.target.value)} placeholder="Ver todas las propiedades" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Mensaje sin resultados</label>
        <textarea
          value={datos.emptyTexto ?? ''}
          onChange={e => set('emptyTexto')(e.target.value)}
          rows={2}
          placeholder="No encontramos propiedades..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Tipos de inmueble</label>
          <input value={csv(datos.tipos)} onChange={e => onChange({ ...datos, tipos: fromCsv(e.target.value) })} placeholder="Casa, Departamento, Terreno" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Ciudades</label>
          <input value={csv(datos.ciudades)} onChange={e => onChange({ ...datos, ciudades: fromCsv(e.target.value) })} placeholder="Cochabamba, Santa Cruz" className={inputClass} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className={labelClass}>Tabs de operación</label>
          <button type="button" onClick={addOperacion} className="text-xs font-semibold text-gold hover:text-gold-light">
            Agregar tab
          </button>
        </div>
        <div className="space-y-2">
          {operaciones.map((operacion, idx) => (
            <div key={operacion.id} className="grid gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 md:grid-cols-[1fr_1fr_auto]">
              <input
                value={operacion.label}
                onChange={e => updateOperacion(idx, { ...operacion, label: e.target.value })}
                placeholder="En Venta"
                className={inputClass}
              />
              <input
                value={operacion.value}
                onChange={e => updateOperacion(idx, { ...operacion, value: e.target.value })}
                placeholder="VENTA"
                className={inputClass}
              />
              <button type="button" onClick={() => removeOperacion(idx)} className="rounded-lg px-3 text-sm font-semibold text-white/[0.42] hover:bg-red-400/[0.08] hover:text-red-300">
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
