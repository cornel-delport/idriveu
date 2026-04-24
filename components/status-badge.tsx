import { cn } from "@/lib/utils"
import type { BookingStatus, PaymentStatus } from "@/lib/types"

const bookingLabels: Record<BookingStatus, string> = {
  draft: "Draft",
  pending_payment: "Pending payment",
  payment_received: "Payment received",
  confirmed: "Confirmed",
  driver_assigned: "Driver assigned",
  driver_on_the_way: "Driver on the way",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  refund_requested: "Refund requested",
  refunded: "Refunded",
}

const bookingTone: Record<BookingStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_payment: "bg-accent/15 text-accent-foreground ring-accent/30",
  payment_received: "bg-accent/15 text-accent-foreground ring-accent/30",
  confirmed: "bg-primary/10 text-primary ring-primary/20",
  driver_assigned: "bg-primary/10 text-primary ring-primary/20",
  driver_on_the_way: "bg-primary/10 text-primary ring-primary/20",
  arrived: "bg-primary/10 text-primary ring-primary/20",
  in_progress: "bg-primary/10 text-primary ring-primary/20",
  completed: "bg-secondary text-foreground ring-border",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
  refund_requested: "bg-destructive/10 text-destructive ring-destructive/20",
  refunded: "bg-destructive/10 text-destructive ring-destructive/20",
}

const paymentLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  refund_requested: "Refund requested",
  cash_requested: "Cash",
  eft_requested: "EFT",
  admin_confirmed: "Confirmed",
}

const paymentTone: Record<PaymentStatus, string> = {
  pending: "bg-accent/15 text-accent-foreground ring-accent/30",
  paid: "bg-primary/10 text-primary ring-primary/20",
  failed: "bg-destructive/10 text-destructive ring-destructive/20",
  refunded: "bg-muted text-muted-foreground",
  refund_requested: "bg-destructive/10 text-destructive ring-destructive/20",
  cash_requested: "bg-accent/15 text-accent-foreground ring-accent/30",
  eft_requested: "bg-accent/15 text-accent-foreground ring-accent/30",
  admin_confirmed: "bg-primary/10 text-primary ring-primary/20",
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        bookingTone[status],
      )}
    >
      {bookingLabels[status]}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        paymentTone[status],
      )}
    >
      {paymentLabels[status]}
    </span>
  )
}
