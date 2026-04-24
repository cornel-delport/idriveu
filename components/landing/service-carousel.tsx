import Link from "next/link"
import { services } from "@/lib/services"
import { ServiceCard } from "@/components/service-card"

export function ServiceCarousel() {
  return (
    <section className="pt-8">
      <div className="flex items-end justify-between px-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">
            What can we help you with?
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Swipe to browse. Tap to book.
          </p>
        </div>
        <Link
          href="/services"
          className="text-[12px] font-medium text-accent underline-offset-4 hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar px-4 pb-4">
        {services.map((s) => (
          <div key={s.id} className="snap-start shrink-0 basis-[78%]">
            <ServiceCard service={s} />
          </div>
        ))}
      </div>
    </section>
  )
}
