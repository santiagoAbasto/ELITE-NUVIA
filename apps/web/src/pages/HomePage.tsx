import { Seo, SITE_URL } from '../components/Seo'
import { HeroSection } from '../components/home/HeroSection'
import { ScrollShowcase } from '../components/home/ScrollShowcase'
import { SearchSection } from '../components/home/SearchSection'
import { PropertiesSection } from '../components/home/PropertiesSection'
import { ServicesSection } from '../components/home/ServicesSection'
import { StatsSection } from '../components/home/StatsSection'
import { AgentsSection } from '../components/home/AgentsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { NewsletterSection } from '../components/home/NewsletterSection'

// Separador invisible: sólo espacio y fondo unificado, sin línea visible
function Spacer({ size = 96 }: { size?: number }) {
  return <div style={{ height: `${size}px`, background: '#080e09' }} />
}

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'ELITE Nuvia',
  url: SITE_URL,
  image: `${SITE_URL}/og-cover.jpg`,
  areaServed: {
    '@type': 'City',
    name: 'Cochabamba',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cochabamba',
    addressCountry: 'BO',
  },
}

export default function HomePage() {
  return (
    <div style={{ background: '#080e09' }}>
      <Seo
        title="ELITE Nuvia — Inmobiliaria en Cochabamba | Venta, Alquiler y Anticrético"
        description="Encuentra tu propiedad ideal en Cochabamba, Bolivia. Casas, departamentos y garzoniers en venta, alquiler y anticrético. Asesoría personalizada con agentes certificados."
        path="/"
        jsonLd={ORG_JSON_LD}
      />
      <HeroSection />
      <ScrollShowcase />
      <SearchSection />
      <Spacer size={96} />
      <PropertiesSection />
      <Spacer size={96} />
      <ServicesSection />
      <StatsSection />
      <Spacer size={40} />
      <AgentsSection />
      <Spacer size={40} />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  )
}
