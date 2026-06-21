import { HeroSection } from '../components/home/HeroSection'
import { PropertiesSection } from '../components/home/PropertiesSection'
import { ServicesSection } from '../components/home/ServicesSection'
import { StatsSection } from '../components/home/StatsSection'
import { AgentsSection } from '../components/home/AgentsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <PropertiesSection />
      <ServicesSection />
      <StatsSection />
      <AgentsSection />
      <TestimonialsSection />
    </div>
  )
}
