"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import {
  CheckCircle,
  Search,
  Filter,
  Star,
  CarFront,
  Phone as PhoneIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { approveDriver, suspendUser, reactivateUser } from "@/actions/admin"
import { IconInput, IconSelect } from "@/components/ui-icon"

export interface DriverRow {
  id: string
  name: string | null
  email: string
  phone: string | null
  status: string
  driverProfile: {
    id: string
    driverStatus: string
    rating: number
    totalTrips: number
    isOnline: boolean
    displayName: string | null
  }
  availability: { status: string; currentBookingId: string | null } | null
}

interface Props {
  drivers: DriverRow[]
}

export function DriversClient({ drivers }: Props) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "suspended"
  >("all")
  const [pendingId, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return drivers.filter((d) => {
      if (statusFilter === "suspended") {
        if (d.status !== "suspended") return false
      } else if (statusFilter !== "all") {
        if (d.driverProfile.driverStatus !== statusFilter) return false
      }
      if (!q) return true
      return (
        d.email.toLowerCase().includes(q) ||
        (d.name ?? "").toLowerCase().includes(q) ||
        (d.driverProfile.displayName ?? "").toLowerCase().includes(q) ||
        (d.phone ?? "").toLowerCase().includes(q)
      )
    })
  }, [drivers, query, statusFilter])

  function runAction(
    id: string,
    fn: () => Promise<{ ok: true } | { error: string }>,
  ) {
    setActiveId(id)
    startTransition(async () => {
      try {
        const r = await fn()
        if ("error" in r) toast.error(r.error)
        else toast.success("Done")
      } finally {
        setActiveId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-2">
        <IconInput
          icon={Search}
          label="Search drivers"
          placeholder="Name, email or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <IconSelect
          icon={Filter}
          label="Status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as
                | "all"
                | "pending"
                | "approved"
                | "rejected"
                | "suspended",
            )
          }
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended (account)</option>
        </IconSelect>
      </div>

      <p className="px-1 text-[12px] text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        of {drivers.length}
      </p>

      <ul className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-[13px] text-muted-foreground">
            No drivers match your filters.
          </li>
        ) : (
          filtered.map((d) => {
            const busy = activeId === d.id && pendingId
            const isAccountActive = d.status === "active"
            const profileStatus = d.driverProfile.driverStatus
            return (
              <li
                key={d.id}
                className={cn(
                  "rounded-2xl border border-border bg-card p-4 transition-opacity",
                  busy && "opacity-60",
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-foreground">
                      {d.driverProfile.isOnline && (
                        <span
                          aria-label="Online"
                          className="inline-block h-2 w-2 rounded-full bg-emerald-500"
                        />
                      )}
                      {d.driverProfile.displayName ?? d.name ?? "—"}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {d.email}
                    </p>
                    {d.phone && (
                      <p className="flex items-center gap-1 truncate text-[12px] text-muted-foreground">
                        <PhoneIcon className="h-3 w-3" />
                        {d.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <DriverStatusBadge status={profileStatus} />
                    <AccountStatusBadge status={d.status} />
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-secondary p-2 text-center text-[11px]">
                  <span className="flex flex-col items-center">
                    <span className="flex items-center gap-0.5 font-semibold text-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                      {d.driverProfile.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Rating
                    </span>
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="flex items-center gap-0.5 font-semibold text-foreground">
                      <CarFront className="h-3 w-3" />{" "}
                      {d.driverProfile.totalTrips}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Trips
                    </span>
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="font-semibold text-foreground">
                      {d.availability?.status ?? "—"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Now
                    </span>
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {profileStatus === "pending" && (
                    <ActionPill
                      icon={CheckCircle}
                      tone="success"
                      disabled={!!busy}
                      onClick={() =>
                        runAction(d.id, () => approveDriver(d.driverProfile.id))
                      }
                    >
                      Approve driver
                    </ActionPill>
                  )}

                  {isAccountActive ? (
                    <ActionPill
                      icon={CheckCircle}
                      tone="danger"
                      disabled={!!busy}
                      onClick={() =>
                        runAction(d.id, () =>
                          suspendUser(d.id, "Suspended by admin"),
                        )
                      }
                    >
                      Suspend account
                    </ActionPill>
                  ) : (
                    <ActionPill
                      icon={CheckCircle}
                      tone="success"
                      disabled={!!busy}
                      onClick={() => runAction(d.id, () => reactivateUser(d.id))}
                    >
                      Reactivate
                    </ActionPill>
                  )}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DriverStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-destructive/10 text-destructive",
    suspended: "bg-destructive/10 text-destructive",
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  )
}

function AccountStatusBadge({ status }: { status: string }) {
  if (status === "active") return null
  return (
    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
      {status}
    </span>
  )
}

function ActionPill({
  icon: Icon,
  children,
  onClick,
  disabled,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: "default" | "danger" | "success"
}) {
  const cls = {
    default: "border-border bg-secondary text-foreground hover:bg-muted",
    danger:
      "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400",
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "tap inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50",
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  )
}
