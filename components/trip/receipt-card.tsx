"use client"

import { MapPin, ArrowDown, Car } from "lucide-react"
import { cn } from "@/lib/utils"

function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}

function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface ReceiptCardProps {
  receipt: {
    receiptNumber: string
    subtotalCents: number
    tipCents: number
    totalCents: number
    createdAt: string | Date
  }
  booking: {
    reference: string
    pickupAddress: string
    dropoffAddress: string
    dateTime: string | Date
    driverName?: string
    serviceId: string
  }
  className?: string
}

export function ReceiptCard({ receipt, booking, className }: ReceiptCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-1 border-b border-border px-6 py-6">
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-primary" />
          <span className="text-[18px] font-bold tracking-tight text-foreground">
            IDriveU
          </span>
        </div>
        <p className="text-[12px] text-muted-foreground">Private Driver Receipt</p>
      </div>

      {/* Trip info */}
      <div className="space-y-4 px-6 py-5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Booking ref</span>
          <span className="font-semibold text-foreground">{booking.reference}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Date</span>
          <span className="font-medium text-foreground">{formatDateTime(booking.dateTime)}</span>
        </div>
        {booking.driverName && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Driver</span>
            <span className="font-medium text-foreground">{booking.driverName}</span>
          </div>
        )}
      </div>

      {/* Route */}
      <div className="mx-6 mb-5 rounded-2xl bg-secondary px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex flex-col items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <div className="flex flex-col items-center gap-0.5">
              <div className="h-1 w-px bg-border" />
              <div className="h-1 w-px bg-border" />
              <div className="h-1 w-px bg-border" />
            </div>
            <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pickup</p>
              <p className="mt-0.5 text-[13px] text-foreground">{booking.pickupAddress}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Dropoff</p>
              <p className="mt-0.5 text-[13px] text-foreground">{booking.dropoffAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-2 px-6 pb-5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="text-foreground">{formatZAR(receipt.subtotalCents)}</span>
        </div>
        {receipt.tipCents > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Tip</span>
            <span className="text-foreground">{formatZAR(receipt.tipCents)}</span>
          </div>
        )}

        <div className="my-3 border-t border-border" />

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold text-foreground">Total</span>
          <span className="text-[18px] font-bold text-foreground">
            {formatZAR(receipt.totalCents)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-1 border-t border-border px-6 py-4">
        <p className="text-center text-[11px] text-muted-foreground/70">
          You are booking a private driver who drives your own car.
        </p>
        <p className="text-[11px] text-muted-foreground/50">
          Receipt #{receipt.receiptNumber}
        </p>
      </div>
    </div>
  )
}
