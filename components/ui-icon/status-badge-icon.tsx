"use client"

import * as React from "react"
import {
  CheckCircle2,
  Clock3,
  Car,
  Navigation,
  MapPin,
  XCircle,
  RotateCcw,
  Wallet,
  CircleDollarSign,
  AlertTriangle,
  Hourglass,
  CircleCheck,
  CircleX,
  Banknote,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookingStatus, PaymentStatus } from "@/lib/types"

type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "accent"

const TONE_CLS: Record<Tone, string> = {
  neutral: "bg-secondary text-muted-foreground ring-1 ring-border",
  info: "bg-primary/10 text-primary ring-1 ring-primary/20",
  warning: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400",
  success: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400",
  danger: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  accent: "bg-accent/15 text-accent-foreground ring-1 ring-accent/20",
}

const BOOKING_MAP: Record<BookingStatus, { icon: LucideIcon; label: string; tone: Tone; pulse?: boolean }> = {
  draft: { icon: Hourglass, label: "Draft", tone: "neutral" },
  pending_payment: { icon: Wallet, label: "Awaiting payment", tone: "warning" },
  payment_received: { icon: CircleCheck, label: "Paid", tone: "success" },
  confirmed: { icon: CheckCircle2, label: "Confirmed", tone: "info" },
  driver_assigned: { icon: Car, label: "Driver assigned", tone: "info" },
  driver_on_the_way: { icon: Navigation, label: "On the way", tone: "info", pulse: true },
  arrived: { icon: MapPin, label: "Arrived", tone: "accent", pulse: true },
  passenger_collected: { icon: Car, label: "Picked up", tone: "info" },
  in_progress: { icon: Navigation, label: "In progress", tone: "info", pulse: true },
  completed: { icon: CircleCheck, label: "Completed", tone: "success" },
  cancelled: { icon: CircleX, label: "Cancelled", tone: "danger" },
  refund_requested: { icon: AlertTriangle, label: "Refund requested", tone: "warning" },
  refunded: { icon: RotateCcw, label: "Refunded", tone: "neutral" },
}

const PAYMENT_MAP: Record<PaymentStatus, { icon: LucideIcon; label: string; tone: Tone }> = {
  pending: { icon: Clock3, label: "Pending", tone: "warning" },
  paid: { icon: CircleCheck, label: "Paid", tone: "success" },
  failed: { icon: XCircle, label: "Failed", tone: "danger" },
  refunded: { icon: RotateCcw, label: "Refunded", tone: "neutral" },
  refund_requested: { icon: AlertTriangle, label: "Refund requested", tone: "warning" },
  cash_requested: { icon: Banknote, label: "Cash requested", tone: "warning" },
  eft_requested: { icon: CircleDollarSign, label: "EFT requested", tone: "warning" },
  admin_confirmed: { icon: CircleCheck, label: "Confirmed", tone: "success" },
}

interface BookingStatusIconBadgeProps {
  status: BookingStatus
  size?: "sm" | "md"
  className?: string
}

export function BookingStatusIconBadge({
  status,
  size = "sm",
  className,
}: BookingStatusIconBadgeProps) {
  const cfg = BOOKING_MAP[status] ?? BOOKING_MAP.draft
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        TONE_CLS[cfg.tone],
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
          cfg.pulse && "animate-pulse",
        )}
        strokeWidth={2.4}
      />
      {cfg.label}
    </span>
  )
}

interface PaymentStatusIconBadgeProps {
  status: PaymentStatus
  size?: "sm" | "md"
  className?: string
}

export function PaymentStatusIconBadge({
  status,
  size = "sm",
  className,
}: PaymentStatusIconBadgeProps) {
  const cfg = PAYMENT_MAP[status] ?? PAYMENT_MAP.pending
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        TONE_CLS[cfg.tone],
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]",
        className,
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} strokeWidth={2.4} />
      {cfg.label}
    </span>
  )
}

interface GenericStatusBadgeProps {
  icon: LucideIcon
  label: string
  tone?: Tone
  size?: "sm" | "md"
  pulse?: boolean
  className?: string
}

export function StatusBadgeWithIcon({
  icon: Icon,
  label,
  tone = "neutral",
  size = "sm",
  pulse = false,
  className,
}: GenericStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        TONE_CLS[tone],
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]",
        className,
      )}
    >
      <Icon
        className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", pulse && "animate-pulse")}
        strokeWidth={2.4}
      />
      {label}
    </span>
  )
}
