"use client"

import Link from "next/link"
import {
  ShieldCheck,
  Car,
  User,
  Crown,
  Eye,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Role = "customer" | "driver" | "admin" | "super_admin"

interface RoleConfig {
  label: string
  icon: LucideIcon
  /** Tailwind class on the chip */
  chipClass: string
  /** Friendly subtitle */
  subtitle: string
}

const ROLE: Record<Role, RoleConfig> = {
  customer: {
    label: "Customer",
    icon: User,
    chipClass: "bg-primary/10 text-primary ring-1 ring-primary/20",
    subtitle: "Book a private driver",
  },
  driver: {
    label: "Driver",
    icon: Car,
    chipClass: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400",
    subtitle: "Accept and complete jobs",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    chipClass: "bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20 dark:text-orange-400",
    subtitle: "Manage users, drivers & bookings",
  },
  super_admin: {
    label: "Super Admin",
    icon: Crown,
    chipClass: "bg-red-500/10 text-red-600 ring-1 ring-red-500/20 dark:text-red-400",
    subtitle: "Full platform control",
  },
}

interface SignedInAsProps {
  role: Role
  name?: string | null
  className?: string
}

/**
 * Compact "Signed in as: Driver" banner shown at the top of every role's
 * home page so the user always knows their role context.
 */
export function SignedInAs({ role, name, className }: SignedInAsProps) {
  const cfg = ROLE[role]
  const Icon = cfg.icon

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            cfg.chipClass,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Signed in as
          </p>
          <p className="truncate text-[14px] font-semibold text-foreground">
            {cfg.label}
            {name ? <span className="text-muted-foreground"> · {name}</span> : null}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Admin-only role switcher chips — preview customer / driver views.
 * Shown on the admin home page so admins can sanity-check the other roles
 * without changing accounts.
 */
export function AdminRoleSwitcher({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Preview as
      </p>
      <div className="grid grid-cols-2 gap-2">
        <SwitchChip
          icon={User}
          label="Customer view"
          subtitle="Booking flow"
          href="/dashboard"
        />
        <SwitchChip
          icon={Car}
          label="Driver view"
          subtitle="Driver dashboard"
          href="/driver"
        />
      </div>
    </div>
  )
}

function SwitchChip({
  icon: Icon,
  label,
  subtitle,
  href,
}: {
  icon: LucideIcon
  label: string
  subtitle: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="tap group flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3 py-2.5 transition-colors hover:bg-secondary"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-semibold text-foreground">
          {label}
        </span>
        <span className="flex items-center gap-0.5 text-[10.5px] text-muted-foreground">
          <Eye className="h-3 w-3" /> {subtitle}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
