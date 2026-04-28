/**
 * Re-exports the icon-first status badges so existing imports keep working.
 * Prefer importing from `@/components/ui-icon` in new code.
 */
import {
  BookingStatusIconBadge,
  PaymentStatusIconBadge,
} from "@/components/ui-icon"
import type { BookingStatus, PaymentStatus } from "@/lib/types"

export function BookingStatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: BookingStatus
  size?: "sm" | "md"
  className?: string
}) {
  return <BookingStatusIconBadge status={status} size={size} className={className} />
}

export function PaymentStatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: PaymentStatus
  size?: "sm" | "md"
  className?: string
}) {
  return <PaymentStatusIconBadge status={status} size={size} className={className} />
}
