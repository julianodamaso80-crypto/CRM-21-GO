import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { ProblemSolution } from '@/components/sections/ProblemSolution'
import { SusepSection } from '@/components/sections/SusepSection'
import { PlansSection } from '@/components/sections/PlansSection'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { ComparisonSection } from '@/components/sections/ComparisonSection'
import { RejectedSection } from '@/components/sections/RejectedSection'
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
      <SusepSection />
      <PlansSection />
      <HowItWorks />
      <ComparisonSection />
      <RejectedSection />
      <SocialProof />
      <AIShowcase />
      <MGMBanner />
      <BlogPreview />
      <HomeFAQ />
      <FinalCTA />
    </>
  )
}
