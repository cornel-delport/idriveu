import { MobileShell } from "@/components/mobile-shell"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { MobileHero } from "@/components/landing/mobile-hero"
import { QuickBook } from "@/components/landing/quick-book"
import { ServiceCarousel } from "@/components/landing/service-carousel"
import { HowItWorks } from "@/components/landing/how-it-works"
import { TrustStack } from "@/components/landing/trust-stack"
import { Testimonials } from "@/components/landing/testimonials"
import { LandingCta } from "@/components/landing/landing-cta"

export default function HomePage() {
  return (
    <MobileShell>
      <main>
        <MobileHero />
        <QuickBook />
        <ServiceCarousel />
        <HowItWorks />
        <TrustStack />
        <Testimonials />
        <LandingCta />
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
