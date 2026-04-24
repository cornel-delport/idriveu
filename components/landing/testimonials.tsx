import { Star } from "lucide-react"

const items = [
  {
    name: "Thandi M.",
    trip: "Drive Me Home, Lookout Deck",
    quote:
      "Booked from the restaurant, driver was waiting in 20 minutes, drove us home in our own car. Completely seamless.",
    rating: 5,
  },
  {
    name: "Pieter v.d.M.",
    trip: "Wine Farm day, Bramon",
    quote:
      "Three farms, zero stress. Friendly, patient, punctual. We'll use IDriveU every time we visit Plett.",
    rating: 5,
  },
  {
    name: "Lerato D.",
    trip: "School pickup",
    quote:
      "Requested a lady driver and got WhatsApp photos at pickup and drop-off. Total peace of mind.",
    rating: 5,
  },
] as const

export function Testimonials() {
  return (
    <section className="pt-10">
      <div className="px-4">
        <h2 className="text-[20px] font-semibold tracking-tight">
          Loved by locals &amp; visitors
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Real trips. Real people. Real reviews.
        </p>
      </div>

      <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
        {items.map((t) => (
          <figure
            key={t.name}
            className="snap-start shrink-0 basis-[85%] rounded-3xl border border-border bg-card p-4"
          >
            <div className="flex items-center gap-1 text-accent">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-2 text-[14px] leading-relaxed text-foreground">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[13px] font-semibold">{t.name}</span>
              <span className="text-[11px] text-muted-foreground">
                {t.trip}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
