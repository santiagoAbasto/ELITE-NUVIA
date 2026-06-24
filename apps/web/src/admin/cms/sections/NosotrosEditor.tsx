import RichTextEditor from '../shared/RichTextEditor'

interface TimelineEntry { id: string; anio: string; texto: string }
interface Stat { id: string; numero: string; etiqueta: string }
interface Datos { mision?: string; timeline?: TimelineEntry[]; stats?: Stat[] }
interface Props { datos: Datos; onChange: (d: Datos) => void }

export default function NosotrosEditor({ datos, onChange }: Props) {
  const timeline = datos.timeline ?? []
  const stats = datos.stats ?? []

  const addTimeline = () => onChange({
    ...datos, timeline: [...timeline, { id: `t-${Date.now()}`, anio: '', texto: '' }],
  })
  const updateTimeline = (idx: number, entry: TimelineEntry) => {
    const next = [...timeline]; next[idx] = entry
    onChange({ ...datos, timeline: next })
  }
  const removeTimeline = (idx: number) => onChange({ ...datos, timeline: timeline.filter((_, i) => i !== idx) })

  const addStat = () => onChange({
    ...datos, stats: [...stats, { id: `st-${Date.now()}`, numero: '', etiqueta: '' }],
  })
  const updateStat = (idx: number, stat: Stat) => {
    const next = [...stats]; next[idx] = stat
    onChange({ ...datos, stats: next })
  }
  const removeStat = (idx: number) => onChange({ ...datos, stats: stats.filter((_, i) => i !== idx) })

  const inputClass = 'bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors'

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Misión / Texto principal</label>
        <RichTextEditor value={datos.mision ?? ''} onChange={val => onChange({ ...datos, mision: val })} minHeight="140px" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Timeline / Historia</label>
          <button type="button" onClick={addTimeline} className="text-xs text-amber-400 hover:text-amber-300">+ Agregar entrada</button>
        </div>
        {timeline.map((entry, i) => (
          <div key={entry.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <input
                value={entry.anio}
                onChange={e => updateTimeline(i, { ...entry, anio: e.target.value })}
                placeholder="2024"
                className={`${inputClass} w-24`}
              />
              <button onClick={() => removeTimeline(i)} className="ml-auto text-zinc-600 hover:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <textarea
              value={entry.texto}
              onChange={e => updateTimeline(i, { ...entry, texto: e.target.value })}
              rows={2}
              placeholder="Descripción del hito..."
              className={`${inputClass} w-full resize-none`}
            />
          </div>
        ))}
        {timeline.length === 0 && (
          <button type="button" onClick={addTimeline} className="w-full py-2.5 border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 rounded-xl text-sm transition-colors">
            + Agregar entrada al timeline
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Estadísticas</label>
          <button type="button" onClick={addStat} className="text-xs text-amber-400 hover:text-amber-300">+ Agregar stat</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <div key={stat.id} className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={stat.numero}
                  onChange={e => updateStat(i, { ...stat, numero: e.target.value })}
                  placeholder="150+"
                  className={`${inputClass} w-full`}
                />
                <button onClick={() => removeStat(i)} className="flex-shrink-0 text-zinc-600 hover:text-red-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                value={stat.etiqueta}
                onChange={e => updateStat(i, { ...stat, etiqueta: e.target.value })}
                placeholder="Propiedades vendidas"
                className={`${inputClass} w-full`}
              />
            </div>
          ))}
        </div>
        {stats.length === 0 && (
          <button type="button" onClick={addStat} className="w-full py-2.5 border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 rounded-xl text-sm transition-colors">
            + Agregar estadística
          </button>
        )}
      </div>
    </div>
  )
}
