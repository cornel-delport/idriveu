import {
  ShieldCheck,
  CarFront,
  MoonStar,
  Baby,
  PhoneCall,
} from "lucide-react"

const trust = [
  {
    icon: ShieldCheck,
    title: "Verified local drivers",
    body: "Background-checked, ID-verified, and known in Plett.",
  },
  {
    icon: CarFront,
    title: "Drive your own car",
    body: "We meet you, drive your vehicle home — nothing strange parked outside.",
  },
  {
    icon: MoonStar,
    title: "Safe night transport",
    body: "Late nights, weddings, events — book ahead or on demand.",
  },
  {
    icon: Baby,
    title: "Child-safe pickups",
    body: "Authorised adult confirmation and WhatsApp updates at every step.",
  },
  {
    icon: PhoneCall,
    title: "Emergency contact",
    body: "One-tap share of your trip with a trusted person.",
  },
] as const

export function TrustStack() {
  return (
    <section className="px-4 pt-10">
      <h2 className="text-[20px] font-semibold tracking-tight">
        Built around trust &amp; safety
      </h2>
      <p className="mt-1 text-[13px] text-muted-foreground">
        The little details that matter when it&apos;s your family or your car.
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {trust.map((t) => {
          const Icon = t.icon
          return (
            <li
              key={t.title}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">
                  {t.title}
                </h3>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                  {t.body}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
