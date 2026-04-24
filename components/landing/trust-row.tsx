import {
  Car,
  CreditCard,
  MapPinned,
  Moon,
  Plane,
  ShieldCheck,
  Users,
} from "lucide-react"

const items = [
  { icon: MapPinned, label: "Local Plett service" },
  { icon: Car, label: "Drives your own car" },
  { icon: Moon, label: "Safe late-night trips" },
  { icon: Plane, label: "Airport transfers" },
  { icon: Users, label: "Family & child pickup" },
  { icon: ShieldCheck, label: "Vetted drivers" },
  { icon: CreditCard, label: "Secure payment" },
]

export function TrustRow() {
  return (
    <section className="border-y border-border/60 bg-secondary/40">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 md:px-6">
        {items.map((item) => (
          <div
            key={item.label}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          >
            <item.icon className="size-4 text-accent" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
