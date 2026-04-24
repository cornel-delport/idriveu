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

      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <li
              key={s.title}
              className="flex items-start gap-3 rounded-2xl bg-secondary p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[13px] font-semibold">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-[15px] font-semibold tracking-tight">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
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
