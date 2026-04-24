import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { services } from "@/lib/services"

export const metadata = {
  title: "Services — John Khumalo Private Driver",
  description:
    "Drive me home, wine farm driver, airport transfers, event pickup, vehicle collection, parcel delivery, safe children pickup and tourist day driver in Plettenberg Bay.",
}

export default function ServicesPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 md:px-6 md:pb-14 md:pt-20">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Services
          </p>
          <h1 className="mt-2 max-w-3xl text-balance font-serif text-4xl font-semibold leading-tight md:text-5xl">
            A trusted private driver for every Plett moment.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">
            Pick a service below. All prices are starting quotes in South
            African Rand — you&apos;ll see a firm estimate once you share your
            pickup and dropoff.
          </p>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.id}
                id={service.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 md:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <service.icon className="size-6" />
                  </div>
                  <span className="text-right text-sm font-semibold">
                    {service.priceLabel}
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-2xl font-semibold">
                  {service.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-accent-foreground/80">
                  {service.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {service.longDescription}
                </p>
                <ul className="mt-5 grid gap-2 text-sm">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 flex-none text-primary" />
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center gap-3 border-t border-border/70 pt-5">
                  <Button
                    asChild
                    className="flex-1 rounded-full"
                    size="sm"
                  >
                    <Link href={`/book?service=${service.id}`}>
                      Book this service
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <Link href="/contact">Ask a question</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
          <div className="rounded-3xl border border-border bg-secondary/40 p-8 md:p-12">
            <h3 className="max-w-xl font-serif text-2xl font-semibold md:text-3xl">
              Need something custom?
            </h3>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Corporate accounts, multi-day itineraries, weddings, matric dances
              and tour groups — we&apos;ll build a quote around your plans.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/contact">Get a custom quote</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/book">Book a standard trip</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
