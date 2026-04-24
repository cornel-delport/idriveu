import Link from "next/link"
import { services } from "@/lib/services"
import { ArrowUpRight } from "lucide-react"

export function ServiceCarousel() {
  return (
    <section className="pt-8">
      <div className="flex items-end justify-between px-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">
            Our services
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Swipe to browse. Tap to book.
          </p>
        </div>
        <Link
          href="/services"
          className="text-[12px] font-medium text-primary underline-offset-4 hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
        {services.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.id}
              href={`/book?service=${s.id}`}
              className="tap snap-start shrink-0 basis-[78%] rounded-3xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                {s.badge && (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    {s.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-[17px] font-semibold tracking-tight">
                {s.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                {s.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-foreground">
                  {s.priceLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
                  Book
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
