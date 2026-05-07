import { Footer } from "@/components/layout/footer"
import { LandingNavbar } from "@/components/layout/landing-navbar"
import { FeaturesSection } from "@/components/landing/features-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { UseCasesSection } from "@/components/landing/use-cases-section"
import { PageShell } from "@/components/shared/page-shell"

export function LandingPage() {
  return (
    <PageShell>
      <LandingNavbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <FinalCtaSection />
      <Footer />
    </PageShell>
  )
}
