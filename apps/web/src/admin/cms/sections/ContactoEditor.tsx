import RichTextEditor from '../shared/RichTextEditor'

interface Datos { direccion?: string; telefono?: string; email?: string; mapUrl?: string; horario?: string; whatsapp?: string }
interface Props { datos: Datos; onChange: (d: Datos) => void }

export default function ContactoEditor({ datos, onChange }: Props) {
  const set = (k: keyof Datos) => (val: string) => onChange({ ...datos, [k]: val })
  const inputClass = 'w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors'

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Teléfono</label>
          <input value={datos.telefono ?? ''} onChange={e => set('telefono')(e.target.value)} placeholder="+591 4 xxx xxxx" className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">WhatsApp</label>
          <input value={datos.whatsapp ?? ''} onChange={e => set('whatsapp')(e.target.value)} placeholder="+591 7xxx xxxx" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Correo electrónico</label>
        <input type="email" value={datos.email ?? ''} onChange={e => set('email')(e.target.value)} placeholder="info@elitenuvia.bo" className={inputClass} />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Dirección</label>
        <input value={datos.direccion ?? ''} onChange={e => set('direccion')(e.target.value)} placeholder="Av. Blanco Galindo km 5..." className={inputClass} />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">URL del mapa (iframe embed)</label>
        <input value={datos.mapUrl ?? ''} onChange={e => set('mapUrl')(e.target.value)} placeholder="https://maps.google.com/maps?..." className={inputClass} />
        {datos.mapUrl && (
          <p className="text-[11px] text-zinc-600">Vista previa disponible en el sitio público</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Horario de atención</label>
        <RichTextEditor value={datos.horario ?? ''} onChange={set('horario')} minHeight="80px" />
      </div>
    </div>
  )
}
