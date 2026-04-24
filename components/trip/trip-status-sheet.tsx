"use client"

import { Phone, MapPin, Car, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookingStatus } from "@/lib/types"

interface TripStatusSheetProps {
  status: BookingStatus
  driverName?: string | null
  driverPhone?: string | null
  pickupAddress: string
  dropoffAddress: string
  etaMinutes?: number | null
  onCancel?: () => void
  className?: string
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { title: string; body: string; icon: React.ElementType; pulse?: boolean }
> = {
  draft:             { title: "Preparing booking",    body: "Your booking is being prepared.",          icon: Clock },
  pending_payment:   { title: "Awaiting payment",     body: "Complete payment to confirm your trip.",    icon: AlertCircle },
  payment_received:  { title: "Payment received",     body: "Confirming your booking…",                 icon: Clock, pulse: true },
  confirmed:         { title: "Finding your driver",  body: "Matching you with a nearby driver…",       icon: Car, pulse: true },
  driver_assigned:   { title: "Driver assigned",      body: "Your driver is preparing for your trip.",  icon: Car },
  driver_on_the_way: { title: "Driver on the way",    body: "Your driver is heading to your pickup.",   icon: Car },
  arrived:           { title: "Driver has arrived",   body: "Your driver is waiting at your pickup.",   icon: MapPin },
  in_progress:       { title: "Trip in progress",     body: "On the way to your destination.",          icon: Car },
  completed:         { title: "Trip complete",        body: "You've arrived at your destination.",      icon: CheckCircle2 },
  cancelled:         { title: "Booking cancelled",    body: "This booking has been cancelled.",         icon: AlertCircle },
  refund_requested:  { title: "Refund requested",     body: "Your refund is being processed.",          icon: Clock },
  refunded:          { title: "Refund complete",      body: "Your refund has been issued.",             icon: CheckCircle2 },
}

const DRIVER_VISIBLE_STATUSES: BookingStatus[] = [
  "driver_assigned",
  "driver_on_the_way",
  "arrived",
  "in_progress",
  "completed",
]

export function TripStatusSheet({
  status,
  driverName,
  driverPhone,
  pickupAddress,
  dropoffAddress,
  etaMinutes,
  onCancel,
  className,
}: TripStatusSheetProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.confirmed
  const StatusIcon = config.icon
  const showDriver = Boolean(driverName) && DRIVER_VISIBLE_STATUSES.includes(status)
  const showCancel = Boolean(onCancel) && ["confirmed","driver_assigned","driver_on_the_way"].includes(status)

  return (
    <div
      className={cn(
        "glass-strong rounded-t-3xl border-t border-border p-5 pb-safe",
        className,
      )}
    >
      {/* Status row */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
            config.pulse && "animate-pulse",
          )}
        >
          <StatusIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight text-foreground">
            {config.title}
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {config.body}
            {etaMinutes != null && (
              <span className="ml-1 font-medium text-primary">· {etaMinutes} min away</span>
            )}
          </p>
        </div>
      </div>

      {/* Driver info */}
      {showDriver && (
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Driver</p>
            <p className="mt-0.5 text-[14px] font-semibold text-foreground">{driverName}</p>
          </div>
          {driverPhone && (
            <a
              href={`tel:${driverPhone}`}
              className="tap flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
              aria-label={`Call ${driverName}`}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      {/* Route summary */}
      <div className="mt-3 flex flex-col gap-1.5 rounded-2xl bg-secondary px-4 py-3 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          <span className="truncate text-foreground">{pickupAddress}</span>
        </div>
        <div className="ml-[3px] h-3 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="truncate text-foreground">{dropoffAddress}</span>
        </div>
      </div>

      {/* Cancel button */}
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="tap mt-3 w-full rounded-2xl border border-destructive/30 bg-destructive/10 py-2.5 text-[13px] font-semibold text-destructive"
        >
          Cancel booking
        </button>
      )}

      {/* Legal note */}
      <p className="mt-3 text-center text-[11px] text-muted-foreground/60">
        You are booking a private driver who drives your own car.
      </p>
    </div>
  )
}
