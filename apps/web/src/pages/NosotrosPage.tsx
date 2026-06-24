import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AgentsSection } from '../components/home/AgentsSection'
import { StatsSection, type StatsSectionItem } from '../components/home/StatsSection'
import { useCmsSection } from '../hooks/useCmsSection'
import { DEFAULT_CMS_DATA } from '../lib/cmsDefaults'

// Icons premium — línea fina, únicos, sin ambigüedad
const IconAward = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
)

const IconShieldCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
)

const IconStar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const IconCompass = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
)

const VALORES = [
  {
    icon: <IconAward />,
    num: '01',
    titulo: 'Excelencia',
    desc: 'Cada propiedad que gestionamos recibe atención profesional de primer nivel. No trabajamos con cantidad, trabajamos con calidad.',
    acento: 'rgba(201,168,76,0.06)',
  },
  {
    icon: <IconShieldCheck />,
    num: '02',
    titulo: 'Confianza',
    desc: 'Transparencia absoluta en cada paso del proceso. Sin sorpresas, sin letras pequeñas, sin costos ocultos.',
    acento: 'rgba(201,168,76,0.04)',
  },
  {
    icon: <IconStar />,
    num: '03',
    titulo: 'Calidad',
    desc: 'Solo representamos propiedades verificadas que cumplen nuestros estándares. Cada ficha es precisa y actualizada.',
    acento: 'rgba(201,168,76,0.06)',
  },
  {
    icon: <IconCompass />,
    num: '04',
    titulo: 'Conocimiento local',
    desc: 'Más de 8 años en el mercado boliviano. Conocemos cada zona, cada precio y cada oportunidad en 4 ciudades.',
    acento: 'rgba(201,168,76,0.04)',
  },
]

const HITOS = [
  { year: '2016', num: '01', texto: 'Fundación en Cochabamba con 3 asesores especializados.' },
  { year: '2018', num: '02', texto: 'Expansión a Santa Cruz y La Paz.' },
  { year: '2020', num: '03', texto: 'Plataforma digital y CRM propio.' },
  { year: '2023', num: '04', texto: 'Llegamos a Oruro. 4 ciudades, 1 equipo.' },
  { year: '2025', num: '05', texto: '+200 familias. Nuevas metas.' },
]

interface TimelineEntry {
  id: string
  anio: string
  texto: string
}

interface CmsStat {
  id: string
  numero: string
  etiqueta: string
}

interface NosotrosCms {
  mision?: string
  timeline?: TimelineEntry[]
  stats?: CmsStat[]
}

function parseStat(stat: CmsStat): StatsSectionItem {
  const match = stat.numero.match(/^(\+)?(\d+)(.*)$/)
  return {
    value: match ? Number(match[2]) : Number(stat.numero) || 0,
    prefix: match?.[1] ?? '',
    suffix: match?.[3] ?? '',
    label: stat.etiqueta,
    sublabel: '',
  }
}

