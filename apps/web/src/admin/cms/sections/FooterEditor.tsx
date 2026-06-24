import ImageUploader from '../shared/ImageUploader'

interface Link { id: string; label: string; url: string }
interface Datos {
  logoUrl?: string
  descripcion?: string
  links?: Link[]
  socialInstagram?: string
  socialFacebook?: string
  socialWhatsapp?: string
  textoLegal?: string
}
interface Props { datos: Datos; onChange: (d: Datos) => void }

export default function FooterEditor({ datos, onChange }: Props) {
  const links = datos.links ?? []
  const set = (k: keyof Datos) => (val: string) => onChange({ ...datos, [k]: val })
  const inputClass = 'w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors'

  const addLink = () => onChange({ ...datos, links: [...links, { id: `l-${Date.now()}`, label: '', url: '' }] })
  const updateLink = (idx: number, link: Link) => {
    const next = [...links]; next[idx] = link; onChange({ ...datos, links: next })
  }
  const removeLink = (idx: number) => onChange({ ...datos, links: links.filter((_, i) => i !== idx) })

  return (
    <div className="space-y-6">
      <ImageUploader value={datos.logoUrl} onChange={set('logoUrl')} label="Logo (versión clara para fondo oscuro)" />

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Descripción corta</label>
        <textarea
          value={datos.descripcion ?? ''}
          onChange={e => set('descripcion')(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Tu aliado en el mercado inmobiliario..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Links de navegación</label>
          <button type="button" onClick={addLink} className="text-xs text-amber-400 hover:text-amber-300">+ Agregar</button>
        </div>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={link.id} className="flex items-center gap-2">
              <input
                value={link.label}
                onChange={e => updateLink(i, { ...link, label: e.target.value })}
                placeholder="Propiedades"
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
              <input
                value={link.url}
                onChange={e => updateLink(i, { ...link, url: e.target.value })}
                placeholder="/propiedades"
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
              <button onClick={() => removeLink(i)} className="text-zinc-600 hover:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Redes sociales</label>
        <div className="space-y-2">
          {[
            { key: 'socialInstagram' as keyof Datos, label: 'Instagram URL' },
            { key: 'socialFacebook' as keyof Datos, label: 'Facebook URL' },
            { key: 'socialWhatsapp' as keyof Datos, label: 'WhatsApp número (con código país)' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-[11px] text-zinc-600">{label}</label>
              <input value={(datos[key] as string) ?? ''} onChange={e => set(key)(e.target.value)} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Texto legal / Copyright</label>
        <input value={datos.textoLegal ?? ''} onChange={e => set('textoLegal')(e.target.value)} placeholder="© 2025 ELITE Nuvia. Todos los derechos reservados." className={inputClass} />
      </div>
    </div>
  )
}
