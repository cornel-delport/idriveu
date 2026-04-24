import Link from "next/link"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { ShieldCheck, Users, Car, PhoneCall, CreditCard, Baby } from "lucide-react"

const sections = [
  {
    icon: ShieldCheck,
    title: "Vetted, insured drivers",
    body:
      "Every IDriveU driver passes a criminal and driving record check, signs our code of conduct, and is covered by passenger indemnity insurance while on trip. You can see your driver's name, photo and rating before they arrive.",
  },
  {
    icon: Car,
    title: "Your car, your keys",
    body:
      "For Drive Me Home and Wine Farm Driver trips, we drive your own vehicle with you as a passenger. We inspect the vehicle with you at pickup and follow the route you agree to. Only the assigned driver ever handles your keys.",
  },
  {
    icon: Users,
    title: "Trusted contacts & live trip share",
    body:
      "You can share a live trip link with up to three trusted contacts. They'll see the driver's name, vehicle, and live location until the trip ends. We recommend this for late-night rides and first-time bookings.",
  },
  {
    icon: Baby,
    title: "Child pickups",
    body:
      "Child pickup trips require a pre-authorised adult name, school, and collection instructions. Drivers will only release the child to the adult named on the booking. All child trips are completed by vetted, female-preference drivers where possible.",
  },
  {
    icon: PhoneCall,
    title: "24/7 dispatch & SOS",
    body:
      "Our dispatch line is open around the clock. If you ever feel unsafe, tap the SOS button in the live trip screen — we'll call you within 60 seconds and can alert South African Police Service on your behalf.",
  },
  {
    icon: CreditCard,
    title: "Fair, transparent pricing",
    body:
      "Every booking shows an estimated price before you confirm. We only charge more than the estimate if you add stops, waiting time, or extend the trip — and we always message you first. Cancellations made more than 2 hours before pickup are free.",
  },
]

export default function TermsPage() {
  const updated = "24 April 2026"
  return (
    <MobileShell>
      <AppTopBar title="Terms & safety" showBack />

      <section className="px-5 pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Last updated · {updated}
        </p>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-balance">
          How we keep Plett moving, safely.
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          IDriveU is a local, personal driver service built on six promises. These sit on top of our full terms of service.
        </p>
      </section>

      <section className="mt-6 flex flex-col gap-3 px-5 pb-6">
        {sections.map(({ icon: Icon, title, body }) => (
          <article
            key={title}
            className="rounded-3xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[16px] font-semibold tracking-tight">{title}</h2>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </div>
          </article>
        ))}

        {/* Full terms CTA */}
        <div className="mt-2 rounded-3xl border border-dashed border-border bg-muted/40 p-5 text-center">
          <h2 className="text-[15px] font-semibold tracking-tight">Full terms of service</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pricing rules, liability, refunds and privacy policy.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground"
          >
            Request by email
          </Link>
        </div>
      </section>

      <BottomNavSpacer />
      <BottomNav />
    </MobileShell>
  )
}
