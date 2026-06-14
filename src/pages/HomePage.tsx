import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { WhyJoinSection } from '@/components/sections/WhyJoinSection'
import { SafetyRulesSection } from '@/components/sections/SafetyRulesSection'
import { LeadershipSection } from '@/components/sections/LeadershipSection'
import { TestimonialsSection } from '@/components/sections/TestimonialsSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { CTASection } from '@/components/sections/CTASection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <WhyJoinSection />
      <SafetyRulesSection />
      <LeadershipSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  )
}
