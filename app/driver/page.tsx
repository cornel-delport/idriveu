import Link from "next/link"
import {
  ChevronRight,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Play,
  Star,
} from "lucide-react"
import { MobileShell } from "@/components/mobile-shell"
import { AppTopBar } from "@/components/app-top-bar"
import { BottomNav, BottomNavSpacer } from "@/components/bottom-nav"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge"
import { mockBookings, mockDrivers } from "@/lib/mock-data"
import { getService } from "@/lib/services"
import { formatZAR } from "@/lib/pricing"

export default function DriverDashboard() {
  const driver = mockDrivers[0]
  const assigned = mockBookings.filter((b) => b.driverId === driver.id)
  const next = assigned.find(
    (b) => new Date(b.dateTime) > new Date() && b.status !== "completed",
  )
  const upcoming = assigned.filter(
    (b) => b.id !== next?.id && new Date(b.dateTime) > new Date(),
  )

  return (
    <MobileShell>
      <AppTopBar title="Driver" />
      <main className="px-4 pt-2">
        <section>
          <p className="text-[12px] font-medium text-muted-foreground">
            Sawubona,
          </p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
            {driver.name}
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Here&apos;s what&apos;s next for you today.
          </p>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Today" value={String(assigned.length)} />
          <Stat
            label="Rating"
            value={
              <span className="flex items-center gap-1">
                {driver.rating}
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              </span>
            }
          />
          <Stat label="Pay today" value={formatZAR(2480)} />
        </section>

        {/* Next trip card */}
        {next && (
          <section className="mt-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              Next trip
            </p>

            <article className="mt-2 overflow-hidden rounded-3xl border border-border bg-card">
              <header className="flex items-start justify-between gap-3 p-4">
                <div>
                  <h2 className="text-[16px] font-semibold tracking-tight">
                    {getService(next.serviceId)?.name}
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Ref {next.reference} ·{" "}
                    {new Date(next.dateTime).toLocaleString("en-ZA", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <BookingStatusBadge status={next.status} />
              </header>

              <div className="border-t border-border px-4 py-3">
                <Leg index="A" tone="primary" label="Pickup" value={next.pickup.address} />
                {next.stops.map((s, i) => (
                  <Leg
                    key={i}
                    index={String(i + 1)}
                    tone="muted"
                    label={`Stop ${i + 1}`}
                    value={s.address}
                  />
                ))}
                <Leg
                  index="B"
                  tone="accent"
                  label="Drop off"
                  value={next.dropoff.address}
                />
              </div>

              {next.notes && (
                <div className="mx-4 mb-3 rounded-2xl bg-secondary p-3 text-[12px]">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer note
                  </p>
                  <p className="mt-0.5 text-foreground/90">{next.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="text-[13px]">
                  <span className="font-semibold">
                    {formatZAR(next.estimatedPrice)}
                  </span>
                  <span className="ml-2">
                    <PaymentStatusBadge status={next.paymentStatus} />
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {next.customerName}
                </div>
              </div>
            </article>

            {/* Actions */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="tap flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-[12px] font-semibold text-primary-foreground"
              >
                <Navigation className="h-4 w-4" /> Navigate
              </a>
              <a
                href="tel:+27821234567"
                className="tap flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-secondary text-[12px] font-semibold text-foreground"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href="https://wa.me/27821234567"
                target="_blank"
                rel="noreferrer"
                className="tap flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-secondary text-[12px] font-semibold text-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Chat
              </a>
            </div>

            {/* Progress */}
            <div className="mt-3 rounded-3xl border border-border bg-card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Trip progress
              </p>
              <ol className="mt-2 flex flex-col gap-2 text-[13px]">
                {[
                  { label: "Booking accepted", done: true },
                  { label: "On the way to pickup", done: false },
                  { label: "Arrived at pickup", done: false },
                  { label: "Passenger collected", done: false },
                  { label: "Trip completed", done: false },
                ].map((step, i) => (
                  <li key={step.label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                        step.done
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground ring-1 ring-border"
                      }`}
                    >
                      {step.done ? "✓" : i + 1}
                    </span>
                    <span
                      className={
                        step.done
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
              <button className="tap mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[14px] font-semibold text-accent-foreground">
                <Play className="h-4 w-4" /> Start trip
              </button>
            </div>
          </section>
        )}

        {/* Upcoming list */}
        <section className="mt-6 pb-6">
          <h2 className="text-[17px] font-semibold tracking-tight">Upcoming</h2>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
            {upcoming.length === 0 && (
              <li className="p-6 text-center text-[12px] text-muted-foreground">
                Nothing else scheduled.
              </li>
            )}
            {upcoming.map((b) => {
              const s = getService(b.serviceId)
              const Icon = s?.icon
              return (
                <li key={b.id}>
                  <Link
                    href={`/driver/trips/${b.id}`}
                    className="flex items-center justify-between gap-3 p-4 active:bg-secondary/60"
                  >
                    <div className="flex items-center gap-3">
                      {Icon && (
                        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">
                          {s?.name} · {b.reference}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {new Date(b.dateTime).toLocaleString("en-ZA", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {b.customerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold">
                        {formatZAR(b.estimatedPrice)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
        <BottomNavSpacer />
      </main>
      <BottomNav />
    </MobileShell>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[16px] font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function Leg({
  index,
  tone,
  label,
  value,
}: {
  index: string
  tone: "primary" | "accent" | "muted"
  label: string
  value: string
}) {
  const toneClasses =
    tone === "primary"
      ? "bg-primary text-primary-foreground"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-muted-foreground ring-1 ring-border"
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span
        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-[10px] font-bold ${toneClasses}`}
      >
        {index}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-[13px] font-medium text-foreground">
          <MapPin className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
          {value}
        </p>
      </div>
    </div>
  )
}
