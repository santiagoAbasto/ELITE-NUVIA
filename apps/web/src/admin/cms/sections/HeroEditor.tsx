import ImageUploader from '../shared/ImageUploader'

interface HeroDatos {
  videoUrl?: string
  titulo?: string
  subtitulo?: string
  ctaTexto?: string
  ctaUrl?: string
  badgeTexto?: string
}

interface Props { datos: HeroDatos; onChange: (datos: HeroDatos) => void }

export default function HeroEditor({ datos, onChange }: Props) {
  const set = (key: keyof HeroDatos) => (val: string) => onChange({ ...datos, [key]: val })

  return (
    <div className="space-y-6">
      <ImageUploader
        value={datos.videoUrl}
        onChange={set('videoUrl')}
        label="Video de fondo"
        accept="video/*,image/*"
        tip="MP4 recomendado. Máximo 20 MB."
      />

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Badge / Eyebrow</label>
        <input
          value={datos.badgeTexto ?? ''}
          onChange={e => set('badgeTexto')(e.target.value)}
          placeholder="Ej: Inmobiliaria Premium"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Título principal</label>
        <input
          value={datos.titulo ?? ''}
          onChange={e => set('titulo')(e.target.value)}
          placeholder="Tu hogar ideal en Bolivia"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase tracking-wider">Subtítulo</label>
        <textarea
          value={datos.subtitulo ?? ''}
          onChange={e => set('subtitulo')(e.target.value)}
          rows={2}
          placeholder="Descubre propiedades exclusivas..."
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Texto del botón CTA</label>
          <input
            value={datos.ctaTexto ?? ''}
            onChange={e => set('ctaTexto')(e.target.value)}
            placeholder="Ver propiedades"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">URL del botón CTA</label>
          <input
            value={datos.ctaUrl ?? ''}
            onChange={e => set('ctaUrl')(e.target.value)}
            placeholder="/propiedades"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
