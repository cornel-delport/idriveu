import Link from "next/link"
import { ArrowRight, CalendarClock, MapPin, Users } from "lucide-react"
import type { Booking } from "@/lib/types"
import { getService } from "@/lib/services"
import { formatZAR } from "@/lib/pricing"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge"
import { Button } from "@/components/ui/button"

export function BookingCard({
  booking,
  action,
}: {
  booking: Booking
  action?: "view" | "repeat"
}) {
  const service = getService(booking.serviceId)
  if (!service) return null
  const date = new Date(booking.dateTime)

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <service.icon className="size-5" />
          </div>
          <div>
            <p className="font-serif text-base font-semibold">{service.name}</p>
            <p className="text-xs text-muted-foreground">
              Ref {booking.reference}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <Row
          icon={<CalendarClock className="size-4" />}
          label="When"
          value={date.toLocaleString("en-ZA", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
        <Row
          icon={<Users className="size-4" />}
          label="Passengers"
          value={String(booking.passengerCount)}
        />
        <Row
          icon={<MapPin className="size-4 text-primary" />}
          label="Pickup"
          value={booking.pickup.address}
        />
        <Row
          icon={<MapPin className="size-4 text-accent" />}
          label="Dropoff"
          value={booking.dropoff.address}
        />
      </dl>

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">
            {booking.distanceKm.toFixed(1)} km · {booking.durationMinutes} min
          </p>
          <p className="mt-0.5 font-serif text-xl font-semibold text-primary">
            {formatZAR(booking.finalPrice ?? booking.estimatedPrice)}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link
            href={action === "repeat" ? "/book" : `/dashboard/bookings/${booking.id}`}
          >
            {action === "repeat" ? "Repeat booking" : "View details"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="truncate text-sm font-medium text-foreground">
          {value}
        </dd>
      </div>
    </div>
  )
}
