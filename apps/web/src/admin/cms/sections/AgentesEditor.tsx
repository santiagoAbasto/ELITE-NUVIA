interface Datos {
  eyebrow?: string
  titulo?: string
  subtitulo?: string
  ctaTexto?: string
  ctaUrl?: string
  gestionNota?: string
}

interface Props {
  datos: Datos
  onChange: (d: Datos) => void
}

const inputClass = 'w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors'
const labelClass = 'text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.38]'

export default function AgentesEditor({ datos, onChange }: Props) {
  const set = (k: keyof Datos) => (val: string) => onChange({ ...datos, [k]: val })

  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="rounded-2xl border border-gold/[0.14] bg-gold/[0.055] p-4">
          <p className="text-[13px] font-semibold text-white">Equipo público conectado al CRM</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/[0.46]">
            Los nombres, fotos, slugs y conteos de propiedades vienen del módulo de agentes. Aquí se ajustan los textos que envuelven ese carrusel público.
          </p>
        </div>
        <a
          href="/admin/agentes"
          className="flex items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-center text-[13px] font-semibold text-gold transition-colors hover:border-gold/[0.24] hover:bg-gold/[0.08]"
        >
          Ir a CRM Agentes
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Eyebrow</label>
          <input value={datos.eyebrow ?? ''} onChange={e => set('eyebrow')(e.target.value)} placeholder="Nuestro equipo" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>CTA</label>
          <input value={datos.ctaTexto ?? ''} onChange={e => set('ctaTexto')(e.target.value)} placeholder="Conocer agentes" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Título de sección</label>
        <input
          value={datos.titulo ?? ''}
          onChange={e => set('titulo')(e.target.value)}
          placeholder="Un equipo comprometido contigo"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Subtítulo</label>
        <textarea
          value={datos.subtitulo ?? ''}
          onChange={e => set('subtitulo')(e.target.value)}
          rows={3}
          placeholder="Profesionales con anos de experiencia..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>URL del CTA</label>
          <input value={datos.ctaUrl ?? ''} onChange={e => set('ctaUrl')(e.target.value)} placeholder="/nosotros#agentes" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Nota interna</label>
          <input value={datos.gestionNota ?? ''} onChange={e => set('gestionNota')(e.target.value)} placeholder="Los perfiles se gestionan desde CRM" className={inputClass} />
        </div>
      </div>
    </div>
  )
}
