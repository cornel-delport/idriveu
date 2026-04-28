import { MapPin, CalendarCheck, Car, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: MapPin,
    title: "Tell us where",
    body: "Pickup, drop off, and a few options.",
  },
  {
    icon: CalendarCheck,
    title: "Pick a time",
    body: "On demand or scheduled. See your live price.",
  },
  {
    icon: Car,
    title: "We meet you",
    body: "Your trusted IDriveU driver arrives to your pickup.",
  },
  {
    icon: CheckCircle2,
    title: "Home safely",
    body: "We drop you home and you get a trip summary.",
  },
] as const

export function HowItWorks() {
  return (
    <section className="px-4 pt-10">
      <h2 className="text-[20px] font-semibold tracking-tight">How it works</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Four simple steps from plans to home.
      </p>

      <ol className="mt-5 flex flex-col gap-3">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isLast = i === steps.length - 1
          return (
            <li key={s.title} className="relative flex gap-3">
              {/* Step indicator with connecting line */}
              <div className="flex flex-col items-center">
                <span className="btn-glow flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold text-white">
                  {i + 1}
                </span>
                {!isLast && (
                  <span className="my-1 h-full w-px bg-gradient-to-b from-primary/40 to-border" />
                )}
              </div>

              {/* Content card */}
              <div className="mb-3 flex-1 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                  </span>
                  <h3 className="text-[15px] font-semibold tracking-tight">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
