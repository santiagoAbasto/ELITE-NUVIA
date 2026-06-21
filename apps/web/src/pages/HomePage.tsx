import { HeroSection } from '../components/home/HeroSection'
import { ServicesSection } from '../components/home/ServicesSection'
import { StatsSection } from '../components/home/StatsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <StatsSection />
    </div>
  )
}