export default function NosotrosPage() {
  const cms = useCmsSection<NosotrosCms>('nosotros', DEFAULT_CMS_DATA.nosotros as NosotrosCms)
  const hitos = cms.timeline?.length
    ? cms.timeline.map((h, i) => ({ year: h.anio, num: String(i + 1).padStart(2, '0'), texto: h.texto }))
    : HITOS
  const stats = cms.stats?.length ? cms.stats.map(parseStat) : undefined

  return (
    <div className="min-h-screen" style={{ background: '#080e09' }}>

      {/* ─── HEADER ─── */}
      <div className="relative pt-28 pb-20" style={{ background: 'linear-gradient(180deg, #0D3B27 0%, #080e09 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        <div className="wrap">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Quiénes somos</span>
          </div>
          <div className="max-w-[640px]">
            <h1 className="text-[42px] md:text-[54px] font-bold text-white leading-[1.05] mb-6" style={{ letterSpacing: '-0.03em' }}>
              Un equipo comprometido contigo,{' '}
              <em className="not-italic text-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
                cumpliendo sueños.
              </em>
            </h1>
            <p className="text-white/50 text-[15px] leading-[1.8] max-w-[520px]">
              {cms.mision ?? 'ELITE Nuvia nació con la misión de hacer que encontrar tu hogar ideal sea una experiencia transparente, profesional y sin complicaciones. Hoy somos el referente inmobiliario en 4 ciudades bolivianas.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── VALORES ─── */}
      <div className="wrap" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-px bg-gold" />
          <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Nuestros valores</span>
        </div>
        <h2 className="text-[34px] font-bold text-white mb-14" style={{ letterSpacing: '-0.025em' }}>
          Lo que nos define
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALORES.map((v, i) => (
            <motion.div
              key={v.titulo}
              className="relative rounded-[20px] p-7 overflow-hidden group"
              style={{
                background: v.acento,
                border: '1px solid rgba(201,168,76,0.1)',
              }}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ borderColor: 'rgba(201,168,76,0.28)', y: -3 }}
            >
              {/* Número decorativo */}
              <div
                className="absolute top-5 right-6 font-bold text-[11px] tracking-[2px]"
                style={{ color: 'rgba(201,168,76,0.2)', fontVariantNumeric: 'tabular-nums' }}
              >
                {v.num}
              </div>

              {/* Línea top */}
              <div
                className="absolute top-0 left-6 right-6 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-6"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  color: '#C9A84C',
                }}
              >
                {v.icon}
              </div>

              <h3 className="text-white font-bold text-[18px] mb-3 leading-tight">{v.titulo}</h3>
              <p className="text-white/40 text-[13px] leading-[1.7]">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── TIMELINE ─── */}
      <div style={{ background: '#060d08', padding: '80px 0' }}>
        <div className="wrap">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px bg-gold" />
            <span className="text-gold text-[11px] font-bold tracking-[3px] uppercase">Historia</span>
          </div>
          <h2 className="text-[34px] font-bold text-white mb-16" style={{ letterSpacing: '-0.025em' }}>
            Nuestra trayectoria
          </h2>

          {/* Desktop timeline */}
          <div className="hidden md:block relative">
            {/* Línea horizontal base */}
            <div
              className="absolute top-[28px] left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.25) 20%, rgba(201,168,76,0.25) 80%, rgba(201,168,76,0.06) 100%)' }}
            />

            <div className="grid grid-cols-5 gap-6">
              {hitos.map((h, i) => (
                <motion.div
                  key={h.year}
                  className="relative pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Dot sobre la línea */}
                  <div className="relative z-10 w-[14px] h-[14px] rounded-full border-2 border-gold mb-6 mx-auto" style={{ background: '#060d08', boxShadow: '0 0 0 4px rgba(201,168,76,0.08)' }}>
                    <div className="absolute inset-[2px] rounded-full bg-gold opacity-70" />
                  </div>

                  {/* Número */}
                  <div className="text-center text-[10px] font-bold tracking-[2px] mb-2" style={{ color: 'rgba(201,168,76,0.35)' }}>
                    {h.num}
                  </div>

                  {/* Año */}
                  <div className="text-center font-bold text-[22px] text-gold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    {h.year}
                  </div>

                  {/* Texto */}
                  <p className="text-center text-white/40 text-[12.5px] leading-[1.6]">
                    {h.texto}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="md:hidden space-y-0">
            {hitos.map((h, i) => (
              <motion.div
                key={h.year}
                className="flex gap-5 pb-8"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {/* Línea vertical */}
                <div className="flex flex-col items-center">
                  <div className="w-[12px] h-[12px] rounded-full border-2 border-gold flex-shrink-0 mt-1" style={{ background: '#060d08' }}>
                    <div className="absolute inset-[1px] rounded-full bg-gold opacity-70" style={{ position: 'relative', inset: '2px' }} />
                  </div>
                  {i < hitos.length - 1 && (
                    <div className="w-px flex-1 mt-2" style={{ background: 'rgba(201,168,76,0.15)', minHeight: '32px' }} />
                  )}
                </div>
                <div className="pb-2">
                  <div className="text-[10px] font-bold tracking-[2px] mb-1" style={{ color: 'rgba(201,168,76,0.35)' }}>{h.num}</div>
                  <div className="text-gold font-bold text-[20px] mb-1" style={{ letterSpacing: '-0.02em' }}>{h.year}</div>
                  <p className="text-white/40 text-[13px] leading-relaxed">{h.texto}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <StatsSection stats={stats} />

      {/* ─── EQUIPO ─── */}
      <div id="agentes">
        <AgentsSection />
      </div>

      {/* ─── CTA ─── */}
      <div style={{ background: '#060d08', padding: '80px 0' }}>
        <div className="wrap text-center">
          <div className="max-w-[480px] mx-auto">
            <div className="text-gold text-[11px] font-bold tracking-[3px] uppercase mb-4">Trabajemos juntos</div>
            <h2 className="text-[32px] font-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
              Listos para ayudarte hoy
            </h2>
            <p className="text-white/38 text-[14px] mb-8 leading-relaxed">
              Sin compromiso. Sin costos ocultos. Solo resultados reales para tu familia.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                to="/contacto"
                className="bg-gold text-green-deep px-8 py-3.5 rounded-xl font-bold text-[13px] hover:bg-gold-light transition-colors"
              >
                Contactar ahora
              </Link>
              <Link
                to="/propiedades"
                className="border border-white/[0.12] text-white/70 px-8 py-3.5 rounded-xl font-semibold text-[13px] hover:bg-white/[0.05] transition-colors"
              >
                Ver propiedades
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
