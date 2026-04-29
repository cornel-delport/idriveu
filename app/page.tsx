import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { roleRedirectUrl } from "@/lib/auth-redirect"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { MobileHero } from "@/components/landing/mobile-hero"
import { QuickBook } from "@/components/landing/quick-book"
import { ServiceCarousel } from "@/components/landing/service-carousel"
import { HowItWorks } from "@/components/landing/how-it-works"
import { TrustStack } from "@/components/landing/trust-stack"
import { Testimonials } from "@/components/landing/testimonials"
import { LandingCta } from "@/components/landing/landing-cta"
import { RestaurantQrFeatureCard } from "@/components/restaurant/restaurant-qr-feature-card"

export const dynamic = "force-dynamic"

/**
 * Role-aware landing.
 * - Unauthenticated → public landing page (hero + quick book + trust)
 * - Customer        → /home
 * - Admin / Super   → /home (with Manage Users CTA)
 * - Driver          → /driver/jobs
 *
 * Destinations resolved via lib/auth-redirect.ts.
 */
export default async function HomePage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role) redirect(roleRedirectUrl(role))

  // No session — show public marketing landing
  return (
    <MobileShell>
      <main>
        <MobileHero />
        {/* Restaurant QR pickup — primary new feature, sits above the fold */}
        <RestaurantQrFeatureCard />
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
