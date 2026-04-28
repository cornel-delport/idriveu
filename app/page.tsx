import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { MobileHero } from "@/components/landing/mobile-hero"
import { QuickBook } from "@/components/landing/quick-book"
import { ServiceCarousel } from "@/components/landing/service-carousel"
import { HowItWorks } from "@/components/landing/how-it-works"
import { TrustStack } from "@/components/landing/trust-stack"
import { Testimonials } from "@/components/landing/testimonials"
import { LandingCta } from "@/components/landing/landing-cta"

export const dynamic = "force-dynamic"

/**
 * Role-aware landing.
 * - Unauthenticated → public landing page (hero + quick book + trust)
 * - Customer        → /dashboard
 * - Driver          → /driver
 * - Admin / Super   → /admin
 *
 * Per-role redirects let each role land on a tailored home, while still
 * exposing the marketing site to people not yet signed in.
 */
export default async function HomePage() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (role === "customer") redirect("/dashboard")
  if (role === "driver") redirect("/driver")
  if (role === "admin" || role === "super_admin") redirect("/admin")

  // No session — show public marketing landing
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
