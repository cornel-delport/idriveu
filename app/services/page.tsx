import Link from "next/link"
import { Check, ShieldCheck, Car, UserCheck, MapPin } from "lucide-react"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { ServiceCard } from "@/components/service-card"
import { services } from "@/lib/services"

export const metadata = {
  title: "Services — IDriveU",
  description:
    "All IDriveU services in Plettenberg Bay: Drive Me Home, Wine Farm Driver, Airport Transfers, Restaurant Pickup, Vehicle Collection, Parcel Delivery, Safe Child Pickup, Tourist Day Driver.",
}

const trustBadges = [
  { icon: ShieldCheck, label: "Verified drivers" },
  { icon: Car, label: "Your own car" },
  { icon: UserCheck, label: "Female driver option" },
  { icon: MapPin, label: "Local to Plett" },
]

export default function ServicesPage() {
  return (
    <MobileShell>
      <AppTopBar title="Services" />
      <main className="px-4 pt-4">
        <section>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
            What we do
          </p>
          <h1 className="mt-1 text-balance text-[30px] font-semibold leading-[1.08] tracking-tight">
            What can we help you with?
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Choose a service — you can change it later.
          </p>
        </section>

        {/* Card grid — mirrors the brand reference */}
        <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </section>

        {/* Trust row */}
        <section className="mt-8">
          <h2 className="text-[15px] font-semibold tracking-tight">
            Why families in Plett choose IDriveU
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {trustBadges.map((b) => (
              <li
                key={b.label}
                className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <b.icon className="h-4 w-4" />
                </span>
                <span className="text-[12.5px] font-medium text-foreground">
                  {b.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Feature details — mini cards */}
        <section className="mt-8 flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight">
            Details & what&apos;s included
          </h2>
          {services.map((s) => (
            <details
              key={s.id}
              id={s.id}
              className="group rounded-2xl border border-border bg-card p-4 open:shadow-sm"
            >
              <summary className="flex cursor-pointer items-start justify-between gap-3 list-none">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <s.icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold leading-tight tracking-tight">
                      {s.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] font-medium text-accent">
                      {s.tagline}
                    </p>
                  </div>
                </div>
                <span className="mt-1 text-[11px] font-semibold text-muted-foreground group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {s.longDescription}
                </p>
                <ul className="mt-3 grid grid-cols-1 gap-1.5">
                  {s.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px]"
                    >
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[14px] font-semibold">
                    {s.priceLabel}
                  </span>
                  <Link
                    href={`/book?service=${s.id}`}
                    className="tap inline-flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-semibold text-accent-foreground shadow-[0_10px_24px_-10px_rgba(25,118,210,0.6)]"
                  >
                    Book
                  </Link>
                </div>
              </div>
            </details>
          ))}
        </section>

        {/* Custom CTA — dark card variant */}
        <section className="mt-8 pb-6">
          <div className="card-dark relative overflow-hidden rounded-[26px] p-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#4FC3F7]/20 blur-3xl"
            />
            <h3 className="relative text-[22px] font-semibold leading-tight tracking-tight text-white">
              Need something custom?
            </h3>
            <p className="relative mt-2 text-[13px] leading-relaxed text-white/75">
              Weddings, tour groups, corporate accounts, matric dances — we
              build quotes around your plans.
            </p>
            <div className="relative mt-4 flex gap-2">
              <Link
                href="/contact"
                className="tap btn-glow inline-flex h-11 flex-1 items-center justify-center rounded-xl text-[13px] font-semibold"
              >
                Get a quote
              </Link>
              <Link
                href="/book"
                className="tap inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-white/10 text-[13px] font-semibold text-white ring-1 ring-white/15"
              >
                Book a trip
              </Link>
            </div>
          </div>
        </section>

        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}
