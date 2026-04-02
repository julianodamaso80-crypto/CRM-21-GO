import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { ProblemSolution } from '@/components/sections/ProblemSolution'
import { SusepSection } from '@/components/sections/SusepSection'
import { InlineCTA } from '@/components/sections/InlineCTA'
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

      <InlineCTA
        text="Descubra quanto custa proteger seu veículo. Simulação em 30 segundos."
        buttonText="Fazer Simulação Grátis"
        bg="white"
      />

      <PlansSection />
      <HowItWorks />

      <InlineCTA
        text="Receba seu orçamento agora. Sem compromisso, sem análise de perfil."
        buttonText="Receber Orçamento"
        bg="gray"
      />

      <ComparisonSection />
      <RejectedSection />

      <InlineCTA
        text="Carro, moto, app ou leilão. Faça sua simulação personalizada."
        buttonText="Cotar Agora"
        bg="gray"
      />

      <SocialProof />
      <AIShowcase />

      <InlineCTA
        text="Proteção completa a partir de poucos reais por dia. Simule grátis."
        buttonText="Simular Proteção"
        bg="white"
      />

      <MGMBanner />
      <BlogPreview />

      <InlineCTA
        text="Ainda tem dúvida? Faça a simulação e veja o valor para o seu veículo."
        buttonText="Ver Meu Valor"
        bg="gray"
      />

      <HomeFAQ />
      <FinalCTA />
    </>
  )
}
