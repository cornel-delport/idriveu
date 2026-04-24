import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { services } from "@/lib/services"
import { Button } from "@/components/ui/button"

export function ServicesGrid() {
  return (
    <section id="services" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Our services
          </p>
          <h2 className="mt-2 text-balance font-serif text-3xl font-semibold leading-tight md:text-4xl">
            Eight ways we take the driving off your hands.
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            From a quick drive home after dinner to a full day at the wine
            farms, we handle it — in your car or an arranged vehicle.
          </p>
        </div>
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/services">
            See all services <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/book?service=${service.id}`}
            className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
          >
            {service.badge && (
              <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground ring-1 ring-accent/30">
                {service.badge}
              </span>
            )}
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <service.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
              {service.name}
            </h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
              <span className="text-sm font-semibold text-foreground">
                {service.priceLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                Book <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
