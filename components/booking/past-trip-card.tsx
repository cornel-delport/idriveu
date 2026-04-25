"use client"

import Link from "next/link"
import { Car, MapPin, ArrowRight, RotateCcw, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { RatingStars } from "@/components/trip/rating-stars"

function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}

function formatTripDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  const weekday = d.toLocaleDateString("en-ZA", { weekday: "short" })
  const day = d.getDate()
  const month = d.toLocaleDateString("en-ZA", { month: "short" })
  const time = d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false })
  return `${weekday} ${day} ${month} · ${time}`
}

interface PastTripCardProps {
  trip: {
    id: string
    reference: string
    serviceId: string
    pickupAddress: string
    dropoffAddress: string
    dateTime: string | Date
    status: string
    estimatedPrice: number
    finalPrice?: number | null
    driverName?: string | null
    rating?: number | null
    receiptTotal?: number | null
  }
  href?: string
  onRebook?: () => void
  className?: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: "Completed", cls: "bg-green-500/15 text-green-500" },
    cancelled: { label: "Cancelled", cls: "bg-destructive/15 text-destructive" },
    refunded: { label: "Refunded", cls: "bg-muted text-muted-foreground" },
  }
  const entry = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        entry.cls,
      )}
    >
      {entry.label}
    </span>
  )
}

export function PastTripCard({
  trip,
  href,
  onRebook,
  className,
}: PastTripCardProps) {
  const receiptHref = href ?? `/trip/${trip.id}/receipt`
  const displayPrice = trip.receiptTotal ?? trip.finalPrice ?? trip.estimatedPrice
  // estimatedPrice is in rands (not cents) per schema — adjust as needed
  // receiptTotal is in cents — so we format accordingly
  const priceStr =
    trip.receiptTotal != null
      ? formatZAR(trip.receiptTotal)
      : `R ${(displayPrice as number).toFixed(2)}`

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-4", className)}>
      {/* Top row: icon + date + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Car className="h-5 w-5 text-muted-foreground" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              {formatTripDate(trip.dateTime)}
            </p>
            {trip.driverName && (
              <p className="text-[12px] text-muted-foreground">{trip.driverName}</p>
            )}
          </div>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {/* Route */}
      <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate">{trip.pickupAddress}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{trip.dropoffAddress}</span>
      </div>

      {/* Price + rating row */}
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-xl bg-secondary px-3 py-1 text-[13px] font-semibold text-foreground">
          {priceStr}
        </span>
        {trip.rating != null && (
          <RatingStars value={trip.rating} size="sm" />
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <Link
          href={receiptHref}
          className="tap flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-border bg-secondary py-2.5 text-[13px] font-medium text-foreground"
        >
          <FileText className="h-4 w-4" />
          View Receipt
        </Link>
        {onRebook && (
          <button
            type="button"
            onClick={onRebook}
            className="tap flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Rebook
          </button>
        )}
      </div>
    </div>
  )
}
