"use client"

import { useState } from "react"
import { Star, UserCheck, UserX, ArrowUpCircle, CheckCircle, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatZAR(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`
}

function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    customer:    "bg-blue-500/15 text-blue-500",
    driver:      "bg-green-500/15 text-green-500",
    admin:       "bg-orange-500/15 text-orange-500",
    super_admin: "bg-red-500/15 text-red-500",
  }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", map[role] ?? "bg-muted text-muted-foreground")}>
      {role.replace("_", " ")}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    "bg-green-500/15 text-green-500",
    suspended: "bg-red-500/15 text-red-500",
    pending:   "bg-yellow-500/15 text-yellow-600",
    approved:  "bg-green-500/15 text-green-500",
  }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", map[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  )
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }, (__, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-secondary" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-[13px] text-muted-foreground">
        {message}
      </td>
    </tr>
  )
}

function ActionButton({
  onClick,
  variant = "default",
  children,
}: {
  onClick: () => void
  variant?: "default" | "danger" | "success"
  children: React.ReactNode
}) {
  const cls = {
    default: "border-border bg-secondary text-foreground hover:bg-muted",
    danger:  "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
    success: "border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20",
  }[variant]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[12px] font-medium transition-colors",
        cls,
      )}
    >
      {children}
    </button>
  )
}

// ─── UsersTable ───────────────────────────────────────────────────────────────

export type UserRow = {
  id: string
  name: string | null
  email: string
  phone: string | null
  role: string
  status: string
  createdAt: Date | string
  driverProfile?: { driverStatus: string; rating: number; totalTrips: number } | null
}

interface UsersTableProps {
  users: UserRow[]
  onSuspend: (id: string) => void
  onReactivate: (id: string) => void
  onUpgradeToDriver: (id: string) => void
  loading?: boolean
}

export function UsersTable({
  users,
  onSuspend,
  onReactivate,
  onUpgradeToDriver,
  loading = false,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-secondary">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Name / Email
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Driver info
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Joined
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <SkeletonRows cols={7} />
          ) : users.length === 0 ? (
            <EmptyRow cols={7} message="No users found." />
          ) : (
            users.map((u, i) => (
              <tr key={u.id} className={cn(i % 2 === 0 ? "bg-card" : "bg-secondary/30")}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                  <p className="text-[12px] text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3">
                  {u.driverProfile ? (
                    <div className="space-y-0.5">
                      <StatusBadge status={u.driverProfile.driverStatus} />
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        ⭐ {u.driverProfile.rating.toFixed(1)} · {u.driverProfile.totalTrips} trips
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.status === "active" ? (
                      <ActionButton variant="danger" onClick={() => onSuspend(u.id)}>
                        <UserX className="h-3 w-3" /> Suspend
                      </ActionButton>
                    ) : (
                      <ActionButton variant="success" onClick={() => onReactivate(u.id)}>
                        <UserCheck className="h-3 w-3" /> Reactivate
                      </ActionButton>
                    )}
                    {u.role === "customer" && (
                      <ActionButton onClick={() => onUpgradeToDriver(u.id)}>
                        <ArrowUpCircle className="h-3 w-3" /> Make driver
                      </ActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── DriversTable ─────────────────────────────────────────────────────────────

export type DriverRow = {
  id: string
  name: string | null
  email: string
  driverProfile: {
    id: string
    driverStatus: string
    rating: number
    totalTrips: number
    isOnline: boolean
    displayName: string | null
  }
  availability?: { status: string; currentBookingId: string | null } | null
}

interface DriversTableProps {
  drivers: DriverRow[]
  onApprove: (id: string) => void
  onAssign?: (id: string) => void
  loading?: boolean
}

export function DriversTable({
  drivers,
  onApprove,
  onAssign,
  loading = false,
}: DriversTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-secondary">
            {["Name", "Status", "Rating", "Trips", "Online", "Availability", "Actions"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <SkeletonRows cols={7} />
          ) : drivers.length === 0 ? (
            <EmptyRow cols={7} message="No drivers found." />
          ) : (
            drivers.map((d, i) => (
              <tr key={d.id} className={cn(i % 2 === 0 ? "bg-card" : "bg-secondary/30")}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">
                    {d.driverProfile.displayName ?? d.name ?? "—"}
                  </p>
                  <p className="text-[12px] text-muted-foreground">{d.email}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.driverProfile.driverStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">
                      {d.driverProfile.rating.toFixed(1)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{d.driverProfile.totalTrips}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[12px] font-medium",
                      d.driverProfile.isOnline ? "text-green-500" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        d.driverProfile.isOnline ? "bg-green-500" : "bg-muted-foreground/40",
                      )}
                    />
                    {d.driverProfile.isOnline ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {d.availability ? (
                    <span>
                      {d.availability.status}
                      {d.availability.currentBookingId && (
                        <span className="ml-1 text-[11px] text-muted-foreground/60">
                          (on trip)
                        </span>
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {d.driverProfile.driverStatus === "pending" && (
                      <ActionButton variant="success" onClick={() => onApprove(d.id)}>
                        <CheckCircle className="h-3 w-3" /> Approve
                      </ActionButton>
                    )}
                    {onAssign && (
                      <ActionButton onClick={() => onAssign(d.id)}>
                        <MoreHorizontal className="h-3 w-3" /> Assign
                      </ActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── BookingsTable ────────────────────────────────────────────────────────────

export type BookingRow = {
  id: string
  reference: string
  status: string
  dateTime: Date | string
  pickupAddress: string
  dropoffAddress: string
  estimatedPrice: number
  finalPrice: number | null
  customer: { name: string | null; email: string }
  driver?: { name: string | null } | null
}

interface BookingsTableProps {
  bookings: BookingRow[]
  onAssignDriver: (bookingId: string) => void
  loading?: boolean
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:     "bg-green-500/15 text-green-500",
    confirmed:     "bg-blue-500/15 text-blue-500",
    cancelled:     "bg-red-500/15 text-red-500",
    in_progress:   "bg-primary/15 text-primary",
    driver_assigned:   "bg-purple-500/15 text-purple-500",
    driver_on_the_way: "bg-purple-500/15 text-purple-500",
    arrived:       "bg-yellow-500/15 text-yellow-600",
  }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap", map[status] ?? "bg-muted text-muted-foreground")}>
      {status.replace(/_/g, " ")}
    </span>
  )
}

export function BookingsTable({
  bookings,
  onAssignDriver,
  loading = false,
}: BookingsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-secondary">
            {["Ref", "Date", "Status", "Customer", "Driver", "Price", "Actions"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <SkeletonRows cols={7} />
          ) : bookings.length === 0 ? (
            <EmptyRow cols={7} message="No bookings found." />
          ) : (
            bookings.map((b, i) => {
              const unassigned = !b.driver && b.status === "confirmed"
              return (
                <tr key={b.id} className={cn(i % 2 === 0 ? "bg-card" : "bg-secondary/30")}>
                  <td className="px-4 py-3 font-mono text-[12px] font-medium text-foreground">
                    {b.reference}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(b.dateTime)}
                  </td>
                  <td className="px-4 py-3">
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{b.customer.name ?? "—"}</p>
                    <p className="text-[12px] text-muted-foreground">{b.customer.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {b.driver?.name ? (
                      <span className="text-foreground">{b.driver.name}</span>
                    ) : (
                      <span className="text-muted-foreground/50">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {b.finalPrice != null
                      ? formatZAR(b.finalPrice)
                      : `R ${b.estimatedPrice.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-3">
                    {unassigned && (
                      <ActionButton
                        variant="success"
                        onClick={() => {
                          setExpandedId(expandedId === b.id ? null : b.id)
                          onAssignDriver(b.id)
                        }}
                      >
                        Assign Driver
                      </ActionButton>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
