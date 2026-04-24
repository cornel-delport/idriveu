import Image from "next/image"
import { CalendarClock, MapPinned, Car, PartyPopper } from "lucide-react"

const steps = [
  {
    icon: CalendarClock,
    title: "Book in a minute",
    body: "Pick a service, date and time. Add pickup and dropoff — we'll price it upfront.",
  },
  {
    icon: MapPinned,
    title: "Share your plan",
    body: "Restaurant, wedding, wine farm or the airport? Drop pins and any notes.",
  },
  {
    icon: Car,
    title: "We meet you there",
    body: "John (or Junior) meets you at the venue and drives you in your own car.",
  },
  {
    icon: PartyPopper,
    title: "Enjoy the ride",
    body: "Safe, friendly, discreet. We get you and your car home in one piece.",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-secondary/40">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1fr_1.1fr] md:px-6">
        <div className="relative hidden md:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-border">
            <Image
              src="/images/plett-coast-evening.jpg"
              alt="Plettenberg Bay coastal road at golden hour"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-6 bottom-10 w-60 rounded-2xl border border-border bg-card p-4 shadow-xl">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Live estimate
            </p>
            <p className="mt-1 font-serif text-xl font-semibold">
              Robberg → Cormorant Dr
            </p>
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>6.4 km · 14 min</span>
              <span className="font-semibold text-foreground">R310</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-2 text-balance font-serif text-3xl font-semibold leading-tight md:text-4xl">
            A concierge, not a taxi app.
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Upfront pricing, a real driver you know by name, and no meter ticking
            while you enjoy the evening.
          </p>

          <ol className="mt-8 flex flex-col gap-5">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="relative flex size-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <step.icon className="size-5" />
                  <span className="absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground ring-2 ring-card">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
