import { motion } from 'framer-motion'
import type { AgentePublico } from '@elite/types'
import { whatsappUrl } from '../../lib/utils'

interface AgentCardProps {
  agente: AgentePublico
}

export function AgentCard({ agente }: AgentCardProps) {
  const initials = `${agente.nombre[0]}${agente.apellido[0]}`

  return (
    <motion.div
      data-cursor="perfil"
      className="flex-shrink-0 w-[220px] rounded-[18px] border border-white/08 bg-[#0d1a10] p-6 flex flex-col items-center text-center"
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px rgba(201,168,76,0.15)',
        borderColor: 'rgba(201,168,76,0.5)',
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <div
          className="w-[76px] h-[76px] rounded-full border-2 border-gold/50 overflow-hidden flex items-center justify-center bg-gold/10"
        >
          {agente.foto ? (
            <img
              src={agente.foto}
              alt={`${agente.nombre} ${agente.apellido}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gold text-xl font-bold">{initials}</span>
          )}
        </div>
        {/* Online indicator */}
        <div
          className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d1a10]"
          style={{ background: '#22c55e' }}
        />
      </div>

      <div className="text-white font-semibold text-[15px] leading-tight">
        {agente.nombre} {agente.apellido}
      </div>
      <div className="text-white/40 text-[11.5px] mt-1">Asesor/a Inmobiliaria</div>

      <div className="w-full border-t border-white/06 my-4" />

      <div className="text-white/55 text-[12px] mb-4">
        <span className="text-gold font-semibold text-[14px]">
          {agente.propiedadesCount ?? 0}
        </span>{' '}
        propiedades activas
      </div>

      <a
        href={whatsappUrl(agente.whatsapp, `Hola ${agente.nombre}, me gustaría obtener asesoramiento inmobiliario.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-gold/10 border border-gold/25 text-gold text-[12px] font-semibold py-2.5 rounded-lg hover:bg-gold/20 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Contactar
      </a>
    </motion.div>
  )
}
