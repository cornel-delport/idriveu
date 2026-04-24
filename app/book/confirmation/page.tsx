import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  Car,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react"
import { MobileShell } from "@/components/mobile-shell"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import { AppTopBar } from "@/components/app-top-bar"
import { formatZAR } from "@/lib/pricing"

export const metadata = {
  title: "Booking confirmed — IDriveU",
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const ref = params.ref ?? "IDU-0000"
  const service = params.service ?? "Private driver"
  const date = params.date ?? ""
  const time = params.time ?? ""
  const pickup = params.pickup ?? ""
  const dropoff = params.dropoff ?? ""
  const price = Number(params.price ?? "0")
  const distance = Number(params.distance ?? "0")
  const duration = Number(params.duration ?? "0")

  return (
    <MobileShell>
      <AppTopBar title="Booking received" />
      <main className="px-4 pt-4">
        {/* Success card */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="relative flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-primary-foreground/10">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              Request received
            </p>
            <h1 className="mt-1 text-balance text-[26px] font-semibold leading-tight tracking-tight">
              You&apos;re sorted. We&apos;re assigning your driver.
            </h1>
            <p className="mt-2 text-pretty text-[13px] leading-relaxed text-primary-foreground/80">
              Reference{" "}
              <span className="font-semibold text-accent">{ref}</span> — we&apos;ll
              confirm on WhatsApp shortly.
            </p>
          </div>
        </section>

        {/* Summary */}
        <section className="mt-4 rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start justify-between border-b border-border/70 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {labelForService(service)}
              </p>
              <p className="mt-1 text-[15px] font-semibold">
                {formatDate(date)} · {time}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="text-[22px] font-semibold tracking-tight text-primary">
                {formatZAR(price)}
              </p>
            </div>
          </div>

          <ul className="mt-3 flex flex-col gap-3">
            <Info icon={<MapPin className="h-4 w-4" />} label="Pickup" value={pickup} />
            <Info icon={<MapPin className="h-4 w-4 text-accent-foreground" />} label="Drop off" value={dropoff} />
            <Info
              icon={<CalendarClock className="h-4 w-4" />}
              label="When"
              value={`${formatDate(date)} · ${time}`}
            />
            <Info
              icon={<Car className="h-4 w-4" />}
              label="Trip"
              value={
                distance && duration
                  ? `${distance.toFixed(1)} km · ${duration} min`
                  : "Calculating"
              }
            />
          </ul>
        </section>

        {/* Contact actions */}
        <section className="mt-3 grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/27821234567?text=Hi%20IDriveU%2C%20booking%20${ref}`}
            target="_blank"
            rel="noreferrer"
            className="tap inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[13px] font-semibold"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <a
            href="tel:+27821234567"
            className="tap inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[13px] font-semibold"
          >
            <Phone className="h-4 w-4" /> Call driver
          </a>
        </section>

        <section className="mt-4 flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="tap inline-flex h-12 items-center justify-between rounded-2xl bg-primary px-5 text-[14px] font-semibold text-primary-foreground shadow-md"
          >
            <span>View my trips</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="tap inline-flex h-11 items-center justify-center rounded-2xl bg-secondary text-[13px] font-semibold text-foreground"
          >
            Back home
          </Link>
        </section>
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[14px] font-medium text-foreground">
          {value || "—"}
        </p>
      </div>
    </li>
  )
}

function formatDate(value: string) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return value
  }
}

function labelForService(id: string) {
  const map: Record<string, string> = {
    "drive-me-home": "Drive Me Home",
    "wine-farm": "Wine Farm Driver",
    airport: "Airport Transfer",
    "event-pickup": "Event Pickup",
    "vehicle-collection": "Vehicle Collection",
    parcel: "Parcel & Errands",
    "child-pickup": "Safe Children Pickup",
    tourist: "Tourist Day Driver",
  }
  return map[id] ?? id
}
