import { Star } from "lucide-react"

const reviews = [
  {
    name: "Sarah M.",
    location: "Keurboomstrand",
    quote:
      "John drove us home in our own car after a wedding in the hills. Professional, friendly and on time. Exactly what Plett needed.",
  },
  {
    name: "Graham T.",
    location: "Visitor from Joburg",
    quote:
      "Spent the day at four wine farms with John driving. Didn't worry once about who's the designated driver. Worth every rand.",
  },
  {
    name: "Nomvula K.",
    location: "Plettenberg Bay",
    quote:
      "Junior collects my daughter from school twice a week. I get a WhatsApp the moment she's in the car. Total peace of mind.",
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Trusted by locals
        </p>
        <h2 className="mt-2 text-balance font-serif text-3xl font-semibold md:text-4xl">
          What Plett says about us.
        </h2>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.name}
            className="flex h-full flex-col rounded-2xl border border-border bg-card p-6"
          >
            <div
              className="flex items-center gap-0.5 text-accent"
              aria-label="5 out of 5 stars"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-accent" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 border-t border-border/60 pt-4 text-sm">
              <span className="font-semibold text-foreground">{r.name}</span>
              <span className="text-muted-foreground"> · {r.location}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
