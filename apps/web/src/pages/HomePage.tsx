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

export default function HomePage() {
  return (
    <div style={{ background: '#080e09' }}>
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
