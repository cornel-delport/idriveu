import Link from "next/link"
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route as RouteIcon,
  Settings,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { mockBookings, mockDrivers } from "@/lib/mock-data"
import { getService } from "@/lib/services"
import { formatZAR } from "@/lib/pricing"

const nav = [
  { href: "/driver", label: "Today", icon: LayoutDashboard },
  { href: "/driver/upcoming", label: "Upcoming", icon: CalendarCheck },
  { href: "/driver/completed", label: "Completed", icon: CheckCircle2 },
  { href: "/driver/settings", label: "Settings", icon: Settings },
]

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
    <DashboardShell
      role="driver"
      nav={nav}
      user={{ name: driver.name, email: "john@johnkhumalo.co.za" }}
      title={`Sawubona, ${driver.name.split(" ")[0]}`}
      description="Your next trip at a glance, plus everything assigned to you."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today's trips" value={String(assigned.length)} />
        <StatCard label="Rating" value={`${driver.rating}★`} />
        <StatCard label="Completed" value={String(driver.trips)} />
        <StatCard label="Active pay" value={formatZAR(2480)} />
      </div>

      {next && (
        <section className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Next trip
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:p-8">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-xl font-semibold">
                      {getService(next.serviceId)?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <LegRow
                    index="A"
                    tone="primary"
                    label="Pickup"
                    value={next.pickup.address}
                  />
                  {next.stops.map((s, i) => (
                    <LegRow
                      key={i}
                      index={String(i + 1)}
                      tone="muted"
                      label={`Stop ${i + 1}`}
                      value={s.address}
                    />
                  ))}
                  <LegRow
                    index="B"
                    tone="accent"
                    label="Dropoff"
                    value={next.dropoff.address}
                  />
                </div>

                {next.notes && (
                  <div className="mt-4 rounded-xl bg-secondary/60 p-3 text-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Customer note
                    </p>
                    <p className="mt-0.5 text-foreground/90">{next.notes}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-full">
                    <Navigation className="size-4" /> Open in Google Maps
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <Phone className="size-4" /> Call customer
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-full">
                    <MessageCircle className="size-4" /> WhatsApp
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-secondary/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trip progress
                </p>
                <ol className="mt-3 space-y-3 text-sm">
                  {[
                    { label: "Booking accepted", done: true },
                    { label: "On the way to pickup", done: false },
                    { label: "Arrived at pickup", done: false },
                    { label: "Passenger collected", done: false },
                    { label: "Trip completed", done: false },
                  ].map((step, i) => (
                    <li key={step.label} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex size-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                          step.done
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground ring-1 ring-border"
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
                <Button className="mt-5 w-full rounded-full" size="sm">
                  Start trip <ChevronRight className="size-4" />
                </Button>
                <div className="mt-5 border-t border-border pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fare</span>
                    <span className="font-semibold">
                      {formatZAR(next.estimatedPrice)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <PaymentStatusBadge status={next.paymentStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-serif text-xl font-semibold">Upcoming</h2>
        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {upcoming.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nothing else scheduled.
            </div>
          )}
          {upcoming.map((b) => {
            const s = getService(b.serviceId)
            return (
              <Link
                key={b.id}
                href={`/driver/trips/${b.id}`}
                className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-4">
                  {s && (
                    <div className="flex size-10 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <s.icon className="size-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {s?.name} · {b.reference}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold md:inline">
                    {formatZAR(b.estimatedPrice)}
                  </span>
                  <BookingStatusBadge status={b.status} />
                  <RouteIcon className="hidden size-4 text-muted-foreground md:block" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </DashboardShell>
  )
}

function LegRow({
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
    <div className="flex items-start gap-3">
      <span
        className={`flex size-6 flex-none items-center justify-center rounded-full text-[10px] font-bold ${toneClasses}`}
      >
        {index}
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">
          <MapPin className="mr-1 inline size-3.5 text-muted-foreground" />
          {value}
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl font-semibold">{value}</p>
    </div>
  )
}
