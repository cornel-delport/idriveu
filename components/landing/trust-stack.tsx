import {
  ShieldCheck,
  CarFront,
  MoonStar,
  Baby,
  PhoneCall,
} from "lucide-react"
import { IconCard } from "@/components/ui-icon"

const trust = [
  {
    icon: ShieldCheck,
    title: "Verified local drivers",
    body: "Background-checked, ID-verified, and known in Plett.",
    tone: "success" as const,
  },
  {
    icon: CarFront,
    title: "Drive your own car",
    body: "We meet you, drive your vehicle home — nothing strange parked outside.",
    tone: "primary" as const,
  },
  {
    icon: MoonStar,
    title: "Safe night transport",
    body: "Late nights, weddings, events — book ahead or on demand.",
    tone: "accent" as const,
  },
  {
    icon: Baby,
    title: "Child-safe pickups",
    body: "Authorised adult confirmation and WhatsApp updates at every step.",
    tone: "warning" as const,
  },
  {
    icon: PhoneCall,
    title: "Emergency contact",
    body: "One-tap share of your trip with a trusted person.",
    tone: "danger" as const,
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

      <ul className="mt-4 flex flex-col gap-2.5">
        {trust.map((t) => (
          <li key={t.title}>
            <IconCard
              icon={t.icon}
              title={t.title}
              description={t.body}
              tone={t.tone}
              surface="card"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
