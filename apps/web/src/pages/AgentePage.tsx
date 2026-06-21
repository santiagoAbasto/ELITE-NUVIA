import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { PropertyCard } from '../components/home/PropertyCard'
import { whatsappUrl } from '../lib/utils'
import type { AgentePublico, PropiedadPublica } from '@elite/types'

type AgenteConProps = AgentePublico & { propiedades: PropiedadPublica[] }

export default function AgentePage() {
  const { slug } = useParams<{ slug: string }>()
  const [agente, setAgente] = useState<AgenteConProps | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    api.agentes.bySlug(slug)
      .then((data: AgenteConProps) => setAgente(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080e09' }}>
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  )

  if (!agente) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#080e09' }}>
      <div className="text-white/20 text-6xl">👤</div>
      <h1 className="text-white text-2xl font-bold">Agente no encontrado</h1>
      <Link to="/nosotros" className="text-gold text-[13px] underline">Ver todos los agentes</Link>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>
      {/* Header agente */}
      <div className="pt-28 pb-16" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="wrap">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full border-4 border-gold/40 bg-gold/10 flex items-center justify-center flex-shrink-0">
              {agente.foto ? (
                <img src={agente.foto} alt={`${agente.nombre} ${agente.apellido}`} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-gold text-3xl font-bold">
                  {agente.nombre[0]}{agente.apellido[0]}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-2">Asesor/a Inmobiliaria</div>
              <h1 className="text-[36px] font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                {agente.nombre} {agente.apellido}
              </h1>
              {agente.bio && (
                <p className="text-white/55 text-[14px] leading-relaxed max-w-[500px]">{agente.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-5">
                <a
                  href={whatsappUrl(agente.whatsapp, `Hola ${agente.nombre}, me gustaria recibir asesoramiento inmobiliario.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[12.5px]"
                  style={{ background: '#25D366', color: '#fff' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`tel:${agente.telefono}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[12.5px] border border-white/12 text-white/70 hover:bg-white/05 transition-colors"
                >
                  📞 {agente.telefono}
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/05 border border-white/08 rounded-2xl p-6 text-center min-w-[140px]">
              <div className="text-[40px] font-extrabold text-gold leading-none">
                {agente.propiedades?.length ?? agente.propiedadesCount ?? 0}
              </div>
              <div className="text-white/40 text-[11px] mt-2 uppercase tracking-wider">Propiedades activas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Propiedades del agente */}
      <div className="wrap pb-24">
        <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-6">
          Propiedades de {agente.nombre}
        </div>
        {agente.propiedades && agente.propiedades.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
            {agente.propiedades.map(p => (
              <PropertyCard key={p.id} propiedad={p} />
            ))}
          </div>
        ) : (
          <div className="text-white/30 text-[14px] py-12 text-center">
            No hay propiedades activas en este momento.
          </div>
        )}
      </div>
    </div>
  )
}
