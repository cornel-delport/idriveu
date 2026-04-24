import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { services } from "@/lib/services"

export const metadata = {
  title: "Services — IDriveU",
  description:
    "All IDriveU services in Plettenberg Bay: Drive Me Home, Wine Farm Driver, Airport Transfers, Event Pickup, Vehicle Collection, Parcel & Errands, Safe Child Pickup, Tourist Day Driver.",
}

export default function ServicesPage() {
  return (
    <MobileShell>
      <AppTopBar title="Services" />
      <main className="px-4 pt-4">
        <section>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
            What we do
          </p>
          <h1 className="mt-1 text-balance text-[28px] font-semibold leading-tight tracking-tight">
            Trusted private driver services in Plett.
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Pick the service you need — every trip is driven by a vetted,
            friendly local.
          </p>
        </section>

        <section className="mt-5 flex flex-col gap-3 pb-6">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <article
                key={s.id}
                id={s.id}
                className="rounded-3xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-[17px] font-semibold tracking-tight">
                        {s.name}
                      </h2>
                      <p className="mt-0.5 text-[12px] font-medium text-primary">
                        {s.tagline}
                      </p>
                    </div>
                  </div>
                  {s.badge && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                      {s.badge}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                  {s.longDescription}
                </p>

                <ul className="mt-3 grid grid-cols-1 gap-1.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[14px] font-semibold">
                    {s.priceLabel}
                  </span>
                  <Link
                    href={`/book?service=${s.id}`}
                    className="tap inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
                  >
                    Book <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </section>

        <section className="pb-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
            <h3 className="relative text-[20px] font-semibold leading-tight tracking-tight">
              Need something custom?
            </h3>
            <p className="relative mt-1.5 text-[13px] leading-relaxed text-primary-foreground/80">
              Weddings, tour groups, corporate accounts, matric dances — we
              build quotes around your plans.
            </p>
            <div className="relative mt-4 flex gap-2">
              <Link
                href="/contact"
                className="tap inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-accent text-[13px] font-semibold text-accent-foreground"
              >
                Get a quote
              </Link>
              <Link
                href="/book"
                className="tap inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary-foreground/10 text-[13px] font-semibold text-primary-foreground ring-1 ring-primary-foreground/20"
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
