import { HeroSection } from '../components/home/HeroSection'
import { ScrollShowcase } from '../components/home/ScrollShowcase'
import { SearchSection } from '../components/home/SearchSection'
import { PropertiesSection } from '../components/home/PropertiesSection'
import { ServicesSection } from '../components/home/ServicesSection'
import { StatsSection } from '../components/home/StatsSection'
import { AgentsSection } from '../components/home/AgentsSection'
import { TestimonialsSection } from '../components/home/TestimonialsSection'
import { NewsletterSection } from '../components/home/NewsletterSection'

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.12) 30%, rgba(201,168,76,0.18) 50%, rgba(201,168,76,0.12) 70%, transparent 100%)',
        margin: '0',
      }}
    />
  )
}

export default function HomePage() {
  return (
    <div style={{ background: '#080e09' }}>
      <HeroSection />
      <ScrollShowcase />
      <SearchSection />
      <Divider />
      <div style={{ height: '80px', background: '#080e09' }} />
      <PropertiesSection />
      <div style={{ height: '80px', background: '#080e09' }} />
      <Divider />
      <ServicesSection />
      <Divider />
      <StatsSection />
      <Divider />
      <div style={{ height: '40px', background: '#080e09' }} />
      <AgentsSection />
      <div style={{ height: '40px', background: '#080e09' }} />
      <Divider />
      <TestimonialsSection />
      <Divider />
      <NewsletterSection />
    </div>
  )
}
