import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { ProblemSolution } from '@/components/sections/ProblemSolution'
import { PlansSection } from '@/components/sections/PlansSection'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { ComparisonSection } from '@/components/sections/ComparisonSection'
import { SocialProof } from '@/components/sections/SocialProof'
import { AIShowcase } from '@/components/sections/AIShowcase'
import { MGMBanner } from '@/components/sections/MGMBanner'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { HomeFAQ } from '@/components/sections/HomeFAQ'
import { FinalCTA } from '@/components/sections/FinalCTA'

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ProblemSolution />
      <PlansSection />
      <HowItWorks />
      <ComparisonSection />
      <SocialProof />
      <AIShowcase />
      <MGMBanner />
      <BlogPreview />
      <HomeFAQ />
      <FinalCTA />
    </>
  )
}
