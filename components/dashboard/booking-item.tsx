import Link from "next/link"
import { ArrowRight, CalendarClock, MapPin } from "lucide-react"
import type { Booking } from "@/lib/types"
import { getService } from "@/lib/services"
import { formatZAR } from "@/lib/pricing"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/status-badge"

interface BookingItemProps {
  booking: Booking
  href?: string
  cta?: string
}

export function BookingItem({
  booking,
  href = "#",
  cta = "View",
}: BookingItemProps) {
  const svc = getService(booking.serviceId)
  const Icon = svc?.icon
  const when = new Date(booking.dateTime).toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
  return (
    <article className="rounded-3xl border border-border bg-card p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {Icon && <Icon className="h-5 w-5" />}
          </span>
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">
              {svc?.name}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Ref {booking.reference}
            </p>
          </div>
        </div>
        <span className="text-right">
          <span className="text-[15px] font-semibold tracking-tight">
            {formatZAR(booking.finalPrice ?? booking.estimatedPrice)}
          </span>
        </span>
      </header>

      <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          <span>{when}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{booking.pickup.address}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-foreground" />
          <span className="truncate">{booking.dropoff.address}</span>
        </div>
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <BookingStatusBadge status={booking.status} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
        <Link
          href={href}
          className="tap inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[12px] font-semibold text-primary-foreground"
        >
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </article>
  )
}
