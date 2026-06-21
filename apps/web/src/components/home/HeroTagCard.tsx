import { FadeIn } from '../ui/FadeIn'
import { usePropiedadesCount } from '../../hooks/useProperties'

export function HeroTagCard() {
  const counts = usePropiedadesCount()
  const ciudades = ['Cochabamba', 'Santa Cruz', 'La Paz', 'Oruro']

  return (
    <FadeIn delay={1400} y={0}>
      <div className="liquid-glass border border-white/18 rounded-xl p-5 min-w-[240px]">
        <div className="text-white/35 text-[10px] font-semibold tracking-[2.5px] uppercase mb-4">Disponible ahora</div>
        {[
          { label: 'Venta', count: counts.venta, active: true },
          { label: 'Alquiler', count: counts.alquiler, active: true },
          { label: 'Anticretico', count: counts.anticretico, active: false },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 py-2.5 border-b border-white/06 last:border-0">
            <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-gold' : 'bg-white/30'}`} />
            <span className="text-white/85 text-[14px] font-medium flex-1">{item.label}</span>
            <span className="text-gold text-[11px] font-semibold">{item.count} inmuebles</span>
          </div>
        ))}
        <div className="mt-4 pt-3.5 border-t border-white/06">
          <div className="text-white/30 text-[10px] tracking-[1.5px] uppercase mb-2">Ciudades</div>
          <div className="flex flex-wrap gap-1.5">
            {ciudades.map(c => (
              <span key={c} className="bg-white/06 text-white/55 px-2.5 py-0.5 rounded-full text-[11px]">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}
